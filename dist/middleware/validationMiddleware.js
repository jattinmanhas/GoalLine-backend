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
exports.validateRequest = void 0;
const zod_1 = require("zod");
const apiError_1 = require("../utils/handlers/apiError");
const errorHandlingMiddleware_1 = require("./errorHandlingMiddleware");
const validateRequest = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return next((0, errorHandlingMiddleware_1.errorHandlerMiddleware)(new apiError_1.ApiError(400, error.issues[0].message), req, res, next));
        }
        return next((0, errorHandlingMiddleware_1.errorHandlerMiddleware)(new apiError_1.ApiError(500, "An unexpected error occurred"), req, res, next));
    }
});
exports.validateRequest = validateRequest;
