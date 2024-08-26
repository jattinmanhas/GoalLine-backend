import { Router } from "express";
import { getUserDetailsFromToken, renewRefreshToken, userLogin, userRegistration } from "../../../controllers/user/auth/auth.controller";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { LoginSchema, RegistrationSchema } from "../../../utils/validation/userValidation";

export const userAuthRoute = Router();

userAuthRoute.post('/login', validateRequest(LoginSchema), userLogin);
userAuthRoute.post('/register', validateRequest(RegistrationSchema), userRegistration);
userAuthRoute.post('/getTokenDetails', getUserDetailsFromToken);
userAuthRoute.post('/refreshToken', renewRefreshToken);