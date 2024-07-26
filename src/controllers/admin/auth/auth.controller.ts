import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";

export const login = asyncHander(async (req: Request, res: Response) => {
    console.log("inside login");
})

export const register = asyncHander(async(req: Request, res: Response) => {
    console.log(req.body);
})