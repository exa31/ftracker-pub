import jwt from "jsonwebtoken";
import Transactions from "~/server/model/transactions";
import logger from "~/server/utils/logger";
import Users from "~/server/model/users";

export default defineEventHandler(async (events) => {
  try {

  const runTimeConfig = useRuntimeConfig();
  const body = await readBody<{ id: string }>(events);
  const { id } = body;
  const header = getHeader(events, "Authorization");
  const token = header?.split(" ")[1];
  if (!token) {
    setResponseStatus(events, 401);
    return {
      statusCode: 401,
      body: { message: "Unauthorized" },
    };
  }
  const isValidToken = jwt.verify(token, runTimeConfig.secretJwtKey as string);
  if (!isValidToken) {
    setResponseStatus(events, 401);
    return {
      statusCode: 401,
      body: { message: "Unauthorized" },
    };
  }
  const decoded = jwt.decode(token) as { email: string; name: string };
    const user = await Users.findOne({
      email: decoded.email,
        token: { $in: [token] },
    });
    if (!user) {
    setResponseStatus(events, 401);
    return {
      statusCode: 401,
      body: { message: "Unauthorized" },
    };
    }
  const transactions = await Transactions.findOneAndDelete({ _id: id });
  if (!transactions) {
    logger.error(`Transaction with id ${id} not found`);
    setResponseStatus(events, 404);
    return {
      statusCode: 404,
      body: { message: "Not Found" },
    };
  }
  setResponseStatus(events, 200);
  return {
    status: 200,
    body: { message: "Succes" },
  };
  } catch (error) {
    logger.error("Error deleting transaction:", error);
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
