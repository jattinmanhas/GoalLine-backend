import { ReturnPayload } from "../../types/index.types";
import bcrypt from "bcrypt";
import prisma from "../../config/prismaConfig";
import { generateRefreshToken, generateAccessToken } from "../../utils/auth/tokens";

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
      include : {
        role: {
          select: {
            name : true
          }
        }
      }
    });

    if (!user) {
      return {
        flag: true,
        data: null,
        message: "User not found",
      };
    }

    if(user.role.name !== "ADMIN"){
      return {
        flag: true,
        data: null,
        message: "Invalid Role",
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

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return {
      flag: false,
      data: {user, accessToken, refreshToken},
      message: "Admin Login Success",
    };
  } catch (error) {
    return {
      flag: true,
      data: null,
      message: "Error logging in",
    };
  }
};

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

export const getAllUsersService = async () => {
  try{
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstname: true,
        middleName: true,
        lastname: true,
        mobileNo: true,
        email: true,
        imageUrl: true,
        isDeleted: true,
        updatedDatetime: true,
        role: true
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