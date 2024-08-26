import { PrismaClient, Role, Prisma } from "@prisma/client";
import { UserPayload } from "../types/index.types";

const prisma = new PrismaClient();
/**
 * @description : Check Username Exists
 * @param {string} username : username entered by user
 * @return {boolean} : Return true if user exists else false
 */

export const usernameExists = async (username: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  return user !== null;
};

/**
 * @description : Check Email Exists
 * @param {string} email : email entered by user
 * @return {boolean} : Return true if email exists else false
 */

export const emailExists = async (mail: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      email: mail,
    },
  });

  return user !== null;
};

/**
 * @description : Checks if the particular String is email or not
 * @param {string} input : username or email entered by user
 * @return {object} : Return true if entered string is email else false
 */

export function isEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

export async function removePassword(user: UserPayload) {
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

export function getDifferenceOfTwoDatesInMinutes(date1: Date, date2: Date) {
  const diffInMilliseconds = date2.getTime() - date1.getTime();
  const diffInMinutes = diffInMilliseconds / 60000; // Convert milliseconds to minutes
  return Math.ceil(Math.abs(diffInMinutes)); // Return the absolute value to ensure the difference is positive
}

