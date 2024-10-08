import { Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";

export const addCategory = asyncHander(async(req: Request, res: Response) => {
    res.send("Add Category from the db....");
})