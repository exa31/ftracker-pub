import {OAuth2Client} from "google-auth-library";
import users, {type User} from "~/server/model/users";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";

interface Decoded {
    email: string;
    email_verified: boolean;
    name: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{ credential: string }>(event);
    const runTimeConfig = useRuntimeConfig();
    const client = new OAuth2Client(runTimeConfig.google.clientId);

    try {
        const decoded = await client.verifyIdToken({
            idToken: body.credential,
            audience: runTimeConfig.google.clientId,
        });
        const {email, email_verified, name} = decoded.getPayload() as Decoded;
        if (!email_verified) {
            setResponseStatus(event, 401);
            return {
                statusCode: 401,
                body: {message: "Email not verified"},
            };
        }
        const emailIsUser: User | null = await users.findOne({email: email});
        if (emailIsUser) {
            const token = jwt.sign(
                {email, name: emailIsUser.name},
                runTimeConfig.secretJwtKey,
                {algorithm: "HS384"}
            );
            const dataUser = {
                email: emailIsUser.email,
                name: emailIsUser.name,
                id: emailIsUser._id,
            };
            const dataUserString = JSON.stringify(dataUser);
            await useNitroApp().redis.set(token, dataUserString, {
                EX: 60 * 60 * 24 // expired 1 hari
            });
            setCookie(event, "jwt", token, {
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 24,
            });
            setResponseStatus(event, 201);
            return {
                statusCode: 201,
                body: {message: "User already exists", token},
            };
        } else if (!emailIsUser) {
            setResponseStatus(event, 404);
            return {
                statusCode: 404,
                body: {message: "User does not exist"},
            };
        } else {
            setResponseStatus(event, 500);
            return {
                statusCode: 500,
                body: {message: "Server error"},
            };
        }
    } catch (error) {
        logger.error(`Error during Google authentication: ${error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: {message: "Server error"},
        };
    }
});
