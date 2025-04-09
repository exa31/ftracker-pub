import transactions, { type Transaction } from "~/server/model/transactions";
import jwt from "jsonwebtoken";
import Users from "~/server/model/users";
import mongoose, { Types } from "mongoose";

export default defineEventHandler(async (events) => {
  try {
    const runTimeConfig = useRuntimeConfig();
    const header = getHeader(events, "Authorization");
    const token = header?.split(" ")[1];
    if (!token) {
      return {
        statusCode: 401,
        body: { message: "Unauthorized" },
      };
    }
    const isValidToken = jwt.verify(
      token,
      runTimeConfig.secretJwtKey as string
    );
    if (!isValidToken) {
      return {
        statusCode: 401,
        body: { message: "Unauthorized" },
      };
    }
    const decoded = jwt.decode(token) as { email: string; name: string };
    const user = await Users.findOne({ email: decoded.email });
    if (!user) {
      return {
        statusCode: 401,
        body: { message: "Unauthorized" },
      };
    }
    const body = await readBody<{
      amount: number;
      type: string;
      description: string;
      createdAt?: string;
      _id: string;
    }>(events);
    if (!body) {
      setResponseStatus(events, 400);
      return {
        statusCode: 400,
        body: { message: "Bad request" },
      };
    }
    const { amount, type, description, createdAt, _id } = body;
    const transaction = await transactions.findOne({ _id });
    if (!transaction) {
      setResponseStatus(events, 404);
      return {
        statusCode: 404,
        body: { message: "Transaction not found" },
      };
    }
    if (transaction.user != user.id) {
      setResponseStatus(events, 403);
      return {
        statusCode: 403,
        body: { message: "Forbidden" },
      };
    }
    transaction.amount = amount;
    transaction.type = type;
    transaction.description = description;
    transaction.createdAt = createdAt
      ? new Date(createdAt)
      : transaction.createdAt;
    await transaction.save(); // Update the user's balance based on the transaction type
    setResponseStatus(events, 200);
    return {
      statusCode: 200,
      body: { message: "Transaction updated successfully" },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { message: (error as Error).message },
    };
  }
});
