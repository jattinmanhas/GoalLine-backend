import { Role } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  roleId: string;
}

export interface Tokens {
  token: string;
  refreshToken?: string;
}

export interface ReturnPayload {
  flag: boolean;
  data: UserPayload | null;
  tokens?: Tokens;
  message: string;
}

export type categoryInsert = {
  category_name: string;
  category_description?: string;
  imageName?: string;
  eTag?: string;
  isDeleted: Number;
  createdBy?: string;
};

export type productInsert = {
  product_name: string;
  product_description: string;
  product_price: number;
  stock: number;
  createdBy: string;
  category_id: string;
};

export type productImageMetadata = {
  product_id: string;
  imageName: string;
  etag: string | undefined;
};

export type categoryType = {
  name: string;
  category_id: string;
  description: string | null;
  imageName: string | null;
  eTag: string | null;
  isDeleted: boolean;
  products: {
    name: string;
    description: string | null;
    product_id: string;
    price: Decimal;
    stock: number;
  }[];
};

type Creator = {
  username?: string | null;
  firstname: string | null;
};

type CategoryForProducts = {
  name: string;
  description: string | null;
};


export type ProductImage = {
  imageName: string;
  eTag: string | null;
  image_id: number;
  signedUrl?: string;
};

export type ProductType = {
  product_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: Decimal | string; // Assuming price may be stored as Decimal or string
  stock: number;
  Ratings: Decimal | string; // Assuming Ratings may be stored as Decimal or string
  isDeleted: boolean;
  category: CategoryForProducts;
  images: ProductImage[];
  creator: Creator;
};


export type SectionImage = {
  id: string;
  imageName: string;
  sectionId: string | null;
  signedUrl?: string; // Signed URL added after processing
};

// Type for each blog post section
export type BlogSection = {
  id: string;
  heading: string;
  paragraph: string | null;
  order: number;
  blogId: string;
  image?: SectionImage | null; // Optional, as some sections may not have images
};

// Category type for blog post
type Category = {
  name: string;
};

// Author type for blog post
type Author = {
  firstname: string | null;
};

// Type for each blog post
export type BlogPost = {
  id: string;
  title: string;
  description: string;
  mainImage: string | null; // Optional field
  mainImageSignedUrl?: string; // Signed URL for the main image, added after processing
  createdAt?: Date;
  updatedAt?: Date;
  category_id: string;
  authorId: string;
  category: Category;
  sections: BlogSection[];
  author: Author;
};
