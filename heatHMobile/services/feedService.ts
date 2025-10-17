import { apiClient } from './apiClient';

// FeedResponse interface matching backend
export interface FeedResponse {
  id: number;
  userId: number;
  type: 'RECIPE' | 'POST';
  text?: string;
  image?: string;
  recipe?: any;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  name?: string;
  surname?: string;
  profilePhoto?: string;
}

// FeedProfileResponse interface matching backend
export interface FeedProfileResponse {
  name: string;
  surname: string;
  profilePhoto?: string;
  feeds: any[];
}

// LikeRequest interface matching backend
interface LikeRequest {
  feedId: number;
}

// SavedRecipeRequest interface matching backend
interface SavedRecipeRequest {
  recipeId: number;
}

export const feedService = {
  // Get feeds by current user
  getFeedByUser: async (): Promise<FeedResponse[]> => {
    return await apiClient.get<FeedResponse[]>('/feeds/feed-by-user');
  },

  // Get recent feeds for user (with pagination)
  getRecentFeeds: async (pageNumber: number = 0): Promise<FeedResponse[]> => {
    return await apiClient.get<FeedResponse[]>(`/feeds/recent?pageNumber=${pageNumber}`);
  },

  // Get other user's profile and feeds
  getOtherUserProfile: async (userId: number): Promise<FeedProfileResponse> => {
    return await apiClient.get<FeedProfileResponse>(`/feeds/other-user?userId=${userId}`);
  },

  // Create a new feed
  createFeed: async (postPayload: any): Promise<any> => {
    return await apiClient.post<any>('/feeds/created-feed', postPayload);
  },

  // Like a feed
  likeFeed: async (feedId: number): Promise<void> => {
    const request: LikeRequest = { feedId };
    await apiClient.post('/feeds/like', request);
  },

  // Unlike a feed
  unlikeFeed: async (feedId: number): Promise<void> => {
    const request: LikeRequest = { feedId };
    await apiClient.post('/feeds/unlike', request);
  },

  // Save a recipe
  saveRecipe: async (recipeId: number): Promise<void> => {
    const request: SavedRecipeRequest = { recipeId };
    await apiClient.post('/saved-recipes/save', request);
  },

  // Unsave a recipe
  unsaveRecipe: async (recipeId: number): Promise<void> => {
    const request: SavedRecipeRequest = { recipeId };
    await apiClient.post('/saved-recipes/unsave', request);
  },

  // Get saved recipes
  getSavedRecipes: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/saved-recipes/get');
    return response;
  },
};