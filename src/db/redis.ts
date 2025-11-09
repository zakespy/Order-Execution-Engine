import {Redis} from 'ioredis';
export const redisClient = new  Redis(); // for BullMQ
export const redisPub = new Redis(); // for publishing status
export const redisSub = new Redis(); // for subscribing to status
