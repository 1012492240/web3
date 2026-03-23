import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password, type } = await req.json();

    // 这里简化了验证逻辑，实际生产环境应使用更安全的方式
    // 检查用户名和密码是否匹配预设的管理员账号
    if (username === 'admin' && password === 'ant.design') {
      // 登录成功，返回用户信息和 token
      return NextResponse.json({
        status: 'ok',
        type,
        currentAuthority: 'admin',
        token: process.env.AUTH_BEARER || 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc0NDM0MDk1MiwiaWF0IjoxNzQ0MzQwOTUyfQ.DweWEvvYoT9OZ4HY5lhMEKZURExDhCrimHJocUhr77U'
      });
    }

    // 登录失败
    return NextResponse.json(
      {
        status: 'error',
        type,
        currentAuthority: 'guest',
        message: '用户名或密码错误'
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { 
        status: 'error',
        type: 'account',
        currentAuthority: 'guest',
        message: error instanceof Error ? error.message : '登录过程中发生未知错误' 
      },
      { status: 500 }
    );
  }
}
