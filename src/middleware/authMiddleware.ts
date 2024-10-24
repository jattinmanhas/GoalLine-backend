import { NextFunction, Request, Response } from "express";
import { decode } from "jsonwebtoken";
import { ApiError } from "../utils/handlers/apiError";
import { asyncHander } from "../utils/handlers/asyncHander";
import { UserPayload } from "../types/index.types";
import passport from "passport";
import { Role } from "@prisma/client";

export const roleBasedPassportStrategy = asyncHander(async(req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if(!token){
        throw new ApiError(400, "Not able to find token");
    }

    const decoded = decode(token) as UserPayload;

    if(decoded.role === Role.ADMIN){
        passport.authenticate('jwt-admin',{ session: false })(req, res, next);
    }else if(decoded.role === Role.USER){
        console.log('inside user');
        passport.authenticate('jwt-user', {session: false})(req, res, next);
    }

})