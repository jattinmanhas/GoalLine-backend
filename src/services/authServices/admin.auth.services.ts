import { ReturnPayload } from "../../types/index.types";
import bcrypt from "bcrypt";
import prisma from "../../config/prismaConfig";
import { generateRefreshTokenForAdmin, genereateAccessTokenForAdmin } from "../../utils/auth/tokens";

export const createAdminUser = async (
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
    const adminUser = await prisma.user.create({
      data: {
        username,
        email,
        firstname: firstName,
        middleName,
        lastname: lastName,
        roleId,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = adminUser;

    return {
      flag: false,
      data: userWithoutPassword,
      message: "Admin user created successfully",
    };
  } catch (error) {
    return {
      flag: true,
      data: null,
      message: "Error creating admin user",
    };
  }
};

export const loginServiceforAdmin = async (
  username: string,
  password: string
)=> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
      },
    });

    if (!user) {
      return {
        flag: true,
        data: null,
        message: "User not found",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        flag: true,
        data: null,
        message: "Invalid Password",
      };
    }

    const accessToken = genereateAccessTokenForAdmin(user);
    const refreshToken = await generateRefreshTokenForAdmin(user);

    return {
      flag: false,
      data: {user, accessToken, refreshToken},
      message: "Login Success",
    };
  } catch (error) {
    return {
      flag: true,
      data: null,
      message: "Error logging in",
    };
  }
};
