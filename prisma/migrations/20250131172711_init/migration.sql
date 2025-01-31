/*
  Warnings:

  - You are about to drop the column `adminId` on the `Restaurant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_adminId_fkey";

-- DropIndex
DROP INDEX "Restaurant_adminId_key";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "adminId";
