/*
  Warnings:

  - The values [BGC,BGB] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bgc_locked_points` on the `user_balance` table. All the data in the column will be lost.
  - You are about to drop the column `bgc_points` on the `user_balance` table. All the data in the column will be lost.
  - You are about to drop the column `bgc_staked_points` on the `user_balance` table. All the data in the column will be lost.
  - You are about to drop the column `galaxyActive` on the `user_info` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('USDT', 'TXT');
ALTER TABLE "tx_flow" ALTER COLUMN "token_type" TYPE "TokenType_new" USING ("token_type"::text::"TokenType_new");
ALTER TABLE "transaction" ALTER COLUMN "token_type" TYPE "TokenType_new" USING ("token_type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
COMMIT;

-- AlterTable
ALTER TABLE "user_balance" DROP COLUMN "bgc_locked_points",
DROP COLUMN "bgc_points",
DROP COLUMN "bgc_staked_points",
ADD COLUMN     "token_locked_points" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "token_points" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "token_staked_points" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_info" DROP COLUMN "galaxyActive",
ADD COLUMN     "interest_active" BOOLEAN;
