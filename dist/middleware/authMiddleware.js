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
exports.roleBasedPassportStrategy = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const apiError_1 = require("../utils/handlers/apiError");
const asyncHander_1 = require("../utils/handlers/asyncHander");
const passport_1 = __importDefault(require("passport"));
const client_1 = require("@prisma/client");
exports.roleBasedPassportStrategy = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        throw new apiError_1.ApiError(400, "Not able to find token");
    }
    const decoded = (0, jsonwebtoken_1.decode)(token);
    if (decoded.role === client_1.Role.ADMIN) {
        passport_1.default.authenticate('jwt-admin', { session: false })(req, res, next);
    }
    else if (decoded.role === client_1.Role.USER) {
        console.log('inside user');
        passport_1.default.authenticate('jwt-user', { session: false })(req, res, next);
    }
}));
