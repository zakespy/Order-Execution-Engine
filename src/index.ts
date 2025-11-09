import Fastify from "fastify";
import websocket from "@fastify/websocket"; 
// import { orderWorker } from "./queue/worker.js";
import orderRoutes from "./api/orders.controller.js";
// import { orderQueue } from "./queue/order.queue.js";

const fastify = Fastify();
fastify.register(websocket);
fastify.register(orderRoutes);

// const port = Number(process.env.PORT) || 3000;
const port = Number(process.env.PORT) || 8080
const host = process.env.HOST || "0.0.0.0"; // Required for Cloud Run networking

fastify.listen({ port, host }, (err, address) => {
  if (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
