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
  refreshToken?: string;
}

export interface ReturnPayload {
  flag: boolean;
  data?: UserPayload;
  tokens?: Tokens;
  message: String;
}

export type categoryInsert = {
  category_name: string;
  category_description?: string;
  imageName?: string;
  eTag?: string;
  isDeleted: Number;
  createdBy?: string;
};

export type productInsert = {
  product_name: string;
  product_description: string;
  product_price: number;
  stock: number;
  createdBy: string;
  category_id: string;
};

export type productImageMetadata = {
  product_id: string;
  imageName: string;
  etag: string;
};
