import { PrismaClient } from "@prisma/client";
import {
  categoryInsert,
  productImageMetadata,
  productInsert,
} from "../types/index.types";

const prisma = new PrismaClient();

export const createCategory = async (categoryData: categoryInsert) => {
  try {
    const insertCategory = await prisma.category.create({
      data: {
        name: categoryData.category_name,
        description: categoryData.category_description,
        imageName: categoryData.imageName,
        eTag: categoryData.eTag,
        createdBy: categoryData.createdBy as string,
      },
    });

    return {
      flag: false,
      data: insertCategory,
      message: "Category Created Successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Create Category...",
    };
  }
};

export const createProduct = async (productData: productInsert) => {
  try {
    const insertProduct = await prisma.product.create({
      data: {
        name: productData.product_name,
        description: productData.product_description,
        price: productData.product_price,
        stock: Number(productData.stock),
        createdBy: productData.createdBy as string,
        category_id: productData.category_id,
        isDeleted: false,
      },
    });

    return {
      flag: false,
      data: insertProduct,
      message: "Product Created Successfully...",
    };
  } catch (error) {
    console.log(error);
    return {
      flag: true,
      message: "Failed To Create Product...",
    };
  }
};

export const insertProductImageMetadata = async (
  productImageData: productImageMetadata
) => {
  try {
    const insertProductImage = await prisma.productImage.create({
      data: {
        product_id: productImageData.product_id,
        imageName: productImageData.imageName,
        eTag: productImageData.etag,
      },
    });

    return {
      flag: false,
      data: insertProductImage,
      message: "Product Image Metadata Inserted Successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Insert Product Images Metadata...",
    };
  }
};

export const getAllCategoriesService = async () => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        category_id: true,
        name: true,
        description: true,
        imageName: true,
        eTag: true,
        isDeleted: true,
        products: {
          select: {
            product_id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
          },
        },
      },
    });

    return {
      flag: false,
      data: categories,
      message: "All Categories fetched successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Fetch All Categories...",
    };
  }
};

export const getAllProductsService = async () => {
  try {
    const allProducts = await prisma.product.findMany({
      select: {
        product_id: true,
        category_id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        Ratings: true,
        isDeleted: true,
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
            username: true,
            fullname: true,
          },
        },
      },
    });

    return {
      flag: false,
      data: allProducts,
      message: "All Products fetched successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Fetch all Products...",
    };
  }
};

export const getSingleProductService = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        product_id: id,
      },
      select: {
        product_id: true,
        category_id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        isDeleted: true,
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
            username: true,
            fullname: true,
          },
        },
      },
    });

    return {
      flag: false,
      data: product,
      message: "Product fetched successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Fetch Product...",
    };
  }
};

export const searchProductsService = async(
  search: string,
  skip: Number,
  take: Number
) => {
  try {
    const product = await prisma.product.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      skip: Number(skip),
      take: Number(take),
      select: {
        product_id: true,
        category_id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        isDeleted: true,
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
            username: true,
            fullname: true,
          },
        },
      },
    });

    return {
      flag: false,
      data: product,
      message: "Products fetched successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Fetch Products...",
    };
  }
};
