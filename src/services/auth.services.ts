import { PrismaClient, Role, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { UserPayload, ReturnPayload, Tokens } from "../types/index.types";
import { generateJwtToken, generateRefreshToken } from "../utils/auth/tokens";
import {
  removePassword,
  getDifferenceOfTwoDatesInMinutes,
} from "../utils/common";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient({
  log: ['query']
});

/**
 * @description : Create new User
 * @param {string} username : username entered by user
 * @return {object} : Return userdata, flag and message
 */

export const createUser = async (
  username: string,
  email: string,
  password: string,
  fullname?: string,
  role: Role = Role.USER
): Promise<ReturnPayload> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
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
  } catch (error) {
    console.log(error);
    return {
      flag: true,
      message: "Failed to Create New User...",
    };
  }
};

/**
 * @description : Create new User auth Settings Entry
 * @param {string} userid : username entered by user
 * @return {object} : Return Return Payload
 */

export const createUserAuthSettings = async (
  userId: string
): Promise<ReturnPayload> => {
  try {
    await prisma.userAuthSettings.create({
      data: {
        userId: userId,
      },
    });

    return {
      flag: false,
      message: "User Auth Settings Created Successfully...",
    };
  } catch (error) {
    console.log(error);
    return {
      flag: true,
      message: "Failed to Create User Auth Settings",
    };
  }
};

function constructWhereClause(
  field: "username" | "email",
  value: string,
  role: Role
): Prisma.userWhereUniqueInput {
  switch (field) {
    case "username":
      return { username: value, role: role };
    case "email":
      return { email: value, role: role };
    default:
      throw new Error(`Invalid field: ${field}`);
  }
}

export const getUser = async (
  username: string,
  includePassword: boolean,
  field: "username" | "email",
  role: Role
): Promise<UserPayload> => {
  try {
    const whereClause = await constructWhereClause(field, username, role);

    const user = await prisma.user.findUnique({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        password: includePassword,
      },
    });

    return user!;
  } catch (error) {
    console.error(`Error finding user by ${field}:`, error);
    throw error;
  }
};

export const getUserAuthSettings = async (userId: string) => {
  try {
    const userAuth = await prisma.userAuthSettings.findUnique({
      where: {
        userId: userId,
      },
    });

    return userAuth;
  } catch (error) {
    console.error(`Error finding user Auth Settings:`, error);
    throw error;
  }
};

export const checkPasswordCorrect = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const match = await bcrypt.compare(password, hashedPassword);

  return match;
};

export const loginServiceforAdmin = async (
  username: string,
  password: string,
  role: Role,
  isMail: boolean
): Promise<ReturnPayload> => {
  let user;

  if (isMail) {
    user = await getUser(username, true, "email", role);
  } else {
    user = await getUser(username, true, "username", role);
  }

  let userAuth = await getUserAuthSettings(user.id);

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
            message: `You have exceeded the number of attempts. You can login after ${getDifferenceOfTwoDatesInMinutes(
              currentTime,
              limitTime
            )} minutes.`,
          };
        }

        await prisma.userAuthSettings.update({
          where: { userId: user.id },
          data: {
            loginReactiveTime: expireTime,
            loginRetryLimit: userAuth.loginRetryLimit! + 1,
          },
        });

        return {
          flag: true,
          message: `you have exceed the number of limit.you can login after ${getDifferenceOfTwoDatesInMinutes(
            currentTime,
            expireTime
          )} minutes`,
        };
      } else {
        await prisma.userAuthSettings.update({
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
    } else {
      await prisma.userAuthSettings.update({
        where: { userId: user.id },
        data: {
          loginReactiveTime: expireTime,
          loginRetryLimit: userAuth.loginRetryLimit! + 1,
        },
      });

      return {
        flag: true,
        message: `You have exceed the number of limit.you can login after ${getDifferenceOfTwoDatesInMinutes(
          currentTime,
          expireTime
        )} minutes`,
      };
    }
  }

  const isPasswordMatch = await checkPasswordCorrect(password, user.password!);
  if (!isPasswordMatch) {
    await prisma.userAuthSettings.update({
      where: {
        userId: user.id,
      },
      data: {
        loginRetryLimit: userAuth?.loginRetryLimit! + 1,
      },
    });

    return {
      flag: true,
      message: `Incorrect Password. You have ${
        3 - userAuth?.loginRetryLimit!
      } tries left`,
    };
  }

  // generating tokens if password is correct...
  let tokens: Tokens = {
    token: await generateJwtToken(user),
    refreshToken: await generateRefreshToken(user),
  };

  // resetting login retry limit and time...
  if (userAuth && userAuth.loginRetryLimit > 0) {
    await prisma.userAuthSettings.update({
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
    data: await removePassword(user),
    message: "Log In Success...",
  };
};

export const loginServiceForUser = async (
  username: string,
  password: string,
  role: Role,
  isMail: boolean
) => {
  let user;

  if (isMail) {
    user = await getUser(username, true, "email", role);
  } else {
    user = await getUser(username, true, "username", role);
  }

  if (!user) {
    return {
      flag: true,
      message: "User Not Found",
    };
  }

  const isPasswordMatch = await checkPasswordCorrect(password, user.password!);
  if (!isPasswordMatch) {
    return {
      flag: true,
      message: `Incorrect Password...`,
    };
  }

  let tokens: Tokens = {
    token: await generateJwtToken(user),
    refreshToken: await generateRefreshToken(user),
  };

  return {
    flag: false,
    tokens: tokens,
    data: await removePassword(user),
    message: "Log In Success...",
  };
};

export async function getUserFromToken(token: string, SECRET: string) {
  try {
    const decodedUser = await verify(token, SECRET!);

    return decodedUser;
  } catch (error) {
    return null;
  }
}

export async function renewTokens(user: UserPayload) {
  try {
    let tokens: Tokens = {
      token: await generateJwtToken(user),
      refreshToken: await generateRefreshToken(user),
    };

    return {
      flag: false,
      tokens: tokens,
      data: user,
      message: "New Access Tokens Generated Successfully...",
    };

  } catch (error) {
    return {
      flag: true,
      message: error,
    };
  }
}