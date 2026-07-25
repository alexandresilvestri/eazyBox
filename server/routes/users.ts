import type { BunRequest } from "bun";
import { db } from "../db";
import { cached, invalidate } from "../redis";

const CACHE_PREFIX = "users:";
const LIST_CACHE_KEY = `${CACHE_PREFIX}list`;
const LIST_TTL_SECONDS = 30;

function json(data: unknown, init: ResponseInit = {}): Response {
  return Response.json(data, init);
}

export const usersRoutes = {
  async list() {
    const users = await cached(
      LIST_CACHE_KEY,
      () => db("users").select("*").orderBy("id", "asc"),
      LIST_TTL_SECONDS
    );
    return json(users);
  },

  async getById(req: BunRequest<"/api/users/:id">) {
    const { id } = req.params;
    const user = await cached(
      `${CACHE_PREFIX}${id}`,
      () => db("users").where({ id }).first(),
      LIST_TTL_SECONDS
    );
    if (!user) return json({ error: "Usuário não encontrado" }, { status: 404 });
    return json(user);
  },

  async create(req: BunRequest) {
    const body = await req.json().catch(() => null);
    if (!body?.name || !body?.email) {
      return json({ error: "Campos 'name' e 'email' são obrigatórios" }, { status: 400 });
    }

    try {
      const [user] = await db("users")
        .insert({ name: body.name, email: body.email })
        .returning("*");
      await invalidate(CACHE_PREFIX);
      return json(user, { status: 201 });
    } catch (err: any) {
      if (err?.code === "23505") {
        return json({ error: "Já existe um usuário com esse e-mail" }, { status: 409 });
      }
      return json({ error: "Erro ao criar usuário" }, { status: 500 });
    }
  },

  async update(req: BunRequest<"/api/users/:id">) {
    const { id } = req.params;
    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Corpo da requisição inválido" }, { status: 400 });

    const [user] = await db("users")
      .where({ id })
      .update({ ...body, updated_at: db.fn.now() })
      .returning("*");

    if (!user) return json({ error: "Usuário não encontrado" }, { status: 404 });
    await invalidate(CACHE_PREFIX);
    return json(user);
  },

  async remove(req: BunRequest<"/api/users/:id">) {
    const { id } = req.params;
    const deleted = await db("users").where({ id }).del();
    if (!deleted) return json({ error: "Usuário não encontrado" }, { status: 404 });
    await invalidate(CACHE_PREFIX);
    return new Response(null, { status: 204 });
  },
};
