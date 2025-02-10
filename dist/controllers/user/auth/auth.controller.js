"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAddressDetails = exports.updateUserDetailsWithAddress = exports.getCompleteUserDetails = exports.googleLoginForUser = exports.userLogout = exports.checkPassportJWT = exports.renewRefreshToken = exports.getUserDetailsFromToken = exports.userRegistration = exports.userLogin = void 0;
const asyncHander_1 = require("../../../utils/handlers/asyncHander");
const auth_services_1 = require("../../../services/auth.services");
const client_1 = require("@prisma/client");
const common_1 = require("../../../utils/common");
const apiError_1 = require("../../../utils/handlers/apiError");
const apiResponse_1 = require("../../../utils/handlers/apiResponse");
const redisClient_1 = __importDefault(require("../../../config/redisClient"));
const jsonwebtoken_1 = require("jsonwebtoken");
const s3Service_1 = require("../../../services/s3Service");
exports.userLogin = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    let mail = false;
    if (!username && email) {
        mail = true;
        const emailExist = yield (0, common_1.emailExists)(email);
        if (!emailExist) {
            throw new apiError_1.ApiError(404, "User not found");
        }
    }
    else if (username && !email) {
        const usernameExist = yield (0, common_1.usernameExists)(username);
        if (!usernameExist) {
            throw new apiError_1.ApiError(404, "User not found");
        }
    }
    else {
        throw new apiError_1.ApiError(404, "Username and Email not found");
    }
    const user = yield (0, auth_services_1.loginServiceForUser)(mail ? email : username, password, client_1.Role.USER, mail);
    if (user.flag) {
        throw new apiError_1.ApiError(400, user.message);
    }
    // set tokens to the cookies
    const refreshToken = (_a = user.tokens) === null || _a === void 0 ? void 0 : _a.refreshToken;
    const userId = (_b = user.data) === null || _b === void 0 ? void 0 : _b.id;
    if (refreshToken && userId) {
        yield redisClient_1.default.set(userId, refreshToken, {
            EX: 86400,
        });
    }
    else {
        throw new apiError_1.ApiError(400, "User ID not Found in the Database...");
    }
    if ("tokens" in user && user.tokens) {
        delete user.tokens.refreshToken;
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, user, "Login Successful..."));
}));
exports.userRegistration = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const fullname = req.body.fullname;
    const usernameExist = yield (0, common_1.usernameExists)(username);
    if (usernameExist) {
        throw new apiError_1.ApiError(400, "Username Already Exists...");
    }
    const emailExist = yield (0, common_1.emailExists)(email);
    if (emailExist) {
        throw new apiError_1.ApiError(400, "Email Already Exists");
    }
    const user = yield (0, auth_services_1.createUser)(username, email, password, fullname, client_1.Role.USER);
    if (user.flag) {
        throw new apiError_1.ApiError(400, user.message);
    }
    const userAuth = yield (0, auth_services_1.createUserAuthSettings)((_a = user.data) === null || _a === void 0 ? void 0 : _a.id);
    if (userAuth.flag) {
        throw new apiError_1.ApiError(400, userAuth.message);
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, req.body, "New User Created Successfully..."));
}));
exports.getUserDetailsFromToken = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        throw new apiError_1.ApiError(401, "No Token Found");
    }
    const user = yield (0, auth_services_1.getUserFromToken)(token, process.env.CLIENT_SECRET);
    if (!user) {
        throw new apiError_1.ApiError(401, "Invalid Token");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, user, "User Details Verified Successfully..."));
}));
exports.renewRefreshToken = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tokenId = req.body.refreshId;
    if (!tokenId) {
        throw new apiError_1.ApiError(404, "Token Id not Found");
    }
    const refreshToken = yield redisClient_1.default.get(tokenId);
    if (!refreshToken) {
        throw new apiError_1.ApiError(401, "No Refresh Token Found");
    }
    const user = (0, jsonwebtoken_1.decode)(refreshToken);
    const data = yield (0, auth_services_1.renewTokens)(user);
    const newRefreshToken = (_a = data.tokens) === null || _a === void 0 ? void 0 : _a.refreshToken;
    const userId = (_b = data.data) === null || _b === void 0 ? void 0 : _b.id;
    if (newRefreshToken && userId) {
        yield redisClient_1.default.set(userId, refreshToken, {
            EX: 86400,
        });
    }
    else {
        throw new apiError_1.ApiError(400, "User ID not Found in the Database...");
    }
    if (data.flag) {
        throw new apiError_1.ApiError(401, data.message);
    }
    if ("tokens" in data && data.tokens) {
        delete data.tokens.refreshToken;
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, data, data.message));
}));
exports.checkPassportJWT = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, "", "JWT USER TOKEN Success"));
}));
exports.userLogout = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const key = req.body.value;
    if (!key) {
        throw new apiError_1.ApiError(400, "Failed to find UserId to logout.");
    }
    yield redisClient_1.default.del(key);
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, null, "User Logout Success..."));
}));
exports.googleLoginForUser = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const email = req.body.email;
    const name = req.body.name;
    const password = "";
    let userData = yield (0, auth_services_1.getUser)(email, false, "email", client_1.Role.USER);
    if (!userData) {
        let username = email.split("@")[0];
        const user = yield (0, auth_services_1.createUser)(username, email, password, name, client_1.Role.USER);
        if (user.flag) {
            throw new apiError_1.ApiError(400, "Failed to create New user");
        }
    }
    const user = yield (0, auth_services_1.loginServiceForUser)(email, password, client_1.Role.USER, true, true);
    if (user.flag) {
        throw new apiError_1.ApiError(400, user.message);
    }
    // set tokens to the cookies
    const refreshToken = (_a = user.tokens) === null || _a === void 0 ? void 0 : _a.refreshToken;
    const userId = (_b = user.data) === null || _b === void 0 ? void 0 : _b.id;
    if (refreshToken && userId) {
        yield redisClient_1.default.set(userId, refreshToken, {
            EX: 86400,
        });
    }
    else {
        throw new apiError_1.ApiError(400, "User ID not Found in the Database...");
    }
    if ("tokens" in user && user.tokens) {
        delete user.tokens.refreshToken;
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, user, "Login Successful..."));
}));
exports.getCompleteUserDetails = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    if (!userId) {
        throw new apiError_1.ApiError(404, "User Id Not Found...");
    }
    const userDetails = yield (0, auth_services_1.getCompleteUserDetailsService)(userId);
    if (userDetails.flag) {
        throw new apiError_1.ApiError(400, userDetails.message);
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, userDetails.data, userDetails.message));
}));
exports.updateUserDetailsWithAddress = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body.data;
    const convertedUserData = JSON.parse(userData);
    console.log(convertedUserData);
    if (convertedUserData.email == "") {
        throw new apiError_1.ApiError(400, "Email cannot be emtpy");
    }
    if (convertedUserData.fullname == "") {
        throw new apiError_1.ApiError(400, "Full Name cannot be emtpy");
    }
    console.log(convertedUserData);
    let etag = "";
    let filename = "";
    if (req.file) {
        const fileKey = yield (0, s3Service_1.uploadFileToS3)(req.file, "user");
        etag = fileKey.etag;
        filename = fileKey.imageName;
    }
    const userDetails = yield (0, auth_services_1.updateUserDetailsService)(convertedUserData.id, convertedUserData.email, convertedUserData.fullname, convertedUserData.mobileNo, filename);
    if (userDetails.flag) {
        throw new apiError_1.ApiError(400, userDetails.message);
    }
    let createNewAddress;
    if (convertedUserData.userAddress[0].userAddressId == -1) {
        createNewAddress = yield (0, auth_services_1.createUserAddressService)(convertedUserData.id, convertedUserData.userAddress[0].street, convertedUserData.userAddress[0].city, convertedUserData.userAddress[0].state, convertedUserData.userAddress[0].postalCode, convertedUserData.userAddress[0].country, true);
        if (createNewAddress.flag) {
            throw new apiError_1.ApiError(400, createNewAddress.message);
        }
    }
    else {
        createNewAddress = yield (0, auth_services_1.updateUserAddressService)(convertedUserData.userAddress[0].userAddressId, convertedUserData.userAddress[0].street, convertedUserData.userAddress[0].city, convertedUserData.userAddress[0].state, convertedUserData.userAddress[0].postalCode, convertedUserData.userAddress[0].country, true);
        if (createNewAddress.flag) {
            throw new apiError_1.ApiError(400, createNewAddress.message);
        }
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, userDetails.data, userDetails.message));
}));
exports.getUserAddressDetails = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    if (!userId) {
        throw new apiError_1.ApiError(404, "User Id Not Found...");
    }
    const userDetails = yield (0, auth_services_1.getUserAddressFromUserId)(userId);
    if (userDetails.flag) {
        throw new apiError_1.ApiError(400, userDetails.message);
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, userDetails.data, userDetails.message));
}));
