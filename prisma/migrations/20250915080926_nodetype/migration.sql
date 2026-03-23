/*
  Warnings:

  - The values [SYSTEM_INIT,COMMUNITY_INIT] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('NORMAL', 'GROUP', 'COMMUNITY', 'GALAXY');
ALTER TABLE "user_info" ALTER COLUMN "type" TYPE "UserType_new" USING ("type"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
COMMIT;
