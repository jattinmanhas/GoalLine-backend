import { Role } from "@prisma/client";

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role?: Role;
  password?: string;
}

export interface Tokens {
  token: string;
  refreshToken: string;
}

export interface ReturnPayload {
  flag: boolean;
  data?: UserPayload;
  tokens?: Tokens;
  message: String;
}
