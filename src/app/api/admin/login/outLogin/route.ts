import { NextRequest, NextResponse } from 'next/server';
import { validateBearerToken } from '@/utils/auth';

export async function POST(req: NextRequest) {
  // 验证 Bearer Token
  const validationResponse = validateBearerToken(req);
  if (validationResponse) {
    return validationResponse;
  }

  try {
    // 退出登录逻辑，在实际应用中可能需要清除会话或令牌
    // 这里简单返回成功响应
    return NextResponse.json({
      data: {},
      success: true
    });
  } catch (error) {
    console.error('退出登录错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '退出登录时发生未知错误' },
      { status: 500 }
    );
  }
}
