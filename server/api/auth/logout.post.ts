import type { User } from "~/server/model/users";
import Users from "~/server/model/users";
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<{ token: string }>(event)
        const decoded = jwt.decode(body.token) as { email: string, name: string }
        const users: User | null = await Users.findOneAndUpdate({ email: decoded.email }, { $pull: { token: body.token } })
        if (!users) {
            return {
                statusCode: 404,
                body: { message: 'User not found' }
            }
        }
        deleteCookie(event, 'jwt')
        return {
            statusCode: 200,
            body: { message: 'Logged out' }
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: { message: (error as Error).message }
        }
    }
}); 