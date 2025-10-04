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

// CommentRequest interface matching backend
interface CommentRequest {
  feedId: number;
  text: string;
}

// CommentDeleteRequest interface matching backend
interface CommentDeleteRequest {
  commentId: number;
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
  getFeedByUser: async (): Promise<FeedResponse[]> => {
    const response = await apiClient.get<FeedResponse[]>('/api/feeds/feed-by-user');
    return response;
  },

  // Get recent feeds for user (with pagination)
  getRecentFeeds: async (pageNumber: number = 0): Promise<FeedResponse[]> => {
    const response = await apiClient.get<FeedResponse[]>(`/api/feeds/recent?pageNumber=${pageNumber}`);
    return response;
  },

  // Get other user's profile and feeds
  getOtherUserProfile: async (userId: number): Promise<FeedProfileResponse> => {
    const response = await apiClient.get<FeedProfileResponse>(`/api/feeds/other-user?userId=${userId}`);
    return response;
  },

  // Create a new feed
  createFeed: async (postPayload: any): Promise<any> => {
    const response = await apiClient.post<any>('/api/feeds/created-feed', postPayload);
    return response;
  },

  // Like a feed
  likeFeed: async (feedId: number): Promise<void> => {
    const request: LikeRequest = { feedId };
    await apiClient.post('/api/feeds/like', request);
  },

  // Unlike a feed
  unlikeFeed: async (feedId: number): Promise<void> => {
    const request: LikeRequest = { feedId };
    await apiClient.post('/api/feeds/unlike', request);
  },

  // Comment on a feed
  commentFeed: async (feedId: number, text: string): Promise<void> => {
    const request: CommentRequest = { feedId, text };
    await apiClient.post('/api/feeds/comment', request);
  },

  // Delete a comment
  deleteComment: async (commentId: number): Promise<void> => {
    const request: CommentDeleteRequest = { commentId };
    await apiClient.post('/api/feeds/delete-comment', request);
  },

  // Get comments for a feed
  getFeedComments: async (feedId: number): Promise<CommentResponse[]> => {
    const response = await apiClient.get<CommentResponse[]>(`/api/feeds/get-feed-comments?feedId=${feedId}`);
    return response;
  },

  // Save a recipe
  saveRecipe: async (recipeId: number): Promise<void> => {
    const request: SavedRecipeRequest = { recipeId };
    await apiClient.post('/api/saved-recipes/save', request);
  },

  // Unsave a recipe
  unsaveRecipe: async (recipeId: number): Promise<void> => {
    const request: SavedRecipeRequest = { recipeId };
    await apiClient.post('/api/saved-recipes/unsave', request);
  },

  // Get saved recipes
  getSavedRecipes: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/api/saved-recipes/get');
    return response;
  },
};