import transactions from "~/server/model/transactions";
import jwt from "jsonwebtoken";
import Users from "~/server/model/users";
import logger from "~/server/utils/logger";

export default defineEventHandler(async (events) => {
  try {
    const runTimeConfig = useRuntimeConfig();
    const header = getHeader(events, "Authorization");
    const token = header?.split(" ")[1];
    if (!token) {
      setResponseStatus(events, 401);
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
      setResponseStatus(events, 401);
      return {
        statusCode: 401,
        body: { message: "Unauthorized" },
      };
    }
    const decoded = jwt.decode(token) as { email: string; name: string };
    const user = await Users.findOne({ email: decoded.email, token: {
        $in: [token]
      } });
    if (!user) {
      setResponseStatus(events, 401);
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
    }>(events);
    if (!body) {
      setResponseStatus(events, 400);
      return {
        statusCode: 400,
        body: { message: "Bad request" },
      };
    }
    const { amount, type, description, createdAt } = body;
    const transaction = new transactions({
      user: user.id,
      amount,
      type,
      description,
      createdAt,
    });
    await transaction.save();
    setResponseStatus(events, 201);
    return {
      statusCode: 201,
      body: { message: "Transaction created successfully" },
    };
  } catch (error) {
    // Log the error for debugging purposes
    logger.error(`Error in creating transaction: ${error}`);
    // If the error is a JWT error, set status to 401
    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError") {
        setResponseStatus(events, 401);
        return {
          statusCode: 401,
          message: "Unauthorized: Invalid token",
        }
      } else if (error.name === "TokenExpiredError") {
        setResponseStatus(events, 401);
        return {
          statusCode: 401,
          message: "Unauthorized: Token expired",
        }
      } else {
        setResponseStatus(events, 500);
        return {
          statusCode: 500,
          message: `Internal Server Error: ${error.message}`,
        }
      }
    } else {
      setResponseStatus(events, 500);
      return {
        statusCode: 500,
        message: "Internal Server Error",
      }
    }
  }
});
