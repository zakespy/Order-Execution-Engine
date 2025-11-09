import "@fastify/websocket";

declare module "fastify" {
  interface FastifyInstance {
    get: FastifyInstance["get"];
  }
}
