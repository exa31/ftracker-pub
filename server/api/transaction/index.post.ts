import transactions from "~/server/model/transactions"
import jwt from 'jsonwebtoken'
import Users from "~/server/model/users"

export default defineEventHandler(async (events) => {
    try {
        const runTimeConfig = useRuntimeConfig()
        const header = getHeader(events, 'Authorization')
        const token = header?.split(' ')[1]
        if (!token) {
            return {
                statusCode: 401,
                body: { message: 'Unauthorized' }
            }
        }
        const isValidToken = jwt.verify(token, runTimeConfig.secretJwtKey as string)
        if (!isValidToken) {
            return {
                statusCode: 401,
                body: { message: 'Unauthorized' }
            }
        }
        const decoded = jwt.decode(token) as { email: string, name: string }
        const user = await Users.findOne({ email: decoded.email })
        if (!user) {
            return {
                statusCode: 401,
                body: { message: 'Unauthorized' }
            }
        }
        const body = await readBody<{ amount: number, type: string, description: string, createdAt?: string }>(events)
        if (!body) {
            return {
                statusCode: 400,
                body: { message: 'Bad request' }
            }
        }
        const { amount, type, description, createdAt } = body
        const transaction = new transactions({ user: user.id, amount, type, description, createdAt })
        await transaction.save()
        return {
            statusCode: 201,
            body: { message: 'Transaction created successfully' }
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: { message: (error as Error).message }
        }
    }
})