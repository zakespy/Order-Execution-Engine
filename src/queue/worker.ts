import {Worker} from "bullmq"
import {redisClient, redisPub} from "../db/redis.js";
import { MockDexRouter } from "../services/dexRouter.services.js";
import { db } from "../db/postgres.js";

const dex = new MockDexRouter();

export const orderWorker = new Worker("orders",async(job)=>{
    const {orderId,order} = job.data;
    const publish = (status: string,extra = {}) => redisPub.publish(
        `order:${orderId}`,
        JSON.stringify({status,timestamp: Date.now(),...extra})
    );

    try{
        await publish("pending");
        await db.order.update({where: {id: orderId},data: {status:"pending"}});

        await publish("routing");
        const raydium = await dex.getRaydiumQuote(order.tokenIn,order.tokenOut,order.amount);
        const meteora = await dex.getMeteorQuote(order.tokenIn,order.tokenOut,order.amount);

        const bestDex = raydium.price > meteora.price ? "Raydium" : "Meteora";
        const bestPrice = Math.max(raydium.price,meteora.price);
        await publish("building")

        await publish("submitted");
        const exec = await dex.executeSwap(bestDex,{bestPrice})
        await publish("confirmed",{dex: bestDex, txHash: exec.txHash, executedPrice: exec.executedPrice});

        await db.order.update({
            where: {id:orderId},
            data:{
                status:"confirmed",
                dex:bestDex,
                tx_hash:exec.txHash,
                executedPrice:exec.executedPrice,
            },
        });
    }catch(err:any){
        await publish("failed",{error:err.message});
        await db.order.update({
            where: {id:orderId},
            data:{status:"failed",
                error: err.message
            }
        })
        throw new Error(err.message)
    }
},{connection:redisClient,concurrency:5})