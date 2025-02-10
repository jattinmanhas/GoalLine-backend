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
exports.uploadFileToS3 = uploadFileToS3;
exports.getSignedForImage = getSignedForImage;
exports.getSignedForImagesUsingCloudFront = getSignedForImagesUsingCloudFront;
exports.deleteImageFromS3 = deleteImageFromS3;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Config_1 = require("../config/s3Config");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const apiError_1 = require("../utils/handlers/apiError");
const cloudfront_signer_1 = require("@aws-sdk/cloudfront-signer");
function uploadFileToS3(file, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const filename = `${folder}/${(0, uuid_1.v4)()}-${file.originalname}`;
        const params = {
            Bucket: s3Config_1.S3_BUCKET,
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        try {
            const command = new client_s3_1.PutObjectCommand(params);
            const result = yield s3Config_1.s3Client.send(command);
            return {
                imageName: filename,
                etag: result.ETag,
            };
        }
        catch (error) {
            throw new apiError_1.ApiError(500, "Failed to Upload Category Image to AWS");
        }
    });
}
function getSignedForImage(imageName) {
    return __awaiter(this, void 0, void 0, function* () {
        const getObjectParams = {
            Bucket: s3Config_1.S3_BUCKET,
            Key: imageName,
        };
        const command = new client_s3_1.GetObjectCommand(getObjectParams);
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3Config_1.s3Client, command, { expiresIn: 86400 });
        return url;
    });
}
function getSignedForImagesUsingCloudFront(imageName) {
    return __awaiter(this, void 0, void 0, function* () {
        const signedUrl = (0, cloudfront_signer_1.getSignedUrl)({
            url: process.env.CLOUDFRONT_URL + imageName,
            dateLessThan: new Date(Date.now() + 86400 * 1000).toISOString(),
            privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
            keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
        });
        return signedUrl;
    });
}
function deleteImageFromS3(imageName) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteObjectParams = {
            Bucket: s3Config_1.S3_BUCKET,
            Key: imageName,
        };
        const command = new client_s3_1.DeleteObjectCommand(deleteObjectParams);
        yield s3Config_1.s3Client.send(command);
        return true;
    });
}
