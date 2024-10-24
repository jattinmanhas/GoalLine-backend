import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import {
  createUser,
  createUserAuthSettings,
  loginServiceforAdmin,
} from "../../../services/auth.services";
import { Role } from "@prisma/client";
import { usernameExists, emailExists, isEmail } from "../../../utils/common";
import client from "../../../config/redisClient";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";

export const login = asyncHander(async (req: Request, res: Response) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  let mail = false;

  if (!username && email) {
    mail = true;
    const emailExist: boolean = await emailExists(email);
    if (!emailExist) {
      throw new ApiError(404, "User not found ...");
    }
  } else if (username && !email) {
    const usernameExist: boolean = await usernameExists(username);
    if (!usernameExist) {
      throw new ApiError(404, "User not found ...");
    }
  } else {
    throw new ApiError(404, "Username and Email Not found...");
  }

  const user = await loginServiceforAdmin(
    mail ? email : username,
    password,
    Role.ADMIN,
    mail
  );
  if (user.flag) {
    return res.status(400).json({ message: user.message });
  }

  // set tokens to the cookies
  const refreshToken = user.tokens?.refreshToken;
  const userId = user.data?.id;

  if (refreshToken && userId) {
    await client.set(userId, refreshToken, {
      EX: 86400,
    });
  } else {
    throw new ApiError(400, "User ID not Found in the Database...");
  }

  if ("tokens" in user && user.tokens) {
    delete user.tokens.refreshToken;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Admin Login Success"));
});

/**
 * @description : user registration
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
 */

export const register = asyncHander(async (req: Request, res: Response) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const fullname = req.body.fullname;

  const usernameExist: boolean = await usernameExists(username);
  if (usernameExist) {
    return res.status(400).json({ message: "Username Already Exists..." });
  }
  const emailExist: boolean = await emailExists(email);
  if (emailExist) {
    return res.status(400).json({ message: "Email already exists..." });
  }

  const user = await createUser(
    username,
    email,
    password,
    fullname,
    Role.ADMIN
  );
  if (user.flag) {
    return res.status(400).json({ message: user.message });
  }

  const userAuth = await createUserAuthSettings(user.data?.id!);

  if (userAuth.flag) {
    return res.status(400).json({ message: userAuth.message });
  }

  return res
    .status(200)
    .json({ data: user.data, message: "ADMIN User created successfully..." });
});
