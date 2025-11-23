import { apiClient } from './apiClient';

export const calorieService = {
  toggleCalorieTracking: (eatenDate: string, recipeId: number, portion: number) => {
    return apiClient.post('/calorie/toggle-calorie-tracking', null, {
      params: {
        eatenDate,
        recipeId,
        portion
      }
    }).then((response: any) => response.data);
  },

  updateCalorieTracking: (eatenDate: string, recipeId: number, portion: number) => {
    return apiClient.put('/calorie/update-calorie-tracking', null, {
      params: {
        eatenDate,
        recipeId,
        portion
      }
    }).then((response: any) => response.data);
  },

  getUserTracking: (checkDate: string) => {
    return apiClient.get('/calorie/get-user-tracking', {
      params: {
        checkDate
      }
    }).then((response: any) => response.data);
  }
};

