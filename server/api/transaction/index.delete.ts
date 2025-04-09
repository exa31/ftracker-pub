import jwt from "jsonwebtoken";
import Transactions from "~/server/model/transactions";

export default defineEventHandler(async (events) => {
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
  const transactions = await Transactions.findOneAndDelete({ _id: id });
  if (!transactions) {
    console.log("not found");
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
});
