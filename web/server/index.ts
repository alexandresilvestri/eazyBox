import { serve } from "bun";
import index from "../src/index.html";
import { usersRoutes } from "./routes/users";
import { redis } from "./redis";

const server = serve({
  port: Number(process.env.PORT ?? 3000),
  development: process.env.NODE_ENV === "development" && {
    hmr: true,
    console: true,
  },

  routes: {
    // Frontend: Bun cuida do bundling do HTML/TSX/CSS automaticamente
    "/": index,

    // API REST de usuários
    "/api/users": {
      GET: usersRoutes.list,
      POST: usersRoutes.create,
    },
    "/api/users/:id": {
      GET: usersRoutes.getById,
      PUT: usersRoutes.update,
      DELETE: usersRoutes.remove,
    },

    "/api/health": async () => {
      try {
        await redis.set("health:check", "1");
        return Response.json({ status: "ok", redis: "ok" });
      } catch {
        return Response.json({ status: "ok", redis: "unavailable" }, { status: 200 });
      }
    },
  },

  fetch() {
    return new Response("Não encontrado", { status: 404 });
  },
});

console.log(`Servidor rodando em ${server.url}`);
