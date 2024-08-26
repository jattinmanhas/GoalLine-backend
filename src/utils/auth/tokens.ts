import { sign } from "jsonwebtoken";
import { UserPayload } from "../../types/index.types";

export const generateJwtToken = async (user: UserPayload) => {
  const JWT_SECRET =
    user.role == "ADMIN" ? process.env.ADMIN_SECRET : process.env.CLIENT_SECRET;

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  const token = await sign(payload, JWT_SECRET!, {
    expiresIn: "15m",
  });

  return token;
};

export const generateRefreshToken = async (user: UserPayload) => {
  const REFRESH_SECRET =
    user.role == "ADMIN"
      ? process.env.REFRESH_ADMIN_SECRET
      : process.env.REFRESH_CLIENT_SECRET;

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  const refreshToken = await sign(payload, REFRESH_SECRET!, {
    expiresIn: "1d",
  });

  return refreshToken;
};


