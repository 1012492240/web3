import { NextRequest, NextResponse } from 'next/server';
import { 
  getConfig, 
  getHotWalletAddress, 
  getLevelRewardRatio, 
  getStakeRewardRate,
  getAssembleTargetAddress,
  getWithdrawInnerFee,
  getMaxLevel,
  getLevel1Threshold,
  getEnvironment,
  getGroupNum,
  getCommunityNum,
  getMiningCapExpansion,
  getLevelByPerformance,
} from '@/lib/config';
import { validateBearerToken } from '@/utils/auth';

type ConfigFunctionName = keyof typeof configFunctions;

const configFunctions = {
  getConfig,
  getHotWalletAddress,
  getLevelRewardRatio,
  getStakeRewardRate,
  getAssembleTargetAddress,
  getWithdrawInnerFee,
  getMaxLevel,
  getLevel1Threshold,
  getEnvironment,
  getGroupNum,
  getCommunityNum,
  getMiningCapExpansion,
  getLevelByPerformance,
} as const;

export async function POST(req: NextRequest) {
  try {

    const validationResponse = validateBearerToken(req);
    if (validationResponse) {
      return validationResponse;
    }
    
    const { functionName, args } = await req.json();
    
    if (!functionName || !(functionName in configFunctions)) {
      return NextResponse.json(
        { error: 'Invalid function name' },
        { status: 400 }
      );
    }

    const func = configFunctions[functionName as ConfigFunctionName];
    
    // Execute the function with provided arguments
    // @ts-expect-error A spread argument must either have a tuple type or be passed to a rest parameter.
    const result = await func(...args);
    
    return NextResponse.json({
      status: 'success',
      result
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}