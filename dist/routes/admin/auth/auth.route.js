"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthRoute = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../../../controllers/admin/auth/auth.controller");
const validationMiddleware_1 = require("../../../middleware/validationMiddleware");
const userValidation_1 = require("../../../utils/validation/userValidation");
const passport_1 = __importDefault(require("passport"));
exports.adminAuthRoute = (0, express_1.Router)();
exports.adminAuthRoute.post("/login", (0, validationMiddleware_1.validateRequest)(userValidation_1.LoginSchema), auth_controller_1.login);
exports.adminAuthRoute.post("/register", (0, validationMiddleware_1.validateRequest)(userValidation_1.RegistrationSchema), auth_controller_1.register);
exports.adminAuthRoute.get("/userList", passport_1.default.authenticate("jwt-admin", { session: false }), auth_controller_1.getAllUsers);
exports.adminAuthRoute.get("/usersCount", passport_1.default.authenticate("jwt-admin", { session: false }), auth_controller_1.getAllUsersCount);
