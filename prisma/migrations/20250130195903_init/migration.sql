/*
  Warnings:

  - The values [USER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `menuId` on the `MenuItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pin]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pin` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'STAFF');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF';
COMMIT;

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_menuId_fkey";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "pin" TEXT NOT NULL,
ALTER COLUMN "salary" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "isAvailable",
DROP COLUMN "menuId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE "_EventToTable" ADD CONSTRAINT "_EventToTable_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventToTable_AB_unique";

-- AlterTable
ALTER TABLE "_MenuItemToPromotion" ADD CONSTRAINT "_MenuItemToPromotion_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MenuItemToPromotion_AB_unique";

-- AlterTable
ALTER TABLE "_ReportToRestaurant" ADD CONSTRAINT "_ReportToRestaurant_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ReportToRestaurant_AB_unique";

-- AlterTable
ALTER TABLE "_RestaurantToSupplier" ADD CONSTRAINT "_RestaurantToSupplier_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RestaurantToSupplier_AB_unique";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "menuId" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_pin_key" ON "Employee"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_address_key" ON "Restaurant"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_phone_key" ON "Restaurant"("phone");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
