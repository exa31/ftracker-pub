import mongoose from "mongoose";

const runtimeConfig = useRuntimeConfig();
export default defineNitroPlugin(() => {
    mongoose.connect(runtimeConfig.MONGODB_URL)
    console.log("Connected to MongoDB database");
})