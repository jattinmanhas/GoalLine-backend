import { Router } from "express";
import { getCompleteUserDetails, getUserAddressDetails, googleLoginForUser, logoutUser, updateUserDetailsWithAddress, userLogin, userRegistration } from "../../../controllers/user/auth/auth.controller";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { LoginSchema, RegistrationSchema } from "../../../utils/validation/userValidation";
import { singleFileUpload } from "../../../middleware/fileUpload";
import { authenticationMiddleware } from "../../../middleware/authMiddleware";

export const userAuthRoute = Router();

userAuthRoute.post('/login', validateRequest(LoginSchema), userLogin);
userAuthRoute.post('/register', validateRequest(RegistrationSchema), userRegistration);
userAuthRoute.post("/logout", authenticationMiddleware, logoutUser);
userAuthRoute.post("/google", googleLoginForUser)
userAuthRoute.get("/userDetails/:userId", authenticationMiddleware, getCompleteUserDetails);
userAuthRoute.get("/userAddress", authenticationMiddleware, getUserAddressDetails);
userAuthRoute.put("/updateUser", authenticationMiddleware, singleFileUpload("image"),updateUserDetailsWithAddress);