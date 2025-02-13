import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import {
  createUser,
  createUserAddressService,
  getCompleteUserDetailsService,
  getUser,
  getUserAddressFromUserId,
  getUserFromToken,
  loginServiceForUser,
  renewTokens,
  updateUserAddressService,
  updateUserDetailsService,
} from "../../../services/authServices/auth.services";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import client from "../../../config/redisClient";
import { decode } from "jsonwebtoken";
import { UserPayload } from "../../../types/index.types";
import { uploadFileToS3 } from "../../../services/s3Service";

export const userLogin = asyncHander(async (req: Request, res: Response) => {
  const {username, email, password} = req.body;
  
  let mail = false;

  if (!username && email) {
    mail = true;
  }

  const user = await loginServiceForUser(
    mail ? email : username,
    password  
  );

  if (user.flag) {
    throw new ApiError(400, user.message, [{ message: user.message, field: "Prisma Login User Operation" }], null);
  }

  res.cookie("access_token", user.tokens?.token, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
  });

  res.cookie("user_ref", user.data?.id, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
  });

  if (!user.data?.id || !user.tokens.refreshToken) {
    throw new ApiError(400, "User Id and Token not found", [{ message: "User Id and Token not found", field: "Prisma Login User Operation" }], null);
  }  

  await client.set(user.data?.id, user.tokens.refreshToken, {
    EX: 60 * 60 * 24,
  }); // 1 day

  const userData = {
    id: user.data.id,
    username: user.data.username,
    email: user.data.email,
    roleId: user.data.roleId,
    firstName: user.data.firstname,
    middleName: user.data.middleName,
    lastName: user.data.lastname,
   };

  return res
    .status(200)
    .json(new ApiResponse(200, userData, "Login Successful..."));
});

export const userRegistration = asyncHander(
  async (req: Request, res: Response) => {
    const {username, email, firstName, middleName, lastName, roleId, password} = req.body;

    const user = await createUser(
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      roleId
    );

    if (user.flag) {
      throw new ApiError(400, user.message, [{ message: user.message, field: "Prisma DB Operation" }], null);
    }
    
    return res
      .status(200)
      .json(new ApiResponse(200, user, "New User Created Successfully..."));
  }
);

export const logoutUser = asyncHander(async (req: Request, res: Response) => {
  const user_ref = req.cookies.user_ref;
  if (!user_ref) {
    throw new ApiError(400, "No Reference token found");
  }

  res.clearCookie("access_token");
  res.clearCookie("user_ref");

  await client.del(user_ref);

  return res.status(200).json(new ApiResponse(200, null, "User Logout Success"));
});


export const googleLoginForUser = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    // const email = req.body.email;
    // const name = req.body.name;
    // const password = "";

    // let userData = await getUser(email, false, "email", Role.USER);
    // if (!userData) {
    //   let username = email.split("@")[0];
    //   const user = await createUser(username, email, password, name, Role.USER);

    //   if (user.flag) {
    //     throw new ApiError(400, "Failed to create New user");
    //   }
    // }

    // const user = await loginServiceForUser(
    //   email,
    //   password,
    //   Role.USER,
    //   true,
    //   true
    // );
    // if (user.flag) {
    //   throw new ApiError(400, user.message);
    // }

    // // set tokens to the cookies
    // const refreshToken = user.tokens?.refreshToken;
    // const userId = user.data?.id;

    // if (refreshToken && userId) {
    //   await client.set(userId, refreshToken, {
    //     EX: 86400,
    //   });
    // } else {
    //   throw new ApiError(400, "User ID not Found in the Database...");
    // }

    // if ("tokens" in user && user.tokens) {
    //   delete user.tokens.refreshToken;
    // }

    // return res
    //   .status(200)
    //   .json(new ApiResponse(200, user, "Login Successful..."));
  }
);

export const getCompleteUserDetails = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    if (!userId) {
      throw new ApiError(404, "User Id Not Found...");
    }

    const userDetails = await getCompleteUserDetailsService(userId);

    if (userDetails.flag) {
      throw new ApiError(400, userDetails.message);
    }

    const { id } = req.user as UserPayload;
    if(id !== userId && userDetails.data?.role.name !== "ADMIN"){
      throw new ApiError(403, "Unauthorized", [{message: "Unauthorized to access other's details", field: "User Details"}], null);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, userDetails.data, userDetails.message));
  }
);

export const updateUserDetailsWithAddress = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const userData = req.body.data;
    const convertedUserData = JSON.parse(userData);
    console.log(convertedUserData);
    if (convertedUserData.email == "") {
      throw new ApiError(400, "Email cannot be emtpy");
    }

    if (convertedUserData.fullname == "") {
      throw new ApiError(400, "Full Name cannot be emtpy");
    }

    console.log(convertedUserData);

    let etag = "";
    let filename = "";

    if (req.file) {
      const fileKey = await uploadFileToS3(req.file, "user");
      etag = fileKey.etag!;
      filename = fileKey.imageName;
    }

    const userDetails = await updateUserDetailsService(
      convertedUserData.id,
      convertedUserData.email,
      convertedUserData.fullname,
      convertedUserData.mobileNo,
      filename
    );

    if (userDetails.flag) {
      throw new ApiError(400, userDetails.message);
    }

    let createNewAddress;
    if (convertedUserData.userAddress[0].userAddressId == -1) {
      createNewAddress = await createUserAddressService(
        convertedUserData.id,
        convertedUserData.userAddress[0].street,
        convertedUserData.userAddress[0].city,
        convertedUserData.userAddress[0].state,
        convertedUserData.userAddress[0].postalCode,
        convertedUserData.userAddress[0].country,
        true
      );

      if (createNewAddress.flag) {
        throw new ApiError(400, createNewAddress.message);
      }
    } else {
      createNewAddress = await updateUserAddressService(
        convertedUserData.userAddress[0].userAddressId,
        convertedUserData.userAddress[0].street,
        convertedUserData.userAddress[0].city,
        convertedUserData.userAddress[0].state,
        convertedUserData.userAddress[0].postalCode,
        convertedUserData.userAddress[0].country,
        true
      );

      if (createNewAddress.flag) {
        throw new ApiError(400, createNewAddress.message);
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, userDetails.data, userDetails.message));
  }
);

export const getUserAddressDetails = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user as UserPayload;
    
    if (!id) {
      throw new ApiError(401, "User Not logged In...");
    }

    const userDetails = await getUserAddressFromUserId(id);

    if (userDetails.flag) {
      throw new ApiError(400, userDetails.message, [{ message: userDetails.message, field: "Prisma DB Operation" }], null);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, userDetails.data, userDetails.message));
  }
);
