/*
  Warnings:

  - You are about to drop the column `owner` on the `user_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_info" DROP COLUMN "owner",
ADD COLUMN     "leader" TEXT;
