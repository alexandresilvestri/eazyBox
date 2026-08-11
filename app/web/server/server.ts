import { Sentry } from "./sentry";
import { serve } from "bun";
import index from "../client/index.html";
import { redis } from "./redis";

const server = serve({
  port: Number(process.env.PORT ?? 3000),
  development: process.env.NODE_ENV === "development" && {
    hmr: true,
    console: true,
  },

  routes: {
    "/": index,
    "/api/health": async () => {
      try {
        await redis.set("health:check", "1");
        return Response.json({ status: "ok", redis: "ok" });
      } catch {
        return Response.json({ status: "ok", redis: "unavailable" }, { status: 200 });
      }
    },
  },

  error(error) {
    Sentry.captureException(error);
    return new Response("Internal Server Error", { status: 500 });
  },

  fetch() {
    return new Response("Não encontrado", { status: 404 });
  },
});

