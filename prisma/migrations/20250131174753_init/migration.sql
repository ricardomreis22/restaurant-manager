/*
  Warnings:

  - You are about to drop the column `worksAtId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_worksAtId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "worksAtId";

-- CreateTable
CREATE TABLE "_UsersRestaurants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UsersRestaurants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UsersRestaurants_B_index" ON "_UsersRestaurants"("B");

-- AddForeignKey
ALTER TABLE "_UsersRestaurants" ADD CONSTRAINT "_UsersRestaurants_A_fkey" FOREIGN KEY ("A") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsersRestaurants" ADD CONSTRAINT "_UsersRestaurants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
