/*
  Warnings:

  - A unique constraint covering the columns `[number,restaurantId]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Table_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_restaurantId_key" ON "Table"("number", "restaurantId");
