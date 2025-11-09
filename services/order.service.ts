// src/services/order.service.ts
import { MockDexRouter } from "./dexRouter.services";

const dexRouter = new MockDexRouter();

export async function processOrder(order: any, ws: any) {
  try {
    ws.send(JSON.stringify({ status: "pending" }));

    // Step 1: Routing
    ws.send(JSON.stringify({ status: "routing" }));
    const raydium = await dexRouter.getRaydiumQuote(order.tokenIn, order.tokenOut, order.amount);
    const meteora = await dexRouter.getMeteorQuote(order.tokenIn, order.tokenOut, order.amount);

    const bestDex = raydium.price > meteora.price ? "Raydium" : "Meteora";
    const bestPrice = Math.max(raydium.price, meteora.price);
    order.bestDex = bestDex;
    order.bestPrice = bestPrice;

    // Step 2: Building transaction
    ws.send(JSON.stringify({ status: "building" }));

    // Step 3: Submitting transaction
    ws.send(JSON.stringify({ status: "submitted" }));
    const execution = await dexRouter.executeSwap(bestDex, order);

    // Step 4: Confirmed
    ws.send(
      JSON.stringify({
        status: "confirmed",
        dex: bestDex,
        txHash: execution.txHash,
        executedPrice: execution.executedPrice,
      })
    );

  } catch (err) {
    ws.send(JSON.stringify({ status: "failed", error: err.message }));
  }
}
