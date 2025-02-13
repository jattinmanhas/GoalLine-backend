import { PrismaClient, Role, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { UserPayload, ReturnPayload, Tokens } from "../../types/index.types";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/auth/tokens";
import {
  removePassword,
  getDifferenceOfTwoDatesInMinutes,
} from "../../utils/common";
import { verify } from "jsonwebtoken";
import { asyncHander } from "../../utils/handlers/asyncHander";
import { getSignedForImagesUsingCloudFront } from "../s3Service";
import prisma from "../../config/prismaConfig";
import { ApiError } from "../../utils/handlers/apiError";
import client from "../../config/redisClient";

/**
 * @description : Create new User
 * @param {string} username : username entered by user
 * @return {object} : Return userdata, flag and message
 */

export const createUser = async (
  username: string,
  email: string,
  password: string,
  firstName: string,
  middleName: string | null,
  lastName: string,
  roleId: string
): Promise<ReturnPayload> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        firstname: firstName,
        middleName: middleName,
        lastname: lastName,
        roleId: roleId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        roleId: true,
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
      data: null,
      message: "Failed to Create New User...",
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
) => {
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

export const checkPasswordCorrect = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const match = await bcrypt.compare(password, hashedPassword);

  return match;
};

export const loginServiceForUser = async (
  username: string,
  password: string
) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return {
        flag: true,
        message: "User Not Found",
      };
    }

    if(user.role?.name === "ADMIN") {
      return {
        flag: true,
        message: "Invalid Role",
      };
    }

    const isPasswordMatch = await checkPasswordCorrect(
      password,
      user.password!
    );
    if (!isPasswordMatch) {
      return {
        flag: true,
        message: `Incorrect Password...`,
      };
    }

    let tokens: Tokens = {
      token: await generateAccessToken(user),
      refreshToken: await generateRefreshToken(user),
    };

    return {
      flag: false,
      tokens: tokens,
      data: user,
      message: "Login Success",
    };
  } catch (error) {
    console.error("Error during login:", error);
    return {
      flag: true,
      message: "Login Failed",
      data: null,
    };
  }
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
      token: await generateAccessToken(user),
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

export const getCompleteUserDetailsService = async (userId: string) => {
  try {
    const userDetails = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        middleName: true,
        lastname: true,
        mobileNo: true,
        imageUrl: true,
        role: true,
        userAddress: {
          include: {},
        },
      },
    });

    let userWithSignedUrl = userDetails
      ? { ...userDetails, signedUrl: "" }
      : null;

    if (userWithSignedUrl?.imageUrl) {
      userWithSignedUrl.signedUrl = await getSignedForImagesUsingCloudFront(
        userWithSignedUrl.imageUrl
      );
    }

    return {
      flag: false,
      data: userWithSignedUrl,
      message: "Successfully Fetched User Details",
    };
  } catch (error) {
    return {
      flag: true,
      data: null,
      message: "Failed to Fetch User Details",
    };
  }
};

export async function updateUserDetailsService(
  id: string,
  email: string,
  fullname: string,
  mobileNo: string,
  filename: string
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id }, // Update based on unique ID
      data: {
        email: email,
        // fullname: fullname,
        mobileNo: mobileNo,
        imageUrl: filename,
      },
    });

    return {
      flag: false,
      message: "User Details Updated Successfully",
      data: updatedUser,
    };
  } catch (error) {
    return {
      message: "Error updating user:",
      error,
      flag: true,
      data: null,
    };
  }
}

export async function updateUserAddressService(
  userAddressId: number,
  street: string,
  city: string,
  state: string,
  postalCode: string,
  country: string,
  isDefault: boolean
) {
  try {
    const updatedAddress = await prisma.userAddress.update({
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
  } catch (error) {
    return {
      message: "Error updating user:",
      error,
      flag: true,
      data: null,
    };
  }
}

export async function createUserAddressService(
  userId: string,
  street: string,
  city: string,
  state: string,
  postalCode: string,
  country: string,
  isDefault: boolean
) {
  try {
    const newAddress = await prisma.userAddress.create({
      data: {
        userId,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault ?? false,
      },
    });

    return {
      flag: false,
      message: "User Address Details Updated Successfully",
      data: newAddress,
    };
  } catch (error) {
    return {
      message: "Error updating user:",
      error,
      flag: true,
      data: null,
    };
  }
}

export const getUserAddressFromUserId = async (userId: string) => {
  try {
    const userDetails = await prisma.userAddress.findFirst({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            username: true,
            // fullname : true,
          },
        },
      },
    });

    return {
      flag: false,
      data: userDetails,
      message: "Successfully Fetched User Details",
    };
  } catch (error) {
    return {
      flag: true,
      data: null,
      message: "Failed to Fetch User Details",
    };
  }
};

export const refreshAuthTokens = async (
  userId: string,
  oldRefreshToken: string
) => {
  try {
    const storedToken = await client.get(userId);

    if (!storedToken || storedToken !== oldRefreshToken) {
      throw new ApiError(
        401,
        "Unauthorized",
        [
          {
            message: "Refresh Token Invalid or Expired",
            field: "Authentication Middleware",
          },
        ],
        null
      );
    }

    const decoded = (await getUserFromToken(
      oldRefreshToken,
      process.env.REFRESH_SECRET!
    )) as unknown as UserPayload;

    if (!decoded || decoded.id !== userId) {
      throw new ApiError(
        401,
        "Unauthorized",
        [{ message: "Invalid Refresh Token" }],
        null
      );
    }

    const tokens = await renewTokens(decoded);
    if (!tokens.tokens?.token || !tokens.tokens?.refreshToken) {
      throw new ApiError(
        401,
        "Unauthorized",
        [{ message: "Error Generating Tokens" }],
        null
      );
    }

    await client.set(userId, tokens.tokens.refreshToken, { EX: 60 * 60 * 24 });

    return tokens;
  } catch (error) {
    throw new ApiError(
      401,
      "Unauthorized",
      [
        {
          message: "Refresh Token Generation Failed...",
          field: "Authentication Middleware",
        },
      ],
      null
    );
  }
};


export const getRoleDetailsFromRoleId = async (roleId: string) => {
  try {
    const roleDetails = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    return {
      flag: false,
      data: roleDetails,
      message: "Successfully Fetched Role Details",
    };
  } catch (error) {
    return {
      flag: true,
      data: null,
      message: "Failed to Fetch Role Details",
    };
  }
}