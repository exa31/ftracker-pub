import jwt from 'jsonwebtoken'
import Transactions from '~/server/model/transactions'

export default defineEventHandler(async (events) => {
    const runTimeConfig = useRuntimeConfig()
    const body = await readBody<{ id: string }>(events)
    const { id } = body
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
    const transactions = await Transactions.findOneAndDelete({ _id: id, })
    if (!transactions) {
        console.log('not found')
        return {
            statusCode: 404,
            body: { message: 'Not Found' }
        }
    }
    return {
        status: 200,
        body: { message: 'Succes' }
    }
})