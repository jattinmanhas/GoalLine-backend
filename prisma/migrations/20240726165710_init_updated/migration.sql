-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "mobileNo" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,
    "updatedDatetime" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userAuthSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginRetryLimit" INTEGER NOT NULL DEFAULT 0,
    "loginReactiveTime" TIMESTAMP(3) NOT NULL,
    "resetPasswordToken" TEXT NOT NULL,
    "expiredTimeOfResetPasswordToken" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,
    "updatedDatetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userAuthSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_username_email_idx" ON "user"("username", "email");

-- CreateIndex
CREATE UNIQUE INDEX "userAuthSettings_userId_key" ON "userAuthSettings"("userId");

-- CreateIndex
CREATE INDEX "userAuthSettings_resetPasswordToken_idx" ON "userAuthSettings"("resetPasswordToken");

-- AddForeignKey
ALTER TABLE "userAuthSettings" ADD CONSTRAINT "userAuthSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
