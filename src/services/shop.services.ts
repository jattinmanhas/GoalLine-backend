import { PrismaClient } from "@prisma/client";
import {
  categoryInsert,
  ProductImage,
  productImageMetadata,
  productInsert,
  ProductType,
} from "../types/index.types";
import { getSignedForImage } from "./s3Service";

const prisma = new PrismaClient({});

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

export const getAllCategoriesService = async (skip: number, take: number) => {
  try {
    const categories = await prisma.category.findMany({
      skip: Number(skip),
      take: Number(take),
      include: {
        products: {
          select: {
            product_id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            Ratings: true,
          },
        },
        creator: {
          select: {
            fullname: true,
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

export const getAllProductsService = async (skip: number, take: number) => {
  try {
    const allProducts = await prisma.product.findMany({
      skip: Number(skip),
      take: Number(take),
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

    if (!product) {
      return {
        flag: true,
        data: null,
        message: "Product not found.",
      };
    }

    const imagesWithSignedUrls = await Promise.all(
      product.images.map(async (image) => ({
        ...image,
        signedUrl: await getSignedForImage(image.imageName),
      }))
    );

    if (imagesWithSignedUrls) {
      product.images = imagesWithSignedUrls;
    }

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

export const searchProductsService = async (
  search: string,
  skip: Number,
  take: Number
) => {
  try {
    const product = await prisma.product.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
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

export const searchCategoriesService = async (search: string, take: Number) => {
  try {
    const category = await prisma.category.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      take: Number(take),
      select: {
        category_id: true,
        name: true,
        description: true,
      },
    });

    return {
      flag: false,
      data: category,
      message: "Categories fetched successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Fetch Categories...",
    };
  }
};

export const createCartItemForUser = async (
  product_id: string,
  user_id: string,
  quantity: number
) => {
  try {
    const createCartItem = await prisma.cartItems.create({
      data: {
        user_id: user_id,
        product_id: product_id,
        quantity: quantity,
        addedAt: new Date(),
      },
    });

    return {
      flag: false,
      data: createCartItem,
      message: "Item added to the Cart Successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To add item to the Cart...",
    };
  }
};

export const getUserCartItem = async (user_id: string, product_id: string) => {
  try {
    const cartItem = await prisma.cartItems.findFirst({
      where: {
        user_id: user_id,
        product_id: product_id,
      },
    });

    return {
      flag: false,
      data: cartItem,
      message: "Cart Item fetched successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Fetch Cart Item...",
    };
  }
};

export const updateCartItemQuantity = async (
  user_id: string,
  product_id: string,
  quantity: number
) => {
  try {
    const updateQuantity = await prisma.cartItems.updateMany({
      where: {
        user_id: user_id,
        product_id: product_id,
      },
      data: {
        quantity: quantity,
      },
    });

    return {
      flag: false,
      data: updateQuantity,
      message: "Cart Item Quantity Updated Successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed to update Cart Item Quantity...",
    };
  }
};

export const updateCartItemQuantityWithCartItemId = async (
  cart_items_id: number,
  quantity: number
) => {
  try {
    const updateQuantity = await prisma.cartItems.update({
      where: {
        cart_items_id: cart_items_id,
      },
      data: {
        quantity: quantity,
      },
    });

    return {
      flag: false,
      data: updateQuantity,
      message: "Cart Item Quantity Updated Successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed to update Cart Item Quantity...",
    };
  }
};

export const getUserAllCartItems = async (user_id: string) => {
  try {
    const cartItem = await prisma.cartItems.findMany({
      where: {
        user_id: user_id,
      },
      select: {
        cart_items_id: true,
        quantity: true,
        user_id: true,
        product: {
          select: {
            name: true,
            product_id: true,
            price: true,
            stock: true,
            images: {
              select: {
                imageName: true,
              },
            },
          },
        },
      },
    });

    const cartItemsWithSignedUrls = await Promise.all(
      cartItem.map(async (item) => ({
        ...item,
        product: {
          ...item.product,
          images: await Promise.all(
            item.product.images.map(async (image) => ({
              ...image,
              signedUrl: await getSignedForImage(image.imageName),
            }))
          ),
        },
      }))
    );

    return {
      flag: false,
      data: cartItemsWithSignedUrls,
      message: "Cart Items fetched successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Fetch Cart Items...",
    };
  }
};

export const deleteItemFromUserCartService = async (
  userId: string,
  productId: string
) => {
  try {
    const deleteItem = await prisma.cartItems.deleteMany({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    return {
      flag: false,
      data: deleteItem,
      message: "Cart Item Deleted Successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed to Delete Cart Item Quantity...",
    };
  }
};

export const getUserAllCartItemsCount = async (user_id: string) => {
  try {
    const cartItemCount = await prisma.cartItems.count({
      where: {
        user_id: user_id,
      },
    });

    return {
      flag: false,
      data: cartItemCount,
      message: "Cart Items Count fetched successfully...",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed To Fetch Cart Items Count...",
    };
  }
};

export const GetSignedProductsImageUrl = async (allProducts: ProductType[]) => {
  return await Promise.all(
    allProducts.map(async (product) => {
      let images: ProductImage[] = [];
      if (product.images) {
        images = await Promise.all(
          product.images.map(async (image) => ({
            ...image,
            signedUrl: await getSignedForImage(image.imageName),
          }))
        );
      }
      return {
        ...product,
        images,
      };
    })
  );
};

export const getAllProductInCategoryService = async (
  category_id: string,
  skip: number,
  take: number
) => {
  try {
    const userDetails = await prisma.product.findMany({
      where: {
        category_id: category_id,
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
      data: userDetails,
      message: "Successfully Fetched All Products in Single Category.",
    };
  } catch (error) {
    return {
      flag: true,
      data: null,
      message: "Failed to Fetch All Products in Single Category.",
    };
  }
};

export async function createOrder(
  customerId: string,
  totalAmount: number,
  currency: string,
  status: string
) {
  return await prisma.order.create({
    data: {
      customerId,
      totalAmount,
      currency,
      status,
    },
  });
}

export async function createPayment(
  orderId: string,
  paymentId: string,
  currency: string,
  status: string
) {
  return await prisma.payment.create({
    data: {
      orderId,
      paymentId,
      currency,
      status,
    },
  });
}

export async function createOrderItem(
  orderId: string,
  productId: string,
  quantity: number
) {
  return await prisma.orderItem.create({
    data: {
      orderId,
      productId,
      quantity,
    },
  });
}

export async function clearCartForUser(userId: string) {
  try {
    // Delete all CartItems associated with the user
    return await prisma.cartItems.deleteMany({
      where: {
        user_id: userId,
      },
    });
  } catch (error) {
    console.error(`Error clearing cart for user with ID: ${userId}`, error);
    throw error;
  }
}

export async function getAllProductsCountService(){
  try{
    const productsCount = await prisma.product.count({})

    return {
      flag: false,
      data: productsCount,
      message: "Products Count fetched successfully...",
    }

  }catch(error){
    return {
      flag: true,
      data: null,
      message: "Failed to fetch Products Count.", error
    }
  }
}


export async function getAllCategoryCountService(){
  try{
    const categoryCount = await prisma.category.count({})

    return {
      flag: false,
      data: categoryCount,
      message: "Category Count fetched successfully...",
    }

  }catch(error){
    return {
      flag: true,
      data: null,
      message: "Failed to fetch Category Count.", error
    }
  }
}

export async function getAllOrdersWithPaymentsService() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                description: true
              }
            }
          }
        },
        payment: true
      }
    });

    return {
      flag: false,
      data: orders,
      message: "Orders with payments fetched successfully..."
    };

  } catch (error) {
    return {
      flag: true,
      data: null,
      message: "Failed to fetch orders with payments.",
      error
    };
  }
}
