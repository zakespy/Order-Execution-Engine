import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket"; 
import orderRoutes from "./api/orders.controller.js";
// import { orderWorker } from "./queue/worker";

const fastify = Fastify();
fastify.register(websocketPlugin);
fastify.register(orderRoutes);

fastify.listen({ port: 3000 }, () => {
  console.log(" Server running at http://localhost:3000");
});
