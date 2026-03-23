/*
  Warnings:

  - You are about to drop the column `bgc_dynamic_reward` on the `performance_history` table. All the data in the column will be lost.
  - You are about to drop the column `bgc_staked_points` on the `performance_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "performance_history" DROP COLUMN "bgc_dynamic_reward",
DROP COLUMN "bgc_staked_points",
ADD COLUMN     "token_dynamic_reward" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "token_staked_points" DECIMAL(65,30) NOT NULL DEFAULT 0;
