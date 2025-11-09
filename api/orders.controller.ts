// // src/api/orders.controller.ts
// import { processOrder } from "../services/order.service";


// fastify.post("/api/orders/execute", async (req, reply) => {
//   const order = req.body;
//   const orderId = "order_" + Date.now();

//   // Upgrade connection to WebSocket
//   const ws = reply.raw.ws;
//   processOrder(order, ws);

//   return { orderId };
// });
