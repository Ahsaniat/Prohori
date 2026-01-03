import { create } from 'zustand';
import goalApiService, { HealthGoals, TodayInsightsResponse } from '../services/goalApiService';

type GoalState = {
  goals: HealthGoals | null;
  insights: TodayInsightsResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  saveGoals: (payload: Partial<HealthGoals>) => Promise<void>;
  fetchTodayInsights: () => Promise<void>;
  reset: () => void;
};

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: null,
  insights: null,
  isLoading: false,
  error: null,

  reset: () => set({ goals: null, insights: null, isLoading: false, error: null }),

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await goalApiService.getGoals();
      set({ goals, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load goals', isLoading: false });
    }
  },

  saveGoals: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const goals = await goalApiService.upsertGoals(payload);
      set({ goals, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to save goals', isLoading: false });
    }
  },

  fetchTodayInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const insights = await goalApiService.getTodayInsights();
      set({ insights, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load insights', isLoading: false });
    }
  },
}));
