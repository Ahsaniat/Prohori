import { useGoalStore } from '../store/goalStore';

// Mock the API service
jest.mock('../services/goalApiService', () => ({
  __esModule: true,
  default: {
    getGoals: jest.fn(),
    upsertGoals: jest.fn(),
    getTodayInsights: jest.fn(),
  },
}));

// Need to require after mock
const goalApiService = require('../services/goalApiService').default;

describe('goalStore', () => {
  beforeEach(() => {
    // Reset store state
    useGoalStore.getState().reset();
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const state = useGoalStore.getState();
    expect(state.goals).toBeNull();
    expect(state.insights).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchGoals', () => {
    it('fetches goals successfully', async () => {
      const mockGoals = {
        steps_goal: 10000,
        calories_burn_goal: 2000,
        sleep_hours_goal: 8,
        water_liters_goal: 2,
        target_weight: null,
        target_date: null,
      };
      goalApiService.getGoals.mockResolvedValue(mockGoals);

      await useGoalStore.getState().fetchGoals();

      expect(goalApiService.getGoals).toHaveBeenCalled();
      expect(useGoalStore.getState().goals).toEqual(mockGoals);
      expect(useGoalStore.getState().isLoading).toBe(false);
      expect(useGoalStore.getState().error).toBeNull();
    });

    it('handles fetch error', async () => {
      goalApiService.getGoals.mockRejectedValue(new Error('Network error'));

      await useGoalStore.getState().fetchGoals();

      expect(useGoalStore.getState().error).toBe('Network error');
      expect(useGoalStore.getState().isLoading).toBe(false);
    });
  });

  describe('saveGoals', () => {
    it('saves goals successfully', async () => {
      const mockGoals = {
        steps_goal: 12000,
        calories_burn_goal: 2500,
        sleep_hours_goal: 9,
        water_liters_goal: 3,
        target_weight: 70,
        target_date: '2026-06-01T00:00:00.000Z',
      };
      goalApiService.upsertGoals.mockResolvedValue(mockGoals);

      await useGoalStore.getState().saveGoals({ steps_goal: 12000 });

      expect(goalApiService.upsertGoals).toHaveBeenCalledWith({ steps_goal: 12000 });
      expect(useGoalStore.getState().goals).toEqual(mockGoals);
      expect(useGoalStore.getState().isLoading).toBe(false);
    });

    it('handles save error', async () => {
      goalApiService.upsertGoals.mockRejectedValue(new Error('Save failed'));

      await useGoalStore.getState().saveGoals({ steps_goal: 12000 });

      expect(useGoalStore.getState().error).toBe('Save failed');
      expect(useGoalStore.getState().isLoading).toBe(false);
    });
  });

  describe('fetchTodayInsights', () => {
    it('fetches insights successfully', async () => {
      const mockInsights = {
        date: '2026-01-03T00:00:00.000Z',
        goals: {
          steps_goal: 10000,
          calories_burn_goal: 2000,
          sleep_hours_goal: 8,
          water_liters_goal: 2,
        },
        todayData: null,
        progress: {
          steps_percent: 0,
          calories_percent: 0,
          sleep_percent: 0,
          water_percent: 0,
        },
        insights: [],
      };
      goalApiService.getTodayInsights.mockResolvedValue(mockInsights);

      await useGoalStore.getState().fetchTodayInsights();

      expect(goalApiService.getTodayInsights).toHaveBeenCalled();
      expect(useGoalStore.getState().insights).toEqual(mockInsights);
      expect(useGoalStore.getState().isLoading).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets state to initial values', async () => {
      // Set some state first
      const mockGoals = { steps_goal: 10000, calories_burn_goal: 2000, sleep_hours_goal: 8, water_liters_goal: 2 };
      goalApiService.getGoals.mockResolvedValue(mockGoals);
      await useGoalStore.getState().fetchGoals();
      
      // Reset
      useGoalStore.getState().reset();

      const state = useGoalStore.getState();
      expect(state.goals).toBeNull();
      expect(state.insights).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
