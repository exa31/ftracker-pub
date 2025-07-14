import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<{ token: string }>(event);
        const decoded = jwt.decode(body.token) as { email: string; name: string };
        if (!decoded || !decoded.email) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: {message: "Invalid token"},
            };
        }
        await useNitroApp().redis.del(body.token);
        deleteCookie(event, "jwt");
        setResponseStatus(event, 200);
        return {
            statusCode: 200,
            body: {message: "Logged out"},
        };
    } catch (error) {
        logger.error(`Error in logout handler: ${error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: {message: (error as Error).message},
        };
    }
});
