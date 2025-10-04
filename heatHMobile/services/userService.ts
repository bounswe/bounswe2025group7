import { apiClient } from './apiClient';
import { User } from '@/models/User';

// Note: There is no dedicated user controller in the backend
// User data is managed through the InterestForm endpoints
// This service provides utility functions for user-related operations

export const userService = {
  // Get current user data from interest form (closest to /me endpoint)
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Since there's no /me endpoint, we get user data from interest form
      const { interestFormService } = await import('./interestFormService');
      const form = await interestFormService.getInterestForm();
      
      if (form && form.user) {
        return {
          id: form.user.id?.toString() || '',
          username: form.user.username || '',
          name: form.user.name,
          surname: form.user.surname,
          profilePhoto: form.user.profilePhoto,
          role: form.user.role,
          createdAt: form.user.createdAt,
          updatedAt: form.user.updatedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get user by username (not available in backend, returns null)
  byUsername: async (username: string): Promise<User | null> => {
    console.warn('byUsername not available in backend API');
    return null;
  },

  // Update user profile through interest form
  updateProfile: async (data: Partial<User>): Promise<User | null> => {
    try {
      const { interestFormService } = await import('./interestFormService');
      const form = await interestFormService.getInterestForm();
      
      if (form) {
        // Update the form with new data
        const updatedForm = await interestFormService.updateInterestForm({
          name: data.name || form.name,
          surname: data.surname || form.surname,
          profilePhoto: data.profilePhoto || form.profilePhoto,
        });
        
        if (updatedForm && updatedForm.user) {
          return {
            id: updatedForm.user.id?.toString() || '',
            username: updatedForm.user.username || '',
            name: updatedForm.user.name,
            surname: updatedForm.user.surname,
            profilePhoto: updatedForm.user.profilePhoto,
            role: updatedForm.user.role,
            createdAt: updatedForm.user.createdAt,
            updatedAt: updatedForm.user.updatedAt,
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },
};


