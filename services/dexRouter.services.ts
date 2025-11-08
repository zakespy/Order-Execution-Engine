import {sleep , generateMockTxHash } from "../utils/helpers";

const basePrice = 100

class MockDexRouter {

    async getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number) {
      await sleep(200);
      return {
        price: basePrice * (0.98 + Math.random() * 0.04),
        fee: 0.003,
      };
    }
  
    async getMeteorQuote(tokenIn: string, tokenOut: string, amount: number) {
      await sleep(200);
      return {
        price: basePrice * (0.97 + Math.random() * 0.05),
        fee: 0.002,
      };
    }
  
    async executeSwap(dex: string, order: any) {
      const finalPrice = order.bestPrice;
      await sleep(2000 + Math.random() * 1000);
      return {
        txHash: generateMockTxHash(),
        executedPrice: finalPrice,
      };
    }
  }
  
export {MockDexRouter};