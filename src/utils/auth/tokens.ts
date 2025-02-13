import { sign } from "jsonwebtoken";
import { UserPayload } from "../../types/index.types";

export const generateAccessToken = async(user: UserPayload) => {
  const JWT_SECRET = process.env.ACCESS_SECRET!;

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    roleId: user.roleId,
  };

  const token = await sign(payload, JWT_SECRET!, {
    expiresIn: "15m",
  });

  return token;
}

export const generateRefreshToken = async(user: UserPayload) => {
  const REFRESH_SECRET = process.env.REFRESH_SECRET;

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    roleId: user.roleId,
  };

  const refreshToken = await sign(payload, REFRESH_SECRET!, {
    expiresIn: "1d",
  });

  return refreshToken;
}

