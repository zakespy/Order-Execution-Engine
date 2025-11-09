import {Redis} from "ioredis";

const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis(redisOptions);
export const redisPub = new Redis(redisOptions);
export const redisSub = new Redis(redisOptions);


// Optional: log connections
redisClient.on("connect", () => console.log("Redis client connected"));
redisPub.on("connect", () => console.log("Redis publisher connected"));
redisSub.on("connect", () => console.log("Redis subscriber connected"));

redisClient.on("error", (err) => console.error("Redis client error:", err));
redisPub.on("error", (err) => console.error("Redis pub error:", err));
redisSub.on("error", (err) => console.error("Redis sub error:", err));
