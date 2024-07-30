import { PrismaClient, Role, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

interface UserPayload {
  id: string;
  username: string;
  email: string;
  role?: Role;
  password?: string;
}

interface Tokens {
  token: string;
  refreshToken: string;
}

interface ReturnPayload {
  flag: boolean;
  data?: UserPayload;
  tokens?: Tokens;
  message: String;
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

/**
 * @description : Checks if the particular String is email or not
 * @param {string} input : username or email entered by user
 * @return {object} : Return true if entered string is email else false
 */

export function isEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

function constructWhereClause(
  field: "username" | "email",
  value: string
): Prisma.userWhereUniqueInput {
  switch (field) {
    case "username":
      return { username: value };
    case "email":
      return { email: value };
    default:
      throw new Error(`Invalid field: ${field}`);
  }
}

export const getUser = async (
  username: string,
  includePassword: boolean,
  field: "username" | "email"
): Promise<UserPayload> => {
  try {
    const whereClause = await constructWhereClause(field, username);

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

function getDifferenceOfTwoDatesInMinutes(date1: Date, date2: Date) {
  const diffInMilliseconds = date2.getTime() - date1.getTime();
  const diffInMinutes = diffInMilliseconds / 60000; // Convert milliseconds to minutes
  return Math.ceil(Math.abs(diffInMinutes)); // Return the absolute value to ensure the difference is positive
}

export const loginServiceforAdmin = async (
  username: string,
  password: string,
  role: Role,
  isMail: boolean
): Promise<ReturnPayload> => {
  let user;

  if (isMail) {
    user = await getUser(username, true, "email");
  } else {
    user = await getUser(username, true, "username");
  }

  let userAuth = await getUserAuthSettings(user.id);

  let currentTime = new Date();
  let expireTime = new Date(currentTime.getTime() + 30 * 60 * 1000);

  if (userAuth && userAuth.loginRetryLimit >= 3) {
    const limitTime = userAuth.loginReactiveTime
      ? new Date(userAuth.loginReactiveTime)
      : null;

    if (limitTime && limitTime > currentTime) {
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
        message: `You have exceeded the number of attempts. You can login after ${getDifferenceOfTwoDatesInMinutes(
          currentTime,
          expireTime
        )} minutes.`,
      };
    } else {
      await prisma.userAuthSettings.update({
        where: {
          userId: user.id,
        },
        data: {
          loginRetryLimit: userAuth?.loginRetryLimit! + 1,
          loginReactiveTime: expireTime,
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
      message: "Incorrect Password",
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
        loginReactiveTime: null
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

async function removePassword(user: UserPayload){
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

export const generateJwtToken = async (user: UserPayload) => {
  const JWT_SECRET =
    user.role == "ADMIN" ? process.env.ADMIN_SECRET : process.env.CLIENT_SECRET;

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  const token = await sign(payload, JWT_SECRET!, {
    expiresIn: "15m",
  });

  return token;
};

export const generateRefreshToken = async (user: UserPayload) => {
  const REFRESH_SECRET =
    user.role == "ADMIN"
      ? process.env.REFRESH_ADMIN_SECRET
      : process.env.REFRESH_CLIENT_SECRET;

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  const refreshToken = await sign(payload, REFRESH_SECRET!, {
    expiresIn: "1d",
  });

  return refreshToken;
};
