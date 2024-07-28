/*
  Warnings:

  - You are about to drop the column `mobileNo` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "mobileNo",
ALTER COLUMN "fullname" DROP NOT NULL,
ALTER COLUMN "updatedBy" DROP NOT NULL,
ALTER COLUMN "updatedDatetime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "userAuthSettings" ALTER COLUMN "loginReactiveTime" DROP NOT NULL,
ALTER COLUMN "resetPasswordToken" DROP NOT NULL,
ALTER COLUMN "expiredTimeOfResetPasswordToken" DROP NOT NULL,
ALTER COLUMN "updatedBy" DROP NOT NULL,
ALTER COLUMN "updatedDatetime" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
