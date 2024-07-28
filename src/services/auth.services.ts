import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface returnResponse {
  flag: boolean;
  message: string;
}

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
 * @description : Create new User
 * @param {string} username : username entered by user
 * @return {object} : Return true if user exists else false
 */

export const createUser = async (
  username: string,
  email: string,
  password: string,
  fullname?: string,
  role: Role = Role.USER
): Promise<boolean> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        fullname: fullname,
        role: role,
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
