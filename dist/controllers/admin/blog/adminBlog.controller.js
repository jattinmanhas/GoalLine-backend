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
exports.getAllBlogsCount = exports.uploadBlogImageToS3 = exports.createNewBlog = void 0;
const asyncHander_1 = require("../../../utils/handlers/asyncHander");
const s3Service_1 = require("../../../services/s3Service");
const apiError_1 = require("../../../utils/handlers/apiError");
const apiResponse_1 = require("../../../utils/handlers/apiResponse");
const blog_services_1 = require("../../../services/blog.services");
const redisClient_1 = __importDefault(require("../../../config/redisClient"));
exports.createNewBlog = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    console.log(req.body);
    let heading = req.body.heading;
    let description = req.body.description;
    let imageName = null;
    if (req.body.image) {
        imageName = req.body.image;
    }
    let category_id = req.body.category_id;
    let author = req.user;
    let sections = req.body.sections;
    const createBlog = yield (0, blog_services_1.createNewBlogService)(heading, description, imageName, category_id, author.id);
    if (createBlog.flag) {
        throw new apiError_1.ApiError(400, createBlog.message);
    }
    if (sections.length >= 1) {
        for (const section of sections) {
            let data = {
                id: section.id,
                heading: section.heading,
                paragraph: section.paragraph,
                order: Number(section.id),
                blogId: (_a = createBlog.data) === null || _a === void 0 ? void 0 : _a.id,
            };
            const createSection = yield (0, blog_services_1.createNewBlogSection)(data);
            if (createSection.flag) {
                throw new apiError_1.ApiError(400, createSection.message);
            }
            if (((_b = section.image) === null || _b === void 0 ? void 0 : _b.imageName) && ((_c = createSection.data) === null || _c === void 0 ? void 0 : _c.id)) {
                const createSectionImage = yield (0, blog_services_1.createNewBlogSectionImage)((_d = section.image) === null || _d === void 0 ? void 0 : _d.imageName, (_e = createSection.data) === null || _e === void 0 ? void 0 : _e.id);
                if (createSectionImage.flag) {
                    throw new apiError_1.ApiError(400, createSectionImage.message);
                }
            }
        }
    }
    yield redisClient_1.default.del("blogs");
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, createBlog.data, "New Blog Created Successfully..."));
}));
exports.uploadBlogImageToS3 = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let etag = "";
    let filename = "";
    if (!req.file) {
        throw new apiError_1.ApiError(404, "File not found");
    }
    const fileKey = yield (0, s3Service_1.uploadFileToS3)(req.file, "blog");
    etag = fileKey.etag;
    filename = fileKey.imageName;
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, filename, "Image Successfully uploaded to the S3"));
}));
exports.getAllBlogsCount = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const blogsCount = yield (0, blog_services_1.getBlogsCountService)();
    if (blogsCount.flag) {
        throw new apiError_1.ApiError(404, "Blog count not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, blogsCount.data, blogsCount.message));
}));
