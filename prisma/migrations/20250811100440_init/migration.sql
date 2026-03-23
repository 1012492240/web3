-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('NORMAL', 'GROUP', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "TxFlowType" AS ENUM ('IN', 'OUT', 'TRANSFER', 'ASSEMBLE', 'NODE_REWARD', 'STAKE', 'UNSTAKE', 'STAKE_STATIC_REWARD', 'STAKE_STATIC_DIRECT_REWARD', 'STAKE_DYNAMIC_REWARD', 'STAKE_DYNAMIC_INCUBATION_REWARD', 'STAKE_DYNAMIC_NODE_REWARD', 'STAKE_DYNAMIC_NODE_INCUBATION_REWARD', 'MARKET_EXPENSE', 'SECURITY_FUND', 'CLAIM', 'LOCK', 'AIRDROP', 'FLASH_SWAP');

-- CreateEnum
CREATE TYPE "TxFlowStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'ABORT', 'AUDITING', 'REFUSED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('USDT', 'BGC');

-- CreateTable
CREATE TABLE "user_info" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "nonce" TEXT,
    "type" "UserType",
    "superior" TEXT,
    "path" TEXT,
    "last_activity" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "buy_at" TIMESTAMP(3),
    "referral_code" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "blacklist" BOOLEAN,

    CONSTRAINT "user_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_balance" (
    "address" TEXT NOT NULL,
    "usdt_points" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bgc_points" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bgc_locked_points" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bgc_staked_points" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bgc_reward_cap" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bgc_node_dynamic_reward_cap" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_balance_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "tx_flow" (
    "id" SERIAL NOT NULL,
    "user_address" TEXT NOT NULL,
    "to_address" TEXT NOT NULL DEFAULT '',
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "TxFlowType" NOT NULL,
    "token_type" "TokenType" NOT NULL,
    "tx_hash" TEXT,
    "status" "TxFlowStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tx_flow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "tx_hash" TEXT,
    "from_address" TEXT NOT NULL,
    "to_address" TEXT NOT NULL,
    "type" "TxFlowType" NOT NULL,
    "token_type" "TokenType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "amount_fee" DECIMAL(65,30),
    "tx_fee" DECIMAL(65,30),
    "status" "TxFlowStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_process" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_process_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "proclaim" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "picture" TEXT NOT NULL DEFAULT '',
    "display" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proclaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_history" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "performance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bgc_staked_points" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bgc_dynamic_reward" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_info_address_key" ON "user_info"("address");

-- CreateIndex
CREATE UNIQUE INDEX "user_info_referral_code_key" ON "user_info"("referral_code");

-- CreateIndex
CREATE INDEX "user_info_superior_idx" ON "user_info"("superior");

-- CreateIndex
CREATE INDEX "user_info_level_idx" ON "user_info"("level");

-- CreateIndex
CREATE INDEX "user_info_depth_idx" ON "user_info"("depth");

-- CreateIndex
CREATE INDEX "user_info_path_idx" ON "user_info"("path");

-- CreateIndex
CREATE INDEX "tx_flow_user_address_idx" ON "tx_flow"("user_address");

-- CreateIndex
CREATE INDEX "tx_flow_type_idx" ON "tx_flow"("type");

-- CreateIndex
CREATE INDEX "tx_flow_status_idx" ON "tx_flow"("status");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_process_key_key" ON "schedule_process"("key");

-- CreateIndex
CREATE UNIQUE INDEX "config_key_key" ON "config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "performance_history_address_year_month_day_key" ON "performance_history"("address", "year", "month", "day");

-- AddForeignKey
ALTER TABLE "user_balance" ADD CONSTRAINT "user_balance_address_fkey" FOREIGN KEY ("address") REFERENCES "user_info"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
