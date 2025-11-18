import apiClient from './apiClient';

const calorieService = {

  toggleCalorieTracking: async (eatenDate, recipeId, portion) => {
    const response = await apiClient.post('/calorie/toggle-calorie-tracking', null, {
      params: {
        eatenDate,
        recipeId,
        portion
      }
    });
    return response.data;
  },

  getUserTracking: async (checkDate) => {
    const response = await apiClient.get('/calorie/get-user-tracking', {
      params: {
        checkDate
      }
    });
    return response.data;
  }

}

export default calorieService;