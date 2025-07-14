// server/plugins/redis.ts
import {createClient} from "redis";
import logger from "~/server/utils/logger";

export default defineNitroPlugin(async (nitroApp) => {
    const client = createClient({
        url: useRuntimeConfig().REDIS_URL as string
    });
    try {
        await client.connect();
        logger.info("Redis connection established successfully");
    } catch (error) {
        logger.error(`Redis connection error: ${error}`);
        throw new Error("Failed to connect to Redis");
    }

    nitroApp.redis = client;
});
