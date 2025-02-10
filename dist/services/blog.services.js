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
exports.getBlogsCountService = void 0;
exports.getBlogWithSections = getBlogWithSections;
exports.createNewBlogService = createNewBlogService;
exports.createNewBlogSection = createNewBlogSection;
exports.createNewBlogSectionImage = createNewBlogSectionImage;
exports.getAllBlogsService = getAllBlogsService;
const client_1 = require("@prisma/client");
const s3Service_1 = require("./s3Service");
const prisma = new client_1.PrismaClient({});
function getBlogWithSections(blogId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const blog = yield prisma.blog.findUnique({
                where: { id: blogId },
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
                    sections: {
                        orderBy: { order: "asc" },
                        include: {
                            image: true, // Include image for each section
                        },
                    },
                },
            });
            if (!blog) {
                return {
                    flag: true,
                    data: blog,
                    message: "Blog Not Found.",
                };
            }
            const blogWithSignedUrl = yield addSignedUrlsToSinglePost(blog);
            return {
                flag: false,
                data: blogWithSignedUrl,
                message: "Blog Fetched Successfully.",
            };
        }
        catch (error) {
            return {
                flag: true,
                message: "Failed to find Blog.",
                data: null,
            };
        }
    });
}
function createNewBlogService(title, desciption, mainImage, category_id, authorId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const blog = yield prisma.blog.create({
                data: {
                    title: title,
                    description: desciption,
                    mainImage: mainImage,
                    createdAt: new Date(),
                    category_id: category_id,
                    authorId: authorId,
                },
            });
            return {
                flag: false,
                data: blog,
                message: "Blog Fetched Successfully.",
            };
        }
        catch (error) {
            return {
                flag: true,
                message: "Failed to Create Blog.",
                data: null,
            };
        }
    });
}
function createNewBlogSection(section) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const createdSection = yield prisma.section.create({
                data: {
                    heading: section.heading,
                    paragraph: section.paragraph,
                    order: section.order,
                    blogId: section.blogId, // Link to the created blog
                },
            });
            return {
                flag: false,
                data: createdSection,
                message: "Blog Section Created Successfully.",
            };
        }
        catch (error) {
            return {
                flag: true,
                message: "Failed to Create Blog Section.",
                data: null,
            };
        }
    });
}
function createNewBlogSectionImage(imageName, sectionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const createdSectionImage = yield prisma.image.create({
                data: {
                    imageName: imageName,
                    sectionId: sectionId,
                },
            });
            return {
                flag: false,
                data: createdSectionImage,
                message: "Blog Section Image Created Successfully.",
            };
        }
        catch (error) {
            return {
                flag: true,
                message: "Failed to Create Blog Section Image.",
                data: null,
            };
        }
    });
}
const addSignedUrlsToResponse = (responseData) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.all(responseData.map((blogPost) => __awaiter(void 0, void 0, void 0, function* () {
        if (blogPost.mainImage) {
            blogPost.mainImageSignedUrl = yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(blogPost.mainImage);
        }
        if (blogPost.sections && Array.isArray(blogPost.sections)) {
            blogPost.sections = yield Promise.all(blogPost.sections.map((section) => __awaiter(void 0, void 0, void 0, function* () {
                if (section.image && section.image.imageName) {
                    section.image.signedUrl = yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(section.image.imageName);
                }
                return section;
            })));
        }
        return blogPost;
    })));
});
const addSignedUrlsToSinglePost = (blogPost) => __awaiter(void 0, void 0, void 0, function* () {
    if (blogPost.mainImage) {
        blogPost.mainImageSignedUrl = yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(blogPost.mainImage);
    }
    if (blogPost.sections && Array.isArray(blogPost.sections)) {
        blogPost.sections = yield Promise.all(blogPost.sections.map((section) => __awaiter(void 0, void 0, void 0, function* () {
            if (section.image && section.image.imageName) {
                section.image.signedUrl = yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(section.image.imageName);
            }
            return section;
        })));
    }
    return blogPost;
});
function getAllBlogsService(skip, take) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const blog = yield prisma.blog.findMany({
                skip: skip,
                take: take,
                include: {
                    category: {
                        select: {
                            name: true,
                        },
                    },
                    sections: {
                        orderBy: { order: "asc" },
                        include: {
                            image: true, // Include image for each section
                        },
                    },
                    author: {
                        select: {
                            fullname: true,
                        },
                    },
                },
            });
            const blogsWithSignedUrl = yield addSignedUrlsToResponse(blog);
            return {
                flag: false,
                data: blogsWithSignedUrl,
                message: "Blogs Fetched Successfully.",
            };
        }
        catch (error) {
            return {
                flag: true,
                message: "Failed to find Blog.",
                data: null,
            };
        }
    });
}
const getBlogsCountService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogsCount = yield prisma.blog.count({});
        return {
            flag: false,
            data: blogsCount,
            message: "Blogs Count fetched Successfully.",
        };
    }
    catch (error) {
        return {
            flag: true,
            message: "Failed to Fetch All Blogs Count.",
            data: null,
        };
    }
});
exports.getBlogsCountService = getBlogsCountService;
