// // src/db/redis.ts
// import { createClient } from "redis";

// // main redis clients for app logic
// export const redisClient = createClient();
// export const redisPub = createClient();
// export const redisSub = createClient();

// redisClient.on("error", (err) => console.error("Redis Client Error:", err));
// redisPub.on("error", (err) => console.error("Redis Publisher Error:", err));
// redisSub.on("error", (err) => console.error("Redis Subscriber Error:", err));

// await Promise.all([
//   redisClient.connect(),
//   redisPub.connect(),
//   redisSub.connect(),
// ]);

// console.log(" Redis clients connected");


// src/db/redis.ts
import {Redis} from "ioredis";

export const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null
});

export const redisPub = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null
});

export const redisSub = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// Optional: log connections
redisClient.on("connect", () => console.log("Redis client connected"));
redisPub.on("connect", () => console.log("Redis publisher connected"));
redisSub.on("connect", () => console.log("Redis subscriber connected"));

redisClient.on("error", (err) => console.error("Redis client error:", err));
redisPub.on("error", (err) => console.error("Redis pub error:", err));
redisSub.on("error", (err) => console.error("Redis sub error:", err));
