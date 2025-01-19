import { PrismaClient } from "@prisma/client";
import { BlogPost, BlogSection } from "../types/index.types";
import { getSignedForImage } from "./s3Service";

const prisma = new PrismaClient({});

export async function getBlogWithSections(blogId: string) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
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
        sections: {
          orderBy: { order: "asc" },
          include: {
            image: true, // Include image for each section
          },
        },
      },
    });

    if (!blog) {
      return {
        flag: true,
        data: blog,
        message: "Blog Not Found.",
      };
    }

    const blogWithSignedUrl = await addSignedUrlsToSinglePost(blog);

    return {
      flag: false,
      data: blogWithSignedUrl,
      message: "Blog Fetched Successfully.",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed to find Blog.",
      data: null,
    };
  }
}

export async function createNewBlogService(
  title: string,
  desciption: string,
  mainImage: string | null,
  category_id: string,
  authorId: string
) {
  try {
    const blog = await prisma.blog.create({
      data: {
        title: title,
        description: desciption,
        mainImage: mainImage,
        createdAt: new Date(),
        category_id: category_id,
        authorId: authorId,
      },
    });

    return {
      flag: false,
      data: blog,
      message: "Blog Fetched Successfully.",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed to Create Blog.",
      data: null,
    };
  }
}

export async function createNewBlogSection(section: BlogSection) {
  try {
    const createdSection = await prisma.section.create({
      data: {
        heading: section.heading,
        paragraph: section.paragraph,
        order: section.order,
        blogId: section.blogId!, // Link to the created blog
      },
    });

    return {
      flag: false,
      data: createdSection,
      message: "Blog Section Created Successfully.",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed to Create Blog Section.",
      data: null,
    };
  }
}

export async function createNewBlogSectionImage(
  imageName: string,
  sectionId: string
) {
  try {
    const createdSectionImage = await prisma.image.create({
      data: {
        imageName: imageName,
        sectionId: sectionId,
      },
    });

    return {
      flag: false,
      data: createdSectionImage,
      message: "Blog Section Image Created Successfully.",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed to Create Blog Section Image.",
      data: null,
    };
  }
}

const addSignedUrlsToResponse = async (responseData: BlogPost[]) => {
  return Promise.all(
    responseData.map(async (blogPost) => {
      if (blogPost.mainImage) {
        blogPost.mainImageSignedUrl = await getSignedForImage(
          blogPost.mainImage
        );
      }

      if (blogPost.sections && Array.isArray(blogPost.sections)) {
        blogPost.sections = await Promise.all(
          blogPost.sections.map(async (section) => {
            if (section.image && section.image.imageName) {
              section.image.signedUrl = await getSignedForImage(
                section.image.imageName
              );
            }
            return section;
          })
        );
      }

      return blogPost;
    })
  );
};

const addSignedUrlsToSinglePost = async (blogPost: BlogPost) => {
  if (blogPost.mainImage) {
    blogPost.mainImageSignedUrl = await getSignedForImage(blogPost.mainImage);
  }

  if (blogPost.sections && Array.isArray(blogPost.sections)) {
    blogPost.sections = await Promise.all(
      blogPost.sections.map(async (section) => {
        if (section.image && section.image.imageName) {
          section.image.signedUrl = await getSignedForImage(
            section.image.imageName
          );
        }
        return section;
      })
    );
  }

  return blogPost;
};

export async function getAllBlogsService(skip: number, take: number) {
  try {
    const blog = await prisma.blog.findMany({
      skip: skip,
      take: take,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        sections: {
          orderBy: { order: "asc" },
          include: {
            image: true, // Include image for each section
          },
        },
        author: {
          select: {
            fullname: true,
          },
        },
      },
    });

    const blogsWithSignedUrl = await addSignedUrlsToResponse(blog);

    return {
      flag: false,
      data: blogsWithSignedUrl,
      message: "Blogs Fetched Successfully.",
    };
  } catch (error) {
    return {
      flag: true,
      message: "Failed to find Blog.",
      data: null,
    };
  }
}

export const getBlogsCountService = async () => {
  try{
    const blogsCount = await prisma.blog.count({})

    return {
      flag: false,
      data: blogsCount,
      message: "Blogs Count fetched Successfully.",
    }
  }catch (error) {
    return{
      flag: true,
      message: "Failed to Fetch All Blogs Count.",
      data: null,
    }
  }
}