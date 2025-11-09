// src/api/orders.controller.ts
import { FastifyInstance } from "fastify";
import { redisSub } from "../db/redis.js";
import { orderQueue } from "../queue/order.queue.js";
import { db } from "../db/postgres.js";

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.post("/api/orders/execute", async (req, reply) => {
    const order = req.body as any;
    const orderId = "order_" + Date.now();

    await db.order.create({
      data: {
        id: orderId,
        token_in: order.tokenIn,
        token_out: order.tokenOut,
        amount: order.amount,
        status: "pending",
      },
    });

    await orderQueue.add("executeOrder", { orderId, order });
    reply.code(201).send({ orderId });
  });

  fastify.get(
    "/ws/orders/:orderId",
    { websocket: true },
    (connection, req) => {
      const { orderId } = req.params as { orderId: string };

      redisSub.subscribe(`order:${orderId}`);
      redisSub.on("message", (channel: string, message: string) => {
        connection.socket.send(message);
      });

      connection.socket.on("close", () => {
        redisSub.unsubscribe(`order:${orderId}`);
      });
    }
  );
}
