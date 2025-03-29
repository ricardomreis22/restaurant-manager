-- AlterTable
ALTER TABLE "MenuItems" ADD COLUMN     "hasSidesOption" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasSpicyOption" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT DEFAULT '',
ADD COLUMN     "sides" TEXT,
ADD COLUMN     "spicyLevel" TEXT;
