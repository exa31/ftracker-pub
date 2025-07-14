import mongoose from "mongoose";
import logger from "~/server/utils/logger";

const runtimeConfig = useRuntimeConfig();
export default defineNitroPlugin(() => {
    mongoose.connect(runtimeConfig.MONGODB_URL).then(
        () => {
            logger.info("MongoDB connection established successfully");
        },
    ).catch(
        (error) => {
            logger.error("MongoDB connection error:", error);
            throw new Error("Failed to connect to MongoDB");
        }
    )
})