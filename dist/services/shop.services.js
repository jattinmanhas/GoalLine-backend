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
exports.getAllProductInCategoryService = exports.GetSignedProductsImageUrl = exports.getUserAllCartItemsCount = exports.deleteItemFromUserCartService = exports.getUserAllCartItems = exports.updateCartItemQuantityWithCartItemId = exports.updateCartItemQuantity = exports.getUserCartItem = exports.createCartItemForUser = exports.searchCategoriesService = exports.searchProductsService = exports.getSingleProductService = exports.getAllProductsService = exports.getAllCategoriesService = exports.insertProductImageMetadata = exports.createProduct = exports.updateCategoryImageDetails = exports.createCategory = void 0;
exports.createOrder = createOrder;
exports.createPayment = createPayment;
exports.createOrderItem = createOrderItem;
exports.clearCartForUser = clearCartForUser;
exports.getAllProductsCountService = getAllProductsCountService;
exports.getAllCategoryCountService = getAllCategoryCountService;
exports.getAllOrdersWithPaymentsService = getAllOrdersWithPaymentsService;
exports.getCurrentDayEarningsService = getCurrentDayEarningsService;
const client_1 = require("@prisma/client");
const s3Service_1 = require("./s3Service");
const prisma = new client_1.PrismaClient({});
const createCategory = (categoryData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const insertCategory = yield prisma.category.create({
            data: {
                name: categoryData.category_name,
                description: categoryData.category_description,
                imageName: categoryData.imageName,
                eTag: categoryData.eTag,
                createdBy: categoryData.createdBy,
            },
        });
        return {
            flag: false,
            data: insertCategory,
            message: "Category Created Successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Create Category...",
        };
    }
});
exports.createCategory = createCategory;
const updateCategoryImageDetails = (imageName, etag, categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedCategory = yield prisma.category.update({
            where: {
                category_id: categoryId
            },
            data: {
                imageName: imageName,
                eTag: etag
            }
        });
        return {
            flag: false,
            data: updatedCategory,
            message: "Category Image Updated Successfully..."
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed to update category image details..."
        };
    }
});
exports.updateCategoryImageDetails = updateCategoryImageDetails;
const createProduct = (productData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const insertProduct = yield prisma.product.create({
            data: {
                name: productData.product_name,
                description: productData.product_description,
                price: productData.product_price,
                stock: Number(productData.stock),
                createdBy: productData.createdBy,
                category_id: productData.category_id,
                isDeleted: false,
            },
        });
        return {
            flag: false,
            data: insertProduct,
            message: "Product Created Successfully...",
        };
    }
    catch (error) {
        console.log(error);
        return {
            flag: true,
            message: "Failed To Create Product...",
        };
    }
});
exports.createProduct = createProduct;
const insertProductImageMetadata = (productImageData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const insertProductImage = yield prisma.productImage.create({
            data: {
                product_id: productImageData.product_id,
                imageName: productImageData.imageName,
                eTag: productImageData.etag,
            },
        });
        return {
            flag: false,
            data: insertProductImage,
            message: "Product Image Metadata Inserted Successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Insert Product Images Metadata...",
        };
    }
});
exports.insertProductImageMetadata = insertProductImageMetadata;
const getAllCategoriesService = (skip, take) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.category.findMany({
            skip: Number(skip),
            take: Number(take),
            include: {
                products: {
                    select: {
                        product_id: true,
                        name: true,
                        description: true,
                        price: true,
                        stock: true,
                        Ratings: true,
                    },
                },
                creator: {
                    select: {
                        fullname: true,
                    },
                },
            },
        });
        return {
            flag: false,
            data: categories,
            message: "All Categories fetched successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Fetch All Categories...",
        };
    }
});
exports.getAllCategoriesService = getAllCategoriesService;
const getAllProductsService = (skip, take) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allProducts = yield prisma.product.findMany({
            skip: Number(skip),
            take: Number(take),
            include: {
                category: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
                images: {
                    select: {
                        image_id: true,
                        imageName: true,
                        eTag: true,
                    },
                },
                creator: {
                    select: {
                        fullname: true,
                    },
                },
            },
        });
        return {
            flag: false,
            data: allProducts,
            message: "All Products fetched successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Fetch all Products...",
        };
    }
});
exports.getAllProductsService = getAllProductsService;
const getSingleProductService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield prisma.product.findUnique({
            where: {
                product_id: id,
            },
            select: {
                product_id: true,
                category_id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                isDeleted: true,
                category: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
                images: {
                    select: {
                        image_id: true,
                        imageName: true,
                        eTag: true,
                    },
                },
                creator: {
                    select: {
                        username: true,
                        fullname: true,
                    },
                },
            },
        });
        if (!product) {
            return {
                flag: true,
                data: null,
                message: "Product not found.",
            };
        }
        const imagesWithSignedUrls = yield Promise.all(product.images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, image), { signedUrl: yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(image.imageName) }));
        })));
        if (imagesWithSignedUrls) {
            product.images = imagesWithSignedUrls;
        }
        return {
            flag: false,
            data: product,
            message: "Product fetched successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Fetch Product...",
        };
    }
});
exports.getSingleProductService = getSingleProductService;
const searchProductsService = (search, skip, take) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield prisma.product.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            skip: Number(skip),
            take: Number(take),
            select: {
                product_id: true,
                category_id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                Ratings: true,
                isDeleted: true,
                category: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
                images: {
                    select: {
                        image_id: true,
                        imageName: true,
                        eTag: true,
                    },
                },
                creator: {
                    select: {
                        username: true,
                        fullname: true,
                    },
                },
            },
        });
        return {
            flag: false,
            data: product,
            message: "Products fetched successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Fetch Products...",
        };
    }
});
exports.searchProductsService = searchProductsService;
const searchCategoriesService = (search, take) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield prisma.category.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            take: Number(take),
            select: {
                category_id: true,
                name: true,
                description: true,
            },
        });
        return {
            flag: false,
            data: category,
            message: "Categories fetched successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Fetch Categories...",
        };
    }
});
exports.searchCategoriesService = searchCategoriesService;
const createCartItemForUser = (product_id, user_id, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const createCartItem = yield prisma.cartItems.create({
            data: {
                user_id: user_id,
                product_id: product_id,
                quantity: quantity,
                addedAt: new Date(),
            },
        });
        return {
            flag: false,
            data: createCartItem,
            message: "Item added to the Cart Successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To add item to the Cart...",
        };
    }
});
exports.createCartItemForUser = createCartItemForUser;
const getUserCartItem = (user_id, product_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartItem = yield prisma.cartItems.findFirst({
            where: {
                user_id: user_id,
                product_id: product_id,
            },
        });
        return {
            flag: false,
            data: cartItem,
            message: "Cart Item fetched successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Fetch Cart Item...",
        };
    }
});
exports.getUserCartItem = getUserCartItem;
const updateCartItemQuantity = (user_id, product_id, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateQuantity = yield prisma.cartItems.updateMany({
            where: {
                user_id: user_id,
                product_id: product_id,
            },
            data: {
                quantity: quantity,
            },
        });
        return {
            flag: false,
            data: updateQuantity,
            message: "Cart Item Quantity Updated Successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed to update Cart Item Quantity...",
        };
    }
});
exports.updateCartItemQuantity = updateCartItemQuantity;
const updateCartItemQuantityWithCartItemId = (cart_items_id, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateQuantity = yield prisma.cartItems.update({
            where: {
                cart_items_id: cart_items_id,
            },
            data: {
                quantity: quantity,
            },
        });
        return {
            flag: false,
            data: updateQuantity,
            message: "Cart Item Quantity Updated Successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed to update Cart Item Quantity...",
        };
    }
});
exports.updateCartItemQuantityWithCartItemId = updateCartItemQuantityWithCartItemId;
const getUserAllCartItems = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartItem = yield prisma.cartItems.findMany({
            where: {
                user_id: user_id,
            },
            select: {
                cart_items_id: true,
                quantity: true,
                user_id: true,
                product: {
                    select: {
                        name: true,
                        product_id: true,
                        price: true,
                        stock: true,
                        images: {
                            select: {
                                imageName: true,
                            },
                        },
                    },
                },
            },
        });
        const cartItemsWithSignedUrls = yield Promise.all(cartItem.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, item), { product: Object.assign(Object.assign({}, item.product), { images: yield Promise.all(item.product.images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                        return (Object.assign(Object.assign({}, image), { signedUrl: yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(image.imageName) }));
                    }))) }) }));
        })));
        return {
            flag: false,
            data: cartItemsWithSignedUrls,
            message: "Cart Items fetched successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Fetch Cart Items...",
        };
    }
});
exports.getUserAllCartItems = getUserAllCartItems;
const deleteItemFromUserCartService = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteItem = yield prisma.cartItems.deleteMany({
            where: {
                user_id: userId,
                product_id: productId,
            },
        });
        return {
            flag: false,
            data: deleteItem,
            message: "Cart Item Deleted Successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed to Delete Cart Item Quantity...",
        };
    }
});
exports.deleteItemFromUserCartService = deleteItemFromUserCartService;
const getUserAllCartItemsCount = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartItemCount = yield prisma.cartItems.count({
            where: {
                user_id: user_id,
            },
        });
        return {
            flag: false,
            data: cartItemCount,
            message: "Cart Items Count fetched successfully...",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed To Fetch Cart Items Count...",
        };
    }
});
exports.getUserAllCartItemsCount = getUserAllCartItemsCount;
const GetSignedProductsImageUrl = (allProducts) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Promise.all(allProducts.map((product) => __awaiter(void 0, void 0, void 0, function* () {
        let images = [];
        if (product.images) {
            images = yield Promise.all(product.images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                return (Object.assign(Object.assign({}, image), { signedUrl: yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(image.imageName) }));
            })));
        }
        return Object.assign(Object.assign({}, product), { images });
    })));
});
exports.GetSignedProductsImageUrl = GetSignedProductsImageUrl;
const getAllProductInCategoryService = (category_id, skip, take) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDetails = yield prisma.product.findMany({
            where: {
                category_id: category_id,
            },
            skip: Number(skip),
            take: Number(take),
            select: {
                product_id: true,
                category_id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                Ratings: true,
                isDeleted: true,
                category: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
                images: {
                    select: {
                        image_id: true,
                        imageName: true,
                        eTag: true,
                    },
                },
                creator: {
                    select: {
                        username: true,
                        fullname: true,
                    },
                },
            },
        });
        return {
            flag: false,
            data: userDetails,
            message: "Successfully Fetched All Products in Single Category.",
        };
    }
    catch (error) {
        return {
            flag: true,
            data: null,
            message: "Failed to Fetch All Products in Single Category.",
        };
    }
});
exports.getAllProductInCategoryService = getAllProductInCategoryService;
function createOrder(customerId, totalAmount, currency, status) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.order.create({
            data: {
                customerId,
                totalAmount,
                currency,
                status,
            },
        });
    });
}
function createPayment(orderId, paymentId, currency, status) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.payment.create({
            data: {
                orderId,
                paymentId,
                currency,
                status,
            },
        });
    });
}
function createOrderItem(orderId, productId, quantity) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.orderItem.create({
            data: {
                orderId,
                productId,
                quantity,
            },
        });
    });
}
function clearCartForUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Delete all CartItems associated with the user
            return yield prisma.cartItems.deleteMany({
                where: {
                    user_id: userId,
                },
            });
        }
        catch (error) {
            console.error(`Error clearing cart for user with ID: ${userId}`, error);
            throw error;
        }
    });
}
function getAllProductsCountService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const productsCount = yield prisma.product.count({});
            return {
                flag: false,
                data: productsCount,
                message: "Products Count fetched successfully...",
            };
        }
        catch (error) {
            return {
                flag: true,
                data: null,
                message: "Failed to fetch Products Count.", error
            };
        }
    });
}
function getAllCategoryCountService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const categoryCount = yield prisma.category.count({});
            return {
                flag: false,
                data: categoryCount,
                message: "Category Count fetched successfully...",
            };
        }
        catch (error) {
            return {
                flag: true,
                data: null,
                message: "Failed to fetch Category Count.", error
            };
        }
    });
}
function getAllOrdersWithPaymentsService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orders = yield prisma.order.findMany({
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    price: true,
                                    description: true
                                }
                            }
                        }
                    },
                    payment: true
                }
            });
            return {
                flag: false,
                data: orders,
                message: "Orders with payments fetched successfully..."
            };
        }
        catch (error) {
            return {
                flag: true,
                data: null,
                message: "Failed to fetch orders with payments.",
                error
            };
        }
    });
}
function getCurrentDayEarningsService() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const earnings = yield prisma.order.aggregate({
                _sum: {
                    totalAmount: true
                },
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });
            return {
                flag: false,
                data: (_b = (_a = earnings._sum) === null || _a === void 0 ? void 0 : _a.totalAmount) !== null && _b !== void 0 ? _b : 0,
                message: "Current day earnings fetched successfully...",
            };
        }
        catch (error) {
            return {
                flag: true,
                data: null,
                message: "Failed to fetch current day earnings.",
                error,
            };
        }
    });
}
