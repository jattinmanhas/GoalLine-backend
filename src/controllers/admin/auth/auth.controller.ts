import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import { createUser, emailExists, usernameExists } from "../../../services/auth.services";
import { Role } from "@prisma/client";

export const login = asyncHander(async (req: Request, res: Response) => {
    console.log("inside login");
})

/**
 * @description : user registration
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
 */

export const register = asyncHander(async(req: Request, res: Response) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const fullname = req.body.fullname;
    const mobileNo = req.body.mobileNo;

    const usernameExist: boolean = await usernameExists(username);
    if(usernameExist){
        return res.status(400).json({message: "Username Already Exists..."});
    }
    const emailExist: boolean = await emailExists(email);
    if(emailExist){
        return res.status(400).json({message: "Email already exists..."});
    }

    const user = await createUser(username, email, password, fullname, Role.ADMIN);

    if(!user){
        return res.status(400).json({message: "Failed to create User..."});
    }

    return res.status(200).json({message: "User created successfully..."});
})