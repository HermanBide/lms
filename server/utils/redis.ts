import { Redis } from "ioredis";
import dotenv from "dotenv"
dotenv.config()
// require("dotenv").config();

const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log("Redis is connected");
    return process.env.REDIS_URL;
  }
  throw new Error("Redis is not connected");
};

export const redis = new Redis(redisClient());
