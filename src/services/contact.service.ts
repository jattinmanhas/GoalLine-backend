import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

export const createContactService = async (
  email: string,
  subject: string,
  message: string
) => {
  try {
    const contact = prisma.contact.create({
      data: {
        email: email,
        subject: subject,
        message: message,
      },
    });

    return {
      flag: false,
      data: contact,
      message: "Query Created Successfully.",
    };
  } catch (error: any) {
    return {
      flag: true,
      data: null,
      message: `Error creating contact ${error.message}`,
    };
  }
};

export const searbhProductsCategoriesService = async (query: string) => {
  try {
    const [products, blogs] = await Promise.all([
      prisma.product.findMany({
        take: 10,
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          category: {
            select: {
              name: true,
              description: true,
            },
          },
          images: {
            select: {
              image_id: true,
              imageName: true,
              eTag: true,
            },
          },
          creator: {
            select: {
              fullname: true,
            },
          },
        },
      }),
      prisma.blog.findMany({
        take: 10,
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          author: {
            select: {
              fullname: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      flag: false,
      data: {products : [...products], blogs : [...blogs]},
      message: "Successfully fetched both products and Blogs",
    };
  } catch (error: any) {
    return {
      flag: true,
      data: null,
      message: `Error creating contact ${error.message}`,
    };
  }
};
