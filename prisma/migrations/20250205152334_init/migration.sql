/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `MenuItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "restaurantId";
