import { Request, Response, NextFunction } from "express";

type AsyncHander = (req: Request, res: Response, next: NextFunction) => Promise<any>

export const asyncHander = (requestHandler: AsyncHander) => async (req: Request, res: Response, next : NextFunction) =>{
    try {
        return await requestHandler(req, res, next);
    } catch (error) {
        next(error);
    }
}