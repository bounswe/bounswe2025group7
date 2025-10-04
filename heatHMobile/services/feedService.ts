import { httpClient } from './httpClient';
import { authService } from './authService';

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

// CommentResponse interface matching backend
export interface CommentResponse {
  id: number;
  feedId: number;
  userId: number;
  text: string;
  createdAt: string;
  name?: string;
  surname?: string;
  profilePhoto?: string;
}

export const feedService = {
  // Get feeds by current user
  getFeedByUser: async (): Promise<any> => {
    try {
      const token = await authService.getAccessToken();
      const response = await httpClient.get('/feeds/feed-by-user', undefined, token);
      return response.data;
    } catch (error) {
      console.error('Failed to get feed by user:', error);
      throw error;
    }
  },

  // Create a new feed
  createFeed: async (postPayload: any): Promise<any> => {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        console.error('No access token found.');
        throw new Error('Unauthorized');
      }
      const response = await httpClient.post('/feeds/created-feed', postPayload, token);
      return response.data;
    } catch (error) {
      console.error('Failed to create feed:', error);
      throw error;
    }
  }
};