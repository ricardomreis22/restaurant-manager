/*
  Warnings:

  - You are about to drop the column `notes` on the `MenuItems` table. All the data in the column will be lost.
  - You are about to drop the column `sides` on the `MenuItems` table. All the data in the column will be lost.
  - You are about to drop the column `spicyLevel` on the `MenuItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItems" DROP COLUMN "notes",
DROP COLUMN "sides",
DROP COLUMN "spicyLevel";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "sides" TEXT,
ADD COLUMN     "spicyLevel" TEXT;
