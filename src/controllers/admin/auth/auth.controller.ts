import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import { createAdminUser, getAllUsersCountService, loginServiceforAdmin, getAllUsersService } from "../../../services/authServices/admin.auth.services";
import client from "../../../config/redisClient";

/**
 * @description : Admin Login
 * @param {Object} req : request for login
 * @param {Object} res : response for login
 * @return {Object} : response for login {status, message, data}
 */

export const Adminlogin = asyncHander(async (req: Request, res: Response) => {
  const {username, email, password} = req.body;
  let mail = false;

  if (!username && email) {
    mail = true;
  }

  const user = await loginServiceforAdmin(mail ? email : username, password);

  if (user.flag) {
    throw new ApiError(400, user.message, [{ message: user.message, field: "Prisma Login User Operation" }], null);
  }

  res.cookie("access_token", user.data?.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
  });

  res.cookie("user_ref", user.data?.user.id, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
  });

  if (!user.data?.user.id || !user.data.refreshToken) {
    throw new ApiError(400, "User Id and Token not found", [{ message: "User Id and Token not found", field: "Prisma Login User Operation" }], null);
  }  

  await client.set(user.data?.user.id, user.data?.refreshToken, {
    EX: 60 * 60 * 24,
  }); // 1 day

  const userData = {
    id: user.data.user.id,
    username: user.data.user.username,
    email: user.data.user.email,
    roleId: user.data.user.roleId,
    firstName: user.data.user.firstname,
    middleName: user.data.user.middleName,
    lastName: user.data.user.lastname,
   };

  return res.status(200).json(new ApiResponse(200, userData, "Admin Login Success"));
});

/**
 * @description : user registration
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
 */

export const register = asyncHander(async (req: Request, res: Response) => {
  const {username, email, firstName, middleName, lastName, roleId, password} = req.body;

  const user = await createAdminUser(username, email, password, firstName, middleName, lastName, roleId);
  if (user.flag) {
    throw new ApiError(400, user.message, [{ message: user.message, field: "Prisma DB Operation" }], null);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user.data, user.message));
});

/**
 * @description : Admin Logout
 * @param {Object} req : request for logout
 * @param {Object} res : response for logout
 * @return {Object} : response for logout {status, message, data}
 */
export const logoutAdmin = asyncHander(async (req: Request, res: Response) => {
  const user_ref = req.cookies.user_ref;
  if (!user_ref) {
    throw new ApiError(400, "No Reference token found");
  }

  res.clearCookie("access_token");
  res.clearCookie("user_ref");

  await client.del(user_ref);

  return res.status(200).json(new ApiResponse(200, null, "Admin Logout Success"));
});

/**
 * @description : Admin Get All Users
 * @param {Object} req : request to fetch all users
 * @param {Object} res : response after fetching all users
 * @return {Object} : response after fetching all users {status, message, data}
 */
export const getAllUsers = asyncHander(async (req: Request, res: Response) => {
    const users = await getAllUsersService();
    if(users.flag){
      throw new ApiError(400, users.message);
    }

    return res.status(200).json(new ApiResponse(200, users.data, users.message));
})


/**
 * @description : Admin Get All Users Count
 * @param {Object} req : request to fetch all users count
 * @param {Object} res : response after fetching all users count
 * @return {Object} : response after fetching all users count {status, message, data}
 */
export const getAllUsersCount = asyncHander(async (req: Request, res: Response) => {
    const userCount = await getAllUsersCountService();
    if(userCount.flag){
      throw new ApiError(400, userCount.message);
    }

    return res.status(200).json(new ApiResponse(200, userCount.data, userCount.message));
})