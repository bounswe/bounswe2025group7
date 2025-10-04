import { apiClient } from './apiClient';
import { InterestForm, ProfileData } from '@/models/User';

// InterestFormRequest interface matching backend
interface InterestFormRequest {
  name?: string;
  surname?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  profilePhoto?: string;
  gender?: string;
}

export const interestFormService = {
  // Returns true if the user has not yet submitted the interest form
  checkFirstLogin: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>('/api/interest-form/check-first-login');
      return response;
    } catch (err: any) {
      // If endpoint not found or form doesn't exist/forbidden, treat as first login
      if (err.message?.includes('404') || err.message?.includes('403')) {
        return false;
      }
      throw err;
    }
  },

  // Create a new interest form entry
  createInterestForm: async (data: InterestFormRequest): Promise<InterestForm> => {
    const response = await apiClient.post<InterestForm>('/api/interest-form/submit', data);
    return response;
  },

  // Fetch the existing interest form data
  getInterestForm: async (): Promise<InterestForm> => {
    const response = await apiClient.get<InterestForm>('/api/interest-form/get-form');
    return response;
  },

  // Update existing interest form data
  updateInterestForm: async (data: InterestFormRequest): Promise<InterestForm> => {
    const response = await apiClient.put<InterestForm>('/api/interest-form/update-form', data);
    return response;
  },

  // Convert InterestForm to ProfileData format
  toProfileData: (form: InterestForm): ProfileData => ({
    firstName: form.name || '',
    lastName: form.surname || '',
    weight: form.weight,
    height: form.height,
    dateOfBirth: form.dateOfBirth,
    gender: form.gender,
    profilePhoto: form.profilePhoto,
  }),

  // Convert ProfileData to InterestFormRequest format
  fromProfileData: (profile: ProfileData): InterestFormRequest => ({
    name: profile.firstName,
    surname: profile.lastName,
    weight: profile.weight,
    height: profile.height,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    profilePhoto: profile.profilePhoto,
  }),
};