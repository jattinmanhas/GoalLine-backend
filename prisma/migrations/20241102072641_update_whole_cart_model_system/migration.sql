/*
  Warnings:

  - You are about to drop the column `cart_id` on the `CartItems` table. All the data in the column will be lost.
  - You are about to drop the `Cart` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `CartItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CartItems" DROP CONSTRAINT "CartItems_cart_id_fkey";

-- AlterTable
ALTER TABLE "CartItems" DROP COLUMN "cart_id",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "addedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Cart";

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
