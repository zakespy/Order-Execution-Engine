import Fastify from "fastify";
import websocket from "@fastify/websocket"; 
import { orderWorker } from "./queue/worker.js";
import orderRoutes from "./api/orders.controller.js";
import { orderQueue } from "./queue/order.queue.js";

const fastify = Fastify();
fastify.register(websocket);
fastify.register(orderRoutes);

fastify.listen({ port: 3000 }, () => {
  console.log(" Server running at http://localhost:3000");
});
