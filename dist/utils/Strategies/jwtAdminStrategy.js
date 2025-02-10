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
const passport_jwt_1 = require("passport-jwt");
const client_1 = require("@prisma/client");
const apiError_1 = require("../handlers/apiError");
const prisma = new client_1.PrismaClient();
const adminSecret = process.env.ADMIN_SECRET;
const ops = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: adminSecret,
};
const jwtAdminStrategy = (passport) => {
    passport.use("jwt-admin", new passport_jwt_1.Strategy(ops, (jwtPayload, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.findUnique({
                where: {
                    id: jwtPayload.id,
                    role: jwtPayload.role,
                },
            });
            if (!user) {
                return done(new apiError_1.ApiError(404, "User not found"), false);
            }
            if (user.role === "ADMIN") {
                return done(null, jwtPayload);
            }
            else {
                return done(new apiError_1.ApiError(403, "Not Authorized"), false);
            }
        }
        catch (err) {
            return done(new apiError_1.ApiError(500, "Internal Server Error"), false);
        }
    })));
};
exports.default = jwtAdminStrategy;
