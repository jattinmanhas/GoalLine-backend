import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import {
  createUser,
  createUserAuthSettings,
  emailExists,
  isEmail,
  loginServiceforAdmin,
  usernameExists,
} from "../../../services/auth.services";
import { Role } from "@prisma/client";

export const login = asyncHander(async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  let mail = false;

  if (isEmail(username)) {
    mail = true;
    const emailExist: boolean = await emailExists(username);
    if (!emailExist) {
      return res.status(404).json({ message: "User not found ..." });
    }
  } else {
    const usernameExist: boolean = await usernameExists(username);
    if (!usernameExist) {
      return res.status(400).json({ message: "User Not found..." });
    }
  }

  const user = await loginServiceforAdmin(username, password, Role.ADMIN, mail);
  if (user.flag) {
    return res.status(400).json({ message: user.message });
  }

  // set tokens to the cookies
  const token = user.tokens?.token;
  const refresnToken = user.tokens?.refreshToken;

  // Set the JWT as an HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true, // prevents JavaScript access
    secure: false, // set to true if using HTTPS
    maxAge: 15 * 60 * 1000, // 1 hour in milliseconds
  });

  res.cookie("refresh_token", refresnToken, {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });

  return res.status(200).json({message: "Successfully Logged In..."})
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
    .json({ data: user.data, message: "User created successfully..." });
});
