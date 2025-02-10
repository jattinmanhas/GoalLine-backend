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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateJwtToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const generateJwtToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const JWT_SECRET = user.role == "ADMIN" ? process.env.ADMIN_SECRET : process.env.CLIENT_SECRET;
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
    };
    const token = yield (0, jsonwebtoken_1.sign)(payload, JWT_SECRET, {
        expiresIn: "15m",
    });
    return token;
});
exports.generateJwtToken = generateJwtToken;
const generateRefreshToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const REFRESH_SECRET = user.role == "ADMIN"
        ? process.env.REFRESH_ADMIN_SECRET
        : process.env.REFRESH_CLIENT_SECRET;
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
    };
    const refreshToken = yield (0, jsonwebtoken_1.sign)(payload, REFRESH_SECRET, {
        expiresIn: "1d",
    });
    return refreshToken;
});
exports.generateRefreshToken = generateRefreshToken;
