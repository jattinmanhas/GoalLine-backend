"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.startFileUploadConsumer = void 0;
const rabbitmq_1 = require("../../config/rabbitmq");
const s3Service_1 = require("../../services/s3Service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime = __importStar(require("mime-types"));
const shop_services_1 = require("../../services/shop.services");
const apiError_1 = require("../handlers/apiError");
const convertToMulterFile = (filePath) => {
    const fileBuffer = fs_1.default.readFileSync(filePath);
    return {
        buffer: fileBuffer,
        originalname: path_1.default.basename(filePath),
        mimetype: mime.lookup(filePath) || "application/octet-stream", // Adjust the MIME type as needed
        size: fileBuffer.length,
        fieldname: "",
        encoding: "",
        destination: "",
        filename: "",
        path: filePath,
        stream: fs_1.default.createReadStream(filePath),
    };
};
const startFileUploadConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    const channel = (0, rabbitmq_1.getChannel)();
    channel.consume("fileUploadQueue", (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (!msg) {
            return;
        }
        const { file, folder, folder_id } = JSON.parse(msg.content.toString());
        const multerFile = convertToMulterFile(file);
        const fileKey = yield (0, s3Service_1.uploadFileToS3)(multerFile, folder);
        if (fileKey.imageName) {
            if (folder === "category") {
                // Update file name in the db.
                const updateImage = yield (0, shop_services_1.updateCategoryImageDetails)(fileKey.imageName, fileKey.etag, folder_id);
                if (updateImage.flag) {
                    throw new apiError_1.ApiError(400, updateImage.message);
                }
            }
            else if (folder === "products") {
                let productImage = {
                    product_id: folder_id,
                    imageName: fileKey.imageName,
                    etag: fileKey.etag,
                };
                const imageMeta = yield (0, shop_services_1.insertProductImageMetadata)(productImage);
                if (imageMeta.flag) {
                    throw new apiError_1.ApiError(400, imageMeta.message);
                }
            }
        }
        fs_1.default.unlinkSync(file);
        channel.ack(msg);
        console.log("File uploaded successfully");
    }));
});
exports.startFileUploadConsumer = startFileUploadConsumer;
