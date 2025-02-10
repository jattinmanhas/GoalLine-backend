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
exports.getAllUsersCountService = exports.getAllUsersService = exports.getUserAddressFromUserId = exports.getCompleteUserDetailsService = exports.loginServiceForUser = exports.loginServiceforAdmin = exports.checkPasswordCorrect = exports.getUserAuthSettings = exports.getUser = exports.createUserAuthSettings = exports.createUser = void 0;
exports.getUserFromToken = getUserFromToken;
exports.renewTokens = renewTokens;
exports.updateUserDetailsService = updateUserDetailsService;
exports.updateUserAddressService = updateUserAddressService;
exports.createUserAddressService = createUserAddressService;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_1 = require("../utils/auth/tokens");
const common_1 = require("../utils/common");
const jsonwebtoken_1 = require("jsonwebtoken");
const s3Service_1 = require("./s3Service");
const prisma = new client_1.PrismaClient({
    log: ["query"],
});
/**
 * @description : Create new User
 * @param {string} username : username entered by user
 * @return {object} : Return userdata, flag and message
 */
const createUser = (username_1, email_1, password_1, fullname_1, ...args_1) => __awaiter(void 0, [username_1, email_1, password_1, fullname_1, ...args_1], void 0, function* (username, email, password, fullname, role = client_1.Role.USER) {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 12);
        const user = yield prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword,
                fullname: fullname,
                role: role,
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
            },
        });
        return {
            flag: false,
            data: user,
            message: "User Created Successfully...",
        };
    }
    catch (error) {
        console.log(error);
        return {
            flag: true,
            message: "Failed to Create New User...",
        };
    }
});
exports.createUser = createUser;
/**
 * @description : Create new User auth Settings Entry
 * @param {string} userid : username entered by user
 * @return {object} : Return Return Payload
 */
const createUserAuthSettings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.userAuthSettings.create({
            data: {
                userId: userId,
            },
        });
        return {
            flag: false,
            message: "User Auth Settings Created Successfully...",
        };
    }
    catch (error) {
        console.log(error);
        return {
            flag: true,
            message: "Failed to Create User Auth Settings",
        };
    }
});
exports.createUserAuthSettings = createUserAuthSettings;
function constructWhereClause(field, value, role) {
    switch (field) {
        case "username":
            return { username: value, role: role };
        case "email":
            return { email: value, role: role };
        default:
            throw new Error(`Invalid field: ${field}`);
    }
}
const getUser = (username, includePassword, field, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const whereClause = yield constructWhereClause(field, username, role);
        const user = yield prisma.user.findUnique({
            where: whereClause,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                password: includePassword,
            },
        });
        return user;
    }
    catch (error) {
        console.error(`Error finding user by ${field}:`, error);
        throw error;
    }
});
exports.getUser = getUser;
const getUserAuthSettings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userAuth = yield prisma.userAuthSettings.findUnique({
            where: {
                userId: userId,
            },
        });
        return userAuth;
    }
    catch (error) {
        console.error(`Error finding user Auth Settings:`, error);
        throw error;
    }
});
exports.getUserAuthSettings = getUserAuthSettings;
const checkPasswordCorrect = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const match = yield bcrypt_1.default.compare(password, hashedPassword);
    return match;
});
exports.checkPasswordCorrect = checkPasswordCorrect;
const loginServiceforAdmin = (username, password, role, isMail) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    if (isMail) {
        user = yield (0, exports.getUser)(username, true, "email", role);
    }
    else {
        user = yield (0, exports.getUser)(username, true, "username", role);
    }
    let userAuth = yield (0, exports.getUserAuthSettings)(user.id);
    let currentTime = new Date();
    let expireTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    if (userAuth && userAuth.loginRetryLimit >= 3) {
        const limitTime = userAuth.loginReactiveTime
            ? new Date(userAuth.loginReactiveTime)
            : null;
        if (limitTime) {
            if (limitTime > currentTime) {
                if (limitTime <= expireTime) {
                    return {
                        flag: true,
                        message: `You have exceeded the number of attempts. You can login after ${(0, common_1.getDifferenceOfTwoDatesInMinutes)(currentTime, limitTime)} minutes.`,
                    };
                }
                yield prisma.userAuthSettings.update({
                    where: { userId: user.id },
                    data: {
                        loginReactiveTime: expireTime,
                        loginRetryLimit: userAuth.loginRetryLimit + 1,
                    },
                });
                return {
                    flag: true,
                    message: `you have exceed the number of limit.you can login after ${(0, common_1.getDifferenceOfTwoDatesInMinutes)(currentTime, expireTime)} minutes`,
                };
            }
            else {
                yield prisma.userAuthSettings.update({
                    where: { userId: user.id },
                    data: {
                        loginReactiveTime: null,
                        loginRetryLimit: 1,
                    },
                });
                return {
                    flag: true,
                    message: `Incorrect Password...`,
                };
            }
        }
        else {
            yield prisma.userAuthSettings.update({
                where: { userId: user.id },
                data: {
                    loginReactiveTime: expireTime,
                    loginRetryLimit: userAuth.loginRetryLimit + 1,
                },
            });
            return {
                flag: true,
                message: `You have exceed the number of limit.you can login after ${(0, common_1.getDifferenceOfTwoDatesInMinutes)(currentTime, expireTime)} minutes`,
            };
        }
    }
    const isPasswordMatch = yield (0, exports.checkPasswordCorrect)(password, user.password);
    if (!isPasswordMatch) {
        yield prisma.userAuthSettings.update({
            where: {
                userId: user.id,
            },
            data: {
                loginRetryLimit: (userAuth === null || userAuth === void 0 ? void 0 : userAuth.loginRetryLimit) + 1,
            },
        });
        return {
            flag: true,
            message: `Incorrect Password. You have ${3 - (userAuth === null || userAuth === void 0 ? void 0 : userAuth.loginRetryLimit)} tries left`,
        };
    }
    // generating tokens if password is correct...
    let tokens = {
        token: yield (0, tokens_1.generateJwtToken)(user),
        refreshToken: yield (0, tokens_1.generateRefreshToken)(user),
    };
    // resetting login retry limit and time...
    if (userAuth && userAuth.loginRetryLimit > 0) {
        yield prisma.userAuthSettings.update({
            where: {
                userId: user.id,
            },
            data: {
                loginRetryLimit: 0,
                loginReactiveTime: null,
            },
        });
    }
    return {
        flag: false,
        tokens: tokens,
        data: yield (0, common_1.removePassword)(user),
        message: "Log In Success...",
    };
});
exports.loginServiceforAdmin = loginServiceforAdmin;
const loginServiceForUser = (username_1, password_1, role_1, isMail_1, ...args_1) => __awaiter(void 0, [username_1, password_1, role_1, isMail_1, ...args_1], void 0, function* (username, password, role, isMail, isGoogle = false) {
    let user;
    if (isMail) {
        user = yield (0, exports.getUser)(username, true, "email", role);
    }
    else {
        user = yield (0, exports.getUser)(username, true, "username", role);
    }
    if (!user) {
        return {
            flag: true,
            message: "User Not Found",
        };
    }
    if (!isGoogle) {
        const isPasswordMatch = yield (0, exports.checkPasswordCorrect)(password, user.password);
        if (!isPasswordMatch) {
            return {
                flag: true,
                message: `Incorrect Password...`,
            };
        }
    }
    let tokens = {
        token: yield (0, tokens_1.generateJwtToken)(user),
        refreshToken: yield (0, tokens_1.generateRefreshToken)(user),
    };
    return {
        flag: false,
        tokens: tokens,
        data: yield (0, common_1.removePassword)(user),
        message: "Log In Success...",
    };
});
exports.loginServiceForUser = loginServiceForUser;
function getUserFromToken(token, SECRET) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const decodedUser = yield (0, jsonwebtoken_1.verify)(token, SECRET);
            return decodedUser;
        }
        catch (error) {
            return null;
        }
    });
}
function renewTokens(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let tokens = {
                token: yield (0, tokens_1.generateJwtToken)(user),
                refreshToken: yield (0, tokens_1.generateRefreshToken)(user),
            };
            return {
                flag: false,
                tokens: tokens,
                data: user,
                message: "New Access Tokens Generated Successfully...",
            };
        }
        catch (error) {
            return {
                flag: true,
                message: error,
            };
        }
    });
}
const getCompleteUserDetailsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDetails = yield prisma.user.findFirst({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                username: true,
                fullname: true,
                mobileNo: true,
                image: true,
                role: true,
                userAddress: {
                    include: {},
                },
            },
        });
        let userWithSignedUrl = userDetails
            ? Object.assign(Object.assign({}, userDetails), { signedUrl: "" }) : null;
        if (userWithSignedUrl === null || userWithSignedUrl === void 0 ? void 0 : userWithSignedUrl.image) {
            userWithSignedUrl.signedUrl = yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(userWithSignedUrl.image);
        }
        return {
            flag: false,
            data: userWithSignedUrl,
            message: "Successfully Fetched User Details",
        };
    }
    catch (error) {
        return {
            flag: true,
            data: null,
            message: "Failed to Fetch User Details",
        };
    }
});
exports.getCompleteUserDetailsService = getCompleteUserDetailsService;
function updateUserDetailsService(id, email, fullname, mobileNo, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedUser = yield prisma.user.update({
                where: { id }, // Update based on unique ID
                data: {
                    email: email,
                    fullname: fullname,
                    mobileNo: mobileNo,
                    image: filename,
                },
            });
            return {
                flag: false,
                message: "User Details Updated Successfully",
                data: updatedUser,
            };
        }
        catch (error) {
            return {
                message: "Error updating user:",
                error,
                flag: true,
                data: null,
            };
        }
    });
}
function updateUserAddressService(userAddressId, street, city, state, postalCode, country, isDefault) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedAddress = yield prisma.userAddress.update({
                where: {
                    userAddressId, // Unique identifier for the address to update
                },
                data: {
                    street,
                    city,
                    state,
                    postalCode,
                    country,
                    isDefault,
                },
            });
            return {
                flag: false,
                message: "User Address Details Updated Successfully",
                data: updatedAddress,
            };
        }
        catch (error) {
            return {
                message: "Error updating user:",
                error,
                flag: true,
                data: null,
            };
        }
    });
}
function createUserAddressService(userId, street, city, state, postalCode, country, isDefault) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newAddress = yield prisma.userAddress.create({
                data: {
                    userId,
                    street,
                    city,
                    state,
                    postalCode,
                    country,
                    isDefault: isDefault !== null && isDefault !== void 0 ? isDefault : false,
                },
            });
            return {
                flag: false,
                message: "User Address Details Updated Successfully",
                data: newAddress,
            };
        }
        catch (error) {
            return {
                message: "Error updating user:",
                error,
                flag: true,
                data: null,
            };
        }
    });
}
const getUserAddressFromUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDetails = yield prisma.userAddress.findFirst({
            where: {
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        username: true,
                        fullname: true,
                    }
                }
            }
        });
        return {
            flag: false,
            data: userDetails,
            message: "Successfully Fetched User Details",
        };
    }
    catch (error) {
        return {
            flag: true,
            data: null,
            message: "Failed to Fetch User Details",
        };
    }
});
exports.getUserAddressFromUserId = getUserAddressFromUserId;
const getAllUsersService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: {
                id: true,
                username: true,
                fullname: true,
                mobileNo: true,
                email: true,
                role: true,
                image: true,
                isDeleted: true,
                updatedDatetime: true,
            }
        });
        return {
            flag: false,
            data: users,
            message: "Successfully Fetched All Users",
        };
    }
    catch (error) {
        return {
            flag: true,
            data: null,
            message: "Failed to Fetch All Users " + error,
        };
    }
});
exports.getAllUsersService = getAllUsersService;
const getAllUsersCountService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.count();
        return {
            flag: false,
            data: users,
            message: "Successfully Fetched Users Count",
        };
    }
    catch (error) {
        return {
            flag: true,
            data: null,
            message: "Failed to Fetch Users Count", error
        };
    }
});
exports.getAllUsersCountService = getAllUsersCountService;
