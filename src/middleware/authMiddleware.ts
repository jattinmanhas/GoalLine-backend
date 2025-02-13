import { NextFunction, Request, Response } from "express";
import {verify} from "jsonwebtoken";
import { ApiError } from "../utils/handlers/apiError";
import { asyncHander } from "../utils/handlers/asyncHander";
import client from "../config/redisClient";
import { refreshAuthTokens } from "../services/authServices/auth.services";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_SECRET!;

export const authenticationMiddleware = asyncHander(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_token;
    const user_ref = req.cookies.user_ref;

    if(!accessToken && !user_ref){
        throw new ApiError(401, "Unauthorized", [{message: "Unauthorized", field: "Authentication Middleware"}], null);
    }

    try {
        if(accessToken){
            const payload = verify(accessToken, ACCESS_TOKEN_SECRET);
            req.user = payload;
            return next();
        }
    } catch (error) {
        throw new ApiError(401, "Unauthorized", [{message: "Access Token Invalid or Expired", field: "Authentication Middleware"}], null);
    }

    if(user_ref){
        try {
            const refreshToken = await client.get(user_ref);

            if(!refreshToken){
                throw new ApiError(401, "Unauthorized", [{message: "Refresh Token Invalid or Expired", field: "Authentication Middleware"}], null);
            }

            const tokens = await refreshAuthTokens(user_ref, refreshToken);

            res.cookie("access_token", tokens.tokens.token, {
                httpOnly: true,
                secure: false,
                sameSite: "none",
                path: "/",
                expires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
              });
            
              res.cookie("user_ref", user_ref, {
                httpOnly: true,
                secure: false,
                sameSite: "none",
                path: "/",
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
              });

              req.body = tokens.data;
              return next();

        } catch (error) {
            throw new ApiError(401, "Unauthorized", [{message: "Refresh Token Invalid or Expired", field: "Authentication Middleware"}], null);
        }
    }
})