/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_id]` on the table `CartItems` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CartItems_user_id_product_id_key" ON "CartItems"("user_id", "product_id");
