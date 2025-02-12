import { PrismaClient, Role, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { UserPayload, ReturnPayload, Tokens } from "../types/index.types";
import { generateJwtToken, generateRefreshToken } from "../utils/auth/tokens";
import {
  removePassword,
  getDifferenceOfTwoDatesInMinutes,
} from "../utils/common";
import { verify } from "jsonwebtoken";
import { asyncHander } from "../utils/handlers/asyncHander";
import { getSignedForImagesUsingCloudFront } from "./s3Service";
import prisma from "../config/prismaConfig";

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
): Promise<ReturnPayload> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    // const user = await prisma.user.create({
    //   data: {
    //     username: username,
    //     email: email,
    //     password: hashedPassword,
    //     fullname: fullname,
    //     role: role,
    //   },
    //   select: {
    //     id: true,
    //     email: true,
    //     username: true,
    //     role: true,
    //   },
    // });

    return {
      flag: false,
      data: null,
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

//   const isPasswordMatch = await checkPasswordCorrect(password, user.password!);
//   if (!isPasswordMatch) {
//     await prisma.userAuthSettings.update({
//       where: {
//         userId: user.id,
//       },
//       data: {
//         loginRetryLimit: userAuth?.loginRetryLimit! + 1,
//       },
//     });

//     return {
//       flag: true,
//       message: `Incorrect Password. You have ${
//         3 - userAuth?.loginRetryLimit!
//       } tries left`,
//     };
//   }

//   // generating tokens if password is correct...
//   let tokens: Tokens = {
//     token: await generateJwtToken(user),
//     refreshToken: await generateRefreshToken(user),
//   };

//   // resetting login retry limit and time...
//   if (userAuth && userAuth.loginRetryLimit > 0) {
//     await prisma.userAuthSettings.update({
//       where: {
//         userId: user.id,
//       },
//       data: {
//         loginRetryLimit: 0,
//         loginReactiveTime: null,
//       },
//     });
//   }

//   return {
//     flag: false,
//     tokens: tokens,
//     data: await removePassword(user),
//     message: "Log In Success...",
//   };
// };

export const loginServiceForUser = async (
  username: string,
  password: string,
  role: Role,
  isMail: boolean,
  isGoogle: boolean = false
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

  // if (!isGoogle) {
  //   const isPasswordMatch = await checkPasswordCorrect(
  //     password,
  //     user.password!
  //   );
  //   if (!isPasswordMatch) {
  //     return {
  //       flag: true,
  //       message: `Incorrect Password...`,
  //     };
  //   }
  // }
  // let tokens: Tokens = {
  //   token: await generateJwtToken(user),
  //   refreshToken: await generateRefreshToken(user),
  // };

  return {
    flag: false,
    // tokens: tokens,
    data: user,
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
        // fullname: true,
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
      include : {
        user : {
          select : {
            username : true,
            // fullname : true,
          }
        }
      }
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

export const getAllUsersService = async () => {
  try{
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        // fullname: true,
        mobileNo: true,
        email: true,
        role: true,
        imageUrl: true,
        isDeleted: true,
        updatedDatetime: true,
      }
    })

    return {
      flag: false,
      data: users,
      message: "Successfully Fetched All Users",
    }
  }catch(error){
    return {
      flag: true,
      data: null,
      message: "Failed to Fetch All Users " + error,
    }
  }
}

export const getAllUsersCountService = async () => {
  try{
    const users = await prisma.user.count();

    return {
      flag: false,
      data: users,
      message: "Successfully Fetched Users Count",
    }
  }catch (error) {
    return {
      flag: true,
      data: null,
      message: "Failed to Fetch Users Count", error
    }
  }
}