import { create } from 'zustand';
import goalApiService, { HealthGoals, TodayInsightsResponse } from '../services/goalApiService';

type GoalState = {
  goals: HealthGoals | null;
  insights: TodayInsightsResponse | null;
  isLoading: boolean;

  fetchGoals: () => Promise<void>;
  saveGoals: (payload: Partial<HealthGoals>) => Promise<void>;
  fetchTodayInsights: () => Promise<void>;
  reset: () => void;
};

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: null,
  insights: null,
  isLoading: false,

  reset: () => set({ goals: null, insights: null, isLoading: false }),

  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      const goals = await goalApiService.getGoals();
      set({ goals, isLoading: false });
    } catch (e: any) {
      console.error('[GoalStore] fetchGoals error:', e?.message || e);
      set({ isLoading: false });
    }
  },

  saveGoals: async (payload) => {
    set({ isLoading: true });
    try {
      const goals = await goalApiService.upsertGoals(payload);
      set({ goals, isLoading: false });
    } catch (e: any) {
      console.error('[GoalStore] saveGoals error:', e?.message || e);
      set({ isLoading: false });
    }
  },

  fetchTodayInsights: async () => {
    set({ isLoading: true });
    try {
      const insights = await goalApiService.getTodayInsights();
      set({ insights, isLoading: false });
    } catch (e: any) {
      console.error('[GoalStore] fetchTodayInsights error:', e?.message || e);
      set({ isLoading: false });
    }
  },
}));
