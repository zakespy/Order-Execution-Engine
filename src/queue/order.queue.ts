import {Queue} from 'bullmq';
import { redisClient } from "../db/redis.js";

export const orderQueue = new Queue("orders",{
    // connection: {
    //     host: "127.0.0.1",
    //     port: 6379,
    //   },
    connection : redisClient
})