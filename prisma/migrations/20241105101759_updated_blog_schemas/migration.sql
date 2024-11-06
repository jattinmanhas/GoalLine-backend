/*
  Warnings:

  - You are about to drop the column `productProduct_id` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `altText` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Image` table. All the data in the column will be lost.
  - Added the required column `imageName` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_productProduct_id_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "productProduct_id";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "altText",
DROP COLUMN "url",
ADD COLUMN     "imageName" TEXT NOT NULL;
