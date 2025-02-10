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
exports.getAllBlogsList = exports.getSingleBlogById = void 0;
const asyncHander_1 = require("../../../utils/handlers/asyncHander");
const apiError_1 = require("../../../utils/handlers/apiError");
const blog_services_1 = require("../../../services/blog.services");
const apiResponse_1 = require("../../../utils/handlers/apiResponse");
const redisClient_1 = __importDefault(require("../../../config/redisClient"));
exports.getSingleBlogById = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const blogId = req.params.blogId;
    const redisHashKey = `blogs`;
    if (!blogId) {
        throw new apiError_1.ApiError(404, "Blog Id not Found");
    }
    const redisFieldKey = `${blogId}`;
    const cachedData = yield redisClient_1.default.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
        console.log("cache hit");
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, JSON.parse(cachedData), "Successfully Fetched Blog from redis"));
    }
    const blog = yield (0, blog_services_1.getBlogWithSections)(blogId);
    if (blog.flag) {
        throw new apiError_1.ApiError(400, blog.message);
    }
    yield redisClient_1.default.hSet(redisHashKey, redisFieldKey, JSON.stringify(blog.data));
    yield redisClient_1.default.expire(redisHashKey, 86400);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, blog.data, blog.message));
}));
exports.getAllBlogsList = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;
    const redisHashKey = `blogs`;
    const redisFieldKey = `${skip}:${take}`;
    const cachedData = yield redisClient_1.default.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
        console.log("cache hit");
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, JSON.parse(cachedData), "Successfully Fetched Blogs from redis"));
    }
    const blog = yield (0, blog_services_1.getAllBlogsService)(skip, take);
    if (blog.flag) {
        throw new apiError_1.ApiError(400, blog.message);
    }
    yield redisClient_1.default.hSet(redisHashKey, redisFieldKey, JSON.stringify(blog.data));
    yield redisClient_1.default.expire(redisHashKey, 86400);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, blog.data, blog.message));
}));
