/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the `MenuItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MenuItemToPromotion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "_MenuItemToPromotion" DROP CONSTRAINT "_MenuItemToPromotion_A_fkey";

-- DropForeignKey
ALTER TABLE "_MenuItemToPromotion" DROP CONSTRAINT "_MenuItemToPromotion_B_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "restaurantId";

-- DropTable
DROP TABLE "MenuItem";

-- DropTable
DROP TABLE "_MenuItemToPromotion";

-- CreateTable
CREATE TABLE "MenuItems" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "categoryId" INTEGER NOT NULL,
    "description" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "restaurantId" INTEGER NOT NULL,

    CONSTRAINT "MenuItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MenuItemsToPromotion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MenuItemsToPromotion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MenuItemsToPromotion_B_index" ON "_MenuItemsToPromotion"("B");

-- AddForeignKey
ALTER TABLE "MenuItems" ADD CONSTRAINT "MenuItems_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItems" ADD CONSTRAINT "MenuItems_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemsToPromotion" ADD CONSTRAINT "_MenuItemsToPromotion_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemsToPromotion" ADD CONSTRAINT "_MenuItemsToPromotion_B_fkey" FOREIGN KEY ("B") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
