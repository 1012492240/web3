import { NextResponse } from 'next/server'
import { getEnvironment, getHotWalletAddress, getVersion, getMinWithdrawTokenAmount, getWithdrawInnerFee, getMinWithdrawUsdtAmount, getWithdrawTokenFeeRatio, getMiningTokenMinimalThreshold, getBurningAddress } from '@/lib/config'

export async function POST() {
  return NextResponse.json({
    version: await getVersion(),
    environment: getEnvironment(),
    hotWalletAddress: await getHotWalletAddress(),
    burningAddress: await getBurningAddress(),
    minCashOutAmountToken: await getMinWithdrawTokenAmount(),
    minCashOutAmountUsdt: await getMinWithdrawUsdtAmount(),
    constantFee: await getWithdrawInnerFee(),
    withdrawTokenFeeRatio: await getWithdrawTokenFeeRatio(),
    miningTokenMinimalThreshold: await getMiningTokenMinimalThreshold()
  })
}