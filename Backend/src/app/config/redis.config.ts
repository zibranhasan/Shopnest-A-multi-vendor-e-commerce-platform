import { createClient } from "redis";
import { envVars } from "./env.js";

const redisClient = createClient({
    socket: {
        host: envVars.REDIS_HOST,
        port: Number(envVars.REDIS_PORT),
    },
    password: envVars.REDIS_PASSWORD,
});

redisClient.on("connect", () => console.log("✅ Redis Connected"));
redisClient.on("error", (err) => console.log("❌ Redis Error", err));

await redisClient.connect();

export { redisClient };

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("✅ Redis Connected (via connectRedis)");
    }
};
