import {Queue} from 'bullmq';
import { redisClient } from "../db/redis.js";

export const orderQueue = new Queue("orders",{
    connection: redisClient
})