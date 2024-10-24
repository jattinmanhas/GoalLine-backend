/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `eTag` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageName` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eTag` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageName` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "imageUrl",
ADD COLUMN     "eTag" VARCHAR(100) NOT NULL,
ADD COLUMN     "imageName" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "imageUrl",
ADD COLUMN     "eTag" VARCHAR(100) NOT NULL,
ADD COLUMN     "imageName" VARCHAR(255) NOT NULL;
