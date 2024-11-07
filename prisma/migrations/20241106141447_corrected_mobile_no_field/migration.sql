/*
  Warnings:

  - You are about to drop the column `moblileNo` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "moblileNo",
ADD COLUMN     "mobileNo" TEXT;
