"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipleFileUpload = exports.singleFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const apiError_1 = require("../utils/handlers/apiError");
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    }
    else {
        cb(new Error("File type not allowed. Only image files are permitted"));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
const singleFileUpload = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
        if (error) {
            return next(new apiError_1.ApiError(400, error.message));
        }
        next();
    });
};
exports.singleFileUpload = singleFileUpload;
const multipleFileUpload = (fieldName, maxCount) => (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (error) => {
        if (error) {
            return next(new apiError_1.ApiError(400, error.message));
        }
        next();
    });
};
exports.multipleFileUpload = multipleFileUpload;
exports.default = upload;
