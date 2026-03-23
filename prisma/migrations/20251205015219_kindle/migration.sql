-- CreateEnum
CREATE TYPE "TimeInterval" AS ENUM ('FIVE_MIN', 'FIFTEEN_MIN', 'THIRTY_MIN', 'ONE_HOUR', 'ONE_DAY', 'ONE_WEEK');

-- CreateTable
CREATE TABLE "token_price_candle" (
    "id" SERIAL NOT NULL,
    "interval" "TimeInterval" NOT NULL,
    "open_price" DECIMAL(65,30) NOT NULL,
    "close_price" DECIMAL(65,30) NOT NULL,
    "high_price" DECIMAL(65,30) NOT NULL,
    "low_price" DECIMAL(65,30) NOT NULL,
    "volume" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_price_candle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "token_price_candle_interval_timestamp_idx" ON "token_price_candle"("interval", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "token_price_candle_interval_timestamp_key" ON "token_price_candle"("interval", "timestamp");
