import users, { type User } from "~/server/model/users"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const body = await readBody<{ email: string, password: string }>(event)
    const user: User | null = await users.findOne({ email: body.email })
    if (user) {
        const isUserPassword = bcrypt.compareSync(body.password, user.password)
        if (isUserPassword) {
            const token = jwt.sign({ email: user.email, name: user.name }, runtimeConfig.secretJwtKey, { algorithm: 'HS384' })
            user.token.push(token)
            await user.save()
            setCookie(event, 'jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' })
            return {
                statusCode: 201,
                body: { message: 'User already exists', token }
            }
        } else {
            return {
                statusCode: 401,
                body: { message: 'Password is incorrect' }
            }
        }
    }
})