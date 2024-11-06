import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import {
  createUser,
  createUserAuthSettings,
  getCompleteUserDetailsService,
  getUser,
  getUserFromToken,
  loginServiceForUser,
  renewTokens,
} from "../../../services/auth.services";
import { Role } from "@prisma/client";
import { emailExists, usernameExists } from "../../../utils/common";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import client from "../../../config/redisClient";
import { decode } from "jsonwebtoken";
import { UserPayload } from "../../../types/index.types";

export const userLogin = asyncHander(async (req: Request, res: Response) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  let mail = false;

  if (!username && email) {
    mail = true;
    const emailExist: boolean = await emailExists(email);
    if (!emailExist) {
      throw new ApiError(404, "User not found");
    }
  } else if (username && !email) {
    const usernameExist: boolean = await usernameExists(username);
    if (!usernameExist) {
      throw new ApiError(404, "User not found");
    }
  } else {
    throw new ApiError(404, "Username and Email not found");
  }

  const user = await loginServiceForUser(
    mail ? email : username,
    password,
    Role.USER,
    mail
  );
  if (user.flag) {
    throw new ApiError(400, user.message);
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
    .json(new ApiResponse(200, user, "Login Successful..."));
});

export const userRegistration = asyncHander(
  async (req: Request, res: Response) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const fullname = req.body.fullname;

    const usernameExist: boolean = await usernameExists(username);
    if (usernameExist) {
      throw new ApiError(400, "Username Already Exists...");
    }

    const emailExist: boolean = await emailExists(email);
    if (emailExist) {
      throw new ApiError(400, "Email Already Exists");
    }

    const user = await createUser(
      username,
      email,
      password,
      fullname,
      Role.USER
    );

    if (user.flag) {
      throw new ApiError(400, user.message as string);
    }

    const userAuth = await createUserAuthSettings(user.data?.id!);

    if (userAuth.flag) {
      throw new ApiError(400, userAuth.message as string);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, req.body, "New User Created Successfully..."));
  }
);

export const getUserDetailsFromToken = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "No Token Found");
    }

    const user = await getUserFromToken(
      token,
      process.env.CLIENT_SECRET as string
    );

    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, user, "User Details Verified Successfully...")
      );
  }
);

export const renewRefreshToken = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.body.refreshId;
    if (!tokenId) {
      throw new ApiError(404, "Token Id not Found");
    }

    const refreshToken = await client.get(tokenId);

    if (!refreshToken) {
      throw new ApiError(401, "No Refresh Token Found");
    }

    const user = decode(refreshToken) as UserPayload;

    const data = await renewTokens(user);

    const newRefreshToken = data.tokens?.refreshToken;
    const userId = data.data?.id;

    if (newRefreshToken && userId) {
      await client.set(userId, refreshToken, {
        EX: 86400,
      });
    } else {
      throw new ApiError(400, "User ID not Found in the Database...");
    }

    if (data.flag) {
      throw new ApiError(401, data.message as string);
    }

    if ("tokens" in data && data.tokens) {
      delete data.tokens.refreshToken;
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data, data.message as string));
  }
);

export const checkPassportJWT = asyncHander(
  async (req: Request, res: Response) => {
    return res
      .status(200)
      .json(new ApiResponse(200, "", "JWT USER TOKEN Success"));
  }
);

export const userLogout = asyncHander(async (req: Request, res: Response) => {
  const key = req.body.refreshId.value;

  if (!key) {
    throw new ApiError(400, "Failed to find UserId to logout.");
  }

  await client.del(key);

  return res
    .status(200)
    .json(new ApiResponse(200, "", "User Logout Success..."));
});

export const googleLoginForUser = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = "";

    let userData = await getUser(email, false, "email", Role.USER);
    if (!userData) {
      let username = email.split("@")[0];
      const user = await createUser(username, email, password, name, Role.USER);

      if (user.flag) {
        throw new ApiError(400, "Failed to create New user");
      }
    }

    const user = await loginServiceForUser(
      email,
      password,
      Role.USER,
      true,
      true
    );
    if (user.flag) {
      throw new ApiError(400, user.message);
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
      .json(new ApiResponse(200, user, "Login Successful..."));
  }
);

export const getCompleteUserDetails = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    if(!userId){
      throw new ApiError(404, "User Id Not Found...");
    }

    const userDetails = await getCompleteUserDetailsService(userId);
    
    if(userDetails.flag){
      throw new ApiError(400, userDetails.message);
    }

    return res.status(200).json(new ApiResponse(200, userDetails.data, userDetails.message));
  }
);

 export const UpdateUserDetails = asyncHander(async(req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
})