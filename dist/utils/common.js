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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailExists = exports.usernameExists = void 0;
exports.isEmail = isEmail;
exports.removePassword = removePassword;
exports.getDifferenceOfTwoDatesInMinutes = getDifferenceOfTwoDatesInMinutes;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * @description : Check Username Exists
 * @param {string} username : username entered by user
 * @return {boolean} : Return true if user exists else false
 */
const usernameExists = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: {
            username: username,
        },
    });
    return user !== null;
});
exports.usernameExists = usernameExists;
/**
 * @description : Check Email Exists
 * @param {string} email : email entered by user
 * @return {boolean} : Return true if email exists else false
 */
const emailExists = (mail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: {
            email: mail,
        },
    });
    return user !== null;
});
exports.emailExists = emailExists;
/**
 * @description : Checks if the particular String is email or not
 * @param {string} input : username or email entered by user
 * @return {object} : Return true if entered string is email else false
 */
function isEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
}
function removePassword(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        return userWithoutPassword;
    });
}
function getDifferenceOfTwoDatesInMinutes(date1, date2) {
    const diffInMilliseconds = date2.getTime() - date1.getTime();
    const diffInMinutes = diffInMilliseconds / 60000; // Convert milliseconds to minutes
    return Math.ceil(Math.abs(diffInMinutes)); // Return the absolute value to ensure the difference is positive
}
