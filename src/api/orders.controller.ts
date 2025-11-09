// // src/api/orders.controller.ts
// import { FastifyInstance } from "fastify";
// import { redisSub } from "../db/redis.js";
// import { orderQueue } from "../queue/order.queue.js";
// import { db } from "../db/postgres.js";

// export default async function orderRoutes(fastify: FastifyInstance) {
//   fastify.post("/api/orders/execute", async (req, reply) => {
//     const order = req.body as any;
//     const orderId = "order_" + Date.now();

//     await db.order.create({
//       data: {
//         id: orderId,
//         token_in: order.tokenIn,
//         token_out: order.tokenOut,
//         amount: order.amount,
//         status: "pending",
//       },
//     });

//     await orderQueue.add("executeOrder", { orderId, order });
//     reply.code(201).send({ orderId });
//   });

//   fastify.get(
//     "/ws/orders/:orderId",
//     { websocket: true },
//     async (connection, req) => {
//       const { orderId } = req.params as { orderId: string };
//       const channel = `order:${orderId}`;
//       console.log(`🔌 WS connected for ${orderId}`);

//       try {
//         await redisSub.subscribe(channel, (message) => {
//           connection.socket.send(message);
//         });

//         connection.on("close", async () => {
//           console.log(` WS closed for ${orderId}`);
//           await redisSub.unsubscribe(channel);
//         });
//       } catch (err) {
//         console.error("WebSocket init failed:", err);
//         connection.socket.close();
//       }
//     }
//   );
// }

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
    console.log("Job added to queue:", orderId);
    reply.code(201).send({ orderId });
  });

  fastify.get(
    "/ws/orders/:orderId",
    { websocket: true },
    async (connection, req) => {
      const { orderId } = req.params as { orderId: string };
      const channel = `order:${orderId}`;
      console.log(` WS connected for ${orderId}`);

      try {
        // await redisSub.subscribe(channel, (message: string) => {
        //   connection.send(message);
        // });

        const order = await db.order.findUnique({ where: { id: orderId } });
        if (order) {
          console.log(`Sending initial order status for ${orderId}: ${order.status}`);
          connection.send(JSON.stringify({
            status: order.status,
            dex: order.dex,
            tx_hash: order.tx_hash,
            executed_price: order.executed_price,
          }));
        }


        await redisSub.subscribe(channel)
        console.log(`Subscribed to ${channel}`);


        redisSub.on("message", (ch, msg) => {
          if (ch === channel) {
            console.log(`Message from ${ch}: ${msg}`);
            connection.send(msg);
          }
        });

        connection.on("close", async () => {
          console.log(`WS closed for ${orderId}`);
          await redisSub.unsubscribe(channel);
        });
      } catch (err) {
        console.error("WebSocket init failed:", err);
        connection.close();
      }
    }
  );
}
