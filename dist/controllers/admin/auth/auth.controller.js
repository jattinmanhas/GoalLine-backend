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
exports.getAllUsersCount = exports.getAllUsers = exports.register = exports.login = void 0;
const asyncHander_1 = require("../../../utils/handlers/asyncHander");
const auth_services_1 = require("../../../services/auth.services");
const client_1 = require("@prisma/client");
const common_1 = require("../../../utils/common");
const redisClient_1 = __importDefault(require("../../../config/redisClient"));
const apiError_1 = require("../../../utils/handlers/apiError");
const apiResponse_1 = require("../../../utils/handlers/apiResponse");
exports.login = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    let mail = false;
    if (!username && email) {
        mail = true;
        const emailExist = yield (0, common_1.emailExists)(email);
        if (!emailExist) {
            throw new apiError_1.ApiError(404, "User not found ...");
        }
    }
    else if (username && !email) {
        const usernameExist = yield (0, common_1.usernameExists)(username);
        if (!usernameExist) {
            throw new apiError_1.ApiError(404, "User not found ...");
        }
    }
    else {
        throw new apiError_1.ApiError(404, "Username and Email Not found...");
    }
    const user = yield (0, auth_services_1.loginServiceforAdmin)(mail ? email : username, password, client_1.Role.ADMIN, mail);
    if (user.flag) {
        return res.status(400).json({ message: user.message });
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
        .json(new apiResponse_1.ApiResponse(200, user, "Admin Login Success"));
}));
/**
 * @description : user registration
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
 */
exports.register = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const fullname = req.body.fullname;
    const usernameExist = yield (0, common_1.usernameExists)(username);
    if (usernameExist) {
        return res.status(400).json({ message: "Username Already Exists..." });
    }
    const emailExist = yield (0, common_1.emailExists)(email);
    if (emailExist) {
        return res.status(400).json({ message: "Email already exists..." });
    }
    const user = yield (0, auth_services_1.createUser)(username, email, password, fullname, client_1.Role.ADMIN);
    if (user.flag) {
        return res.status(400).json({ message: user.message });
    }
    const userAuth = yield (0, auth_services_1.createUserAuthSettings)((_a = user.data) === null || _a === void 0 ? void 0 : _a.id);
    if (userAuth.flag) {
        return res.status(400).json({ message: userAuth.message });
    }
    return res
        .status(200)
        .json({ data: user.data, message: "ADMIN User created successfully..." });
}));
exports.getAllUsers = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, auth_services_1.getAllUsersService)();
    if (users.flag) {
        throw new apiError_1.ApiError(400, users.message);
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, users.data, users.message));
}));
exports.getAllUsersCount = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userCount = yield (0, auth_services_1.getAllUsersCountService)();
    if (userCount.flag) {
        throw new apiError_1.ApiError(400, userCount.message);
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, userCount.data, userCount.message));
}));
