-- AlterEnum (safe if MAIN_FLOOR was already added in an updated initial migration)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'FloorArea' AND e.enumlabel = 'MAIN_FLOOR'
  ) THEN
    ALTER TYPE "FloorArea" ADD VALUE 'MAIN_FLOOR';
  END IF;
END $$;
