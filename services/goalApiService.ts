import apiClient from './apiClient';

export type HealthGoals = {
  steps_goal: number;
  calories_burn_goal: number;
  sleep_hours_goal: number;
  water_liters_goal: number;
  target_weight?: number | null;
  target_date?: string | null;
};

export type TodayInsightsResponse = {
  date: string;
  goals: HealthGoals;
  todayData: any | null;
  progress: {
    steps_percent: number;
    calories_percent: number;
    sleep_percent: number;
    water_percent: number;
  };
  insights: string[];
};

class GoalApiService {
  async getGoals(): Promise<HealthGoals> {
    return apiClient.get<HealthGoals>('/goals');
  }

  async upsertGoals(goals: Partial<HealthGoals>): Promise<HealthGoals> {
    return apiClient.put<HealthGoals>('/goals', goals);
  }

  async getTodayInsights(): Promise<TodayInsightsResponse> {
    return apiClient.get<TodayInsightsResponse>('/goals/insights/today');
  }
}

export default new GoalApiService();
