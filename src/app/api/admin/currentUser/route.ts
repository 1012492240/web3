import { NextRequest, NextResponse } from 'next/server';
import { validateBearerToken } from '@/utils/auth';

// 参考 dashboard 的 mock 数据
const adminUser = {
  name: 'Admin',
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  userid: '00000001',
  email: 'platform@gmail.com',
  signature: '',
  title: '最高级管理员',
  group: '',
  tags: [
    {
      key: '0',
      label: '很有想法的',
    },
    {
      key: '1',
      label: '专注设计',
    },
  ],
  notifyCount: 12,
  unreadCount: 11,
  country: 'China',
  access: 'admin',
  geographic: {
    province: {
      label: '浙江省',
      key: '330000',
    },
    city: {
      label: '杭州市',
      key: '330100',
    },
  },
  address: '',
  phone: '0752-268888888',
};

export async function GET(req: NextRequest) {
  // 验证 Bearer Token
  const validationResponse = validateBearerToken(req);
  if (validationResponse) {
    return NextResponse.json({
      data: {
        isLogin: false,
      },
      errorCode: '401',
      errorMessage: '请先登录！',
      success: true,
    }, { status: 401 });
  }

  // 返回模拟的用户数据
  return NextResponse.json({
    success: true,
    data: adminUser,
  });
}
