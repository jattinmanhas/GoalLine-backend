import { Router } from "express";
import { checkPassportJWT, getCompleteUserDetails, getUserAddressDetails, getUserDetailsFromToken, googleLoginForUser, renewRefreshToken, updateUserDetailsWithAddress, userLogin, userLogout, userRegistration } from "../../../controllers/user/auth/auth.controller";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { LoginSchema, RegistrationSchema } from "../../../utils/validation/userValidation";
import passport from "passport";
import { roleBasedPassportStrategy } from "../../../middleware/authMiddleware";
import { singleFileUpload } from "../../../middleware/fileUpload";

export const userAuthRoute = Router();

userAuthRoute.post('/login', validateRequest(LoginSchema), userLogin);
userAuthRoute.post('/register', validateRequest(RegistrationSchema), userRegistration);
userAuthRoute.post('/getTokenDetails', getUserDetailsFromToken);
userAuthRoute.post('/refreshToken', renewRefreshToken);
userAuthRoute.get('/checkJWT', roleBasedPassportStrategy , checkPassportJWT)
userAuthRoute.post("/logout", userLogout);
userAuthRoute.post("/google", googleLoginForUser)
userAuthRoute.get("/userDetails/:userId", getCompleteUserDetails);
userAuthRoute.get("/userAddress/:userId", getUserAddressDetails);
userAuthRoute.put("/updateUser", singleFileUpload("image"),updateUserDetailsWithAddress);