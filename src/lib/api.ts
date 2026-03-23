import { UserProfile, UserActivity } from '@/types/user';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟获取用户数据
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  await delay(1000); // 模拟网络延迟

  // 这里可以替换为真实的API调用
  return {
    id: userId,
    address: userId,
    avatar: `https://api.dicebear.com/9.x/glass/svg?seed=${userId}`,
    stats: {
      activitiesCount: Math.floor(Math.random() * 100),
      badgesCount: Math.floor(Math.random() * 50),
      contributionScore: Math.floor(Math.random() * 1000),
    },
    activities: generateMockActivities(),
  };
}

// 生成模拟活动数据
function generateMockActivities(): UserActivity[] {
  const activities: UserActivity[] = [];
  const types: UserActivity['type'][] = ['quest', 'campaign', 'reward'];
  const status: UserActivity['status'][] = ['completed', 'ongoing', 'failed'];

  for (let i = 0; i < 10; i++) {
    activities.push({
      id: `activity-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      title: `Activity ${i + 1}`,
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      status: status[Math.floor(Math.random() * status.length)],
    });
  }

  return activities;
}
