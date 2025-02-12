import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodEffects, ZodError } from "zod";
import { ApiError } from "../utils/handlers/apiError";
import { errorHandlerMiddleware } from "./errorHandlingMiddleware";

export const validateRequest = (schema: AnyZodObject | ZodEffects<AnyZodObject> ) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedRequest  = await schema.parseAsync(req.body);
        req.body = validatedRequest;
        next();
    } catch (error) {
        if(error instanceof ZodError){
            return next(errorHandlerMiddleware(new ApiError(400, error.issues[0].message, error.issues), req, res, next));
        }

        return next(errorHandlerMiddleware(new ApiError(500, "An unexpected error occurred", ["Zod Middleware Failed"]), req, res, next));
    }
}