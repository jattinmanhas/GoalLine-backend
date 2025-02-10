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
exports.getCurrentDayEarnings = exports.getAllCategoryCount = exports.getAllProductsCount = exports.createNewProduct = exports.createNewCategory = exports.addCategory = void 0;
const asyncHander_1 = require("../../../utils/handlers/asyncHander");
const apiError_1 = require("../../../utils/handlers/apiError");
const apiResponse_1 = require("../../../utils/handlers/apiResponse");
const shop_services_1 = require("../../../services/shop.services");
const redisClient_1 = __importDefault(require("../../../config/redisClient"));
const rabbitmq_1 = require("../../../config/rabbitmq");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
exports.addCategory = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Add Category from the db....");
}));
exports.createNewCategory = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const category_name = req.body.category_name;
    const category_description = req.body.category_description;
    if (!category_name) {
        throw new apiError_1.ApiError(400, "Category Name cannot be empty");
    }
    let user = req.user;
    let etag = "";
    let filename = "";
    let tempFilePath = "";
    if (req.file) {
        // const fileKey = await uploadFileToS3(req.file, "category");
        // etag = fileKey.etag!;
        // filename = fileKey.imageName;
        tempFilePath = path_1.default.join(__dirname, "../../../temp", req.file.originalname);
        (0, fs_1.writeFileSync)(tempFilePath, req.file.buffer);
        etag = "uploading";
        filename = req.file.originalname;
    }
    let categoryData = {
        category_name: category_name,
        category_description: category_description,
        imageName: filename,
        eTag: etag,
        isDeleted: 0,
        createdBy: user.id,
    };
    const category = yield (0, shop_services_1.createCategory)(categoryData);
    if (category.flag) {
        throw new apiError_1.ApiError(400, category.message);
    }
    if (req.file) {
        const channel = yield (0, rabbitmq_1.getChannel)();
        channel.sendToQueue("fileUploadQueue", Buffer.from(JSON.stringify({
            file: tempFilePath,
            folder: 'category',
            folder_id: (_a = category.data) === null || _a === void 0 ? void 0 : _a.category_id
        })));
    }
    yield redisClient_1.default.del("categories");
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, category, "New Category Created Successfully..."));
}));
exports.createNewProduct = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const product_name = req.body.product_name;
    const product_description = req.body.product_description;
    const product_price = req.body.product_price;
    const stock = req.body.stock;
    const category_id = req.body.category_id;
    const files = req.files;
    let user = req.user;
    // const uploadedFiles: { imageName: string; etag: string | undefined }[] = [];
    // if (req.files) {
    //   for (const file of files) {
    //     const fileKey = await uploadFileToS3(file, "products");
    //     uploadedFiles.push(fileKey);
    //   }
    // }
    let product_data = {
        product_name: product_name,
        product_description: product_description,
        product_price: product_price,
        stock: stock,
        createdBy: user.id,
        category_id: category_id,
    };
    const createNewProduct = yield (0, shop_services_1.createProduct)(product_data);
    if (createNewProduct.flag) {
        throw new apiError_1.ApiError(400, createNewProduct.message);
    }
    if (req.files) {
        for (const file of files) {
            // const fileKey = await uploadFileToS3(file, "products");
            // uploadedFiles.push(fileKey);
            const tempFilePath = path_1.default.join(__dirname, "../../../temp", file.originalname);
            (0, fs_1.writeFileSync)(tempFilePath, file.buffer);
            const channel = yield (0, rabbitmq_1.getChannel)();
            channel.sendToQueue("fileUploadQueue", Buffer.from(JSON.stringify({
                file: tempFilePath,
                folder: 'products',
                folder_id: (_a = createNewProduct.data) === null || _a === void 0 ? void 0 : _a.product_id
            })));
        }
    }
    /* for (const upload of uploadedFiles) {
      let productImage: productImageMetadata = {
        product_id: createNewProduct.data?.product_id as string,
        imageName: upload.imageName,
        etag: upload.etag as string,
      };

      const imageMeta = await insertProductImageMetadata(productImage);

      if (imageMeta.flag) {
        throw new ApiError(400, imageMeta.message);
      }
    } */
    yield redisClient_1.default.del("products");
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, exports.createNewCategory, "New Product Created Successfully..."));
}));
exports.getAllProductsCount = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield (0, shop_services_1.getAllProductsCountService)();
    if (products.flag) {
        throw new apiError_1.ApiError(400, products.message);
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, products.data, products.message));
}));
exports.getAllCategoryCount = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield (0, shop_services_1.getAllCategoryCountService)();
    if (category.flag) {
        throw new apiError_1.ApiError(400, category.message);
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, category.data, category.message));
}));
exports.getCurrentDayEarnings = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const earnings = yield (0, shop_services_1.getCurrentDayEarningsService)();
    if (earnings.flag) {
        throw new apiError_1.ApiError(400, earnings.message);
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, earnings.data, earnings.message));
}));
