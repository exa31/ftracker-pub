import type { User } from "~/server/model/users";
import Users from "~/server/model/users";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ token: string }>(event);
    const decoded = jwt.decode(body.token) as { email: string; name: string };
    const users: User | null = await Users.findOneAndUpdate(
      { email: decoded.email },
      { $pull: { token: body.token } }
    );
    if (!users) {
      setResponseStatus(event, 404);
      return {
        statusCode: 404,
        body: { message: "User not found" },
      };
    }
    deleteCookie(event, "jwt");
    setResponseStatus(event, 200);
    return {
      statusCode: 200,
      body: { message: "Logged out" },
    };
  } catch (error) {
    logger.error(`Error in logout handler: ${error}`);
    setResponseStatus(event, 500);
    return {
      statusCode: 500,
      body: { message: (error as Error).message },
    };
  }
});
