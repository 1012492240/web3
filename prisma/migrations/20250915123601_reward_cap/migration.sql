/*
  Warnings:

  - You are about to drop the column `bgc_node_dynamic_reward_cap` on the `user_balance` table. All the data in the column will be lost.
  - You are about to drop the column `bgc_reward_cap` on the `user_balance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_balance" DROP COLUMN "bgc_node_dynamic_reward_cap",
DROP COLUMN "bgc_reward_cap",
ADD COLUMN     "stake_dynamic_reward_cap" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "stake_reward_cap" DECIMAL(65,30) NOT NULL DEFAULT 0;
