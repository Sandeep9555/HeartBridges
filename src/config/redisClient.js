// config/redisClient.js
const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.log("❌ Redis Client Error", err));

module.exports = redisClient;
