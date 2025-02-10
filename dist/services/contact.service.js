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
exports.searbhProductsCategoriesService = exports.createContactService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({});
const createContactService = (email, subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = prisma.contact.create({
            data: {
                email: email,
                subject: subject,
                message: message,
            },
        });
        return {
            flag: false,
            data: contact,
            message: "Query Created Successfully.",
        };
    }
    catch (error) {
        return {
            flag: true,
            data: null,
            message: `Error creating contact ${error.message}`,
        };
    }
});
exports.createContactService = createContactService;
const searbhProductsCategoriesService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [products, blogs] = yield Promise.all([
            prisma.product.findMany({
                take: 10,
                where: {
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
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
            }),
            prisma.blog.findMany({
                take: 10,
                where: {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
                include: {
                    author: {
                        select: {
                            fullname: true,
                        },
                    },
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
        ]);
        return {
            flag: false,
            data: { products: [...products], blogs: [...blogs] },
            message: "Successfully fetched both products and Blogs",
        };
    }
    catch (error) {
        return {
            flag: true,
            data: null,
            message: `Error creating contact ${error.message}`,
        };
    }
});
exports.searbhProductsCategoriesService = searbhProductsCategoriesService;
