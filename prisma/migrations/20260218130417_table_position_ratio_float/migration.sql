-- AlterTable (x,y: distance-from-edge ratios 0-1; legacy int values become float)
ALTER TABLE "Table" ALTER COLUMN "x" SET DEFAULT 0,
ALTER COLUMN "x" SET DATA TYPE DOUBLE PRECISION USING "x"::double precision,
ALTER COLUMN "y" SET DEFAULT 0,
ALTER COLUMN "y" SET DATA TYPE DOUBLE PRECISION USING "y"::double precision;
