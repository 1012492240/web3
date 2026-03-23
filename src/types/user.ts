export interface UserActivity {
  id: string;
  type: 'quest' | 'campaign' | 'reward';
  title: string;
  timestamp: string;
  status: 'completed' | 'ongoing' | 'failed';
}

export interface UserStats {
  activitiesCount: number;
  badgesCount: number;
  contributionScore: number;
}

export interface UserProfile {
  id: string;
  address: string;
  avatar: string;
  stats: UserStats;
  activities: UserActivity[];
  isLoading?: boolean;
}
