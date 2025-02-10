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
exports.searchProductsBlogs = exports.createContact = void 0;
const asyncHander_1 = require("../../../utils/handlers/asyncHander");
const contact_service_1 = require("../../../services/contact.service");
const apiError_1 = require("../../../utils/handlers/apiError");
const apiResponse_1 = require("../../../utils/handlers/apiResponse");
const s3Service_1 = require("../../../services/s3Service");
exports.createContact = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;
    const contact = yield (0, contact_service_1.createContactService)(email, subject, message);
    if (contact.flag) {
        throw new apiError_1.ApiError(400, (yield contact).message);
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, contact, contact.message));
}));
exports.searchProductsBlogs = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { query } = req.query;
    if (!query || typeof query !== "string") {
        throw new apiError_1.ApiError(400, "Search query is required.");
    }
    const search = yield (0, contact_service_1.searbhProductsCategoriesService)(query);
    if (search.flag) {
        throw new apiError_1.ApiError(400, search.message);
    }
    (_a = search.data) === null || _a === void 0 ? void 0 : _a.blogs.forEach((blog) => __awaiter(void 0, void 0, void 0, function* () {
        if (blog.mainImage) {
            blog.mainImage = yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(blog.mainImage);
        }
    }));
    // Update products with signed URLs
    if ((_b = search.data) === null || _b === void 0 ? void 0 : _b.products) {
        for (const product of search.data.products) {
            product.images = yield Promise.all(product.images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                return (Object.assign(Object.assign({}, image), { imageName: yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(image.imageName) }));
            })));
        }
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, search.data, search.message));
}));
