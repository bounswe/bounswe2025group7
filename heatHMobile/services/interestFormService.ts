import { apiClient } from './apiClient';

export interface InterestFormData {
  name: string;
  surname: string;
  dateOfBirth: string;
  height: number;
  weight: number;
  gender: string;
  profilePhoto?: string | null;
}

const interestFormService = {
  // Returns true if the user has not yet submitted the interest form
  checkFirstLogin: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>('/interest-form/check-first-login');
      return Boolean(response);
    } catch (err: any) {
      // Treat 404/403 as first login
      if (err?.response?.status === 404 || err?.response?.status === 403) {
        return false;
      }
      throw err;
    }
  },

  // Create a new interest form entry
  createInterestForm: async (data: InterestFormData) => {
    console.log('InterestFormService: Creating interest form with data:', data);
    try {
      const response = await apiClient.post<string>('/interest-form/submit', data);
      return response;
    } catch (error) {
      // If submit fails, try update instead
      const updateResponse = await apiClient.put<string>('/interest-form/update-form', data);
      return updateResponse;
    }
  },

  // Fetch the existing interest form data
  getInterestForm: async () => {
    console.log('InterestFormService: Getting interest form...');
    const response = await apiClient.get<InterestFormData>('/interest-form/get-form');
    return response;
  },

  // Update existing interest form data
  updateInterestForm: async (data: InterestFormData) => {
    console.log('InterestFormService: Updating interest form with data:', data);
    const response = await apiClient.put<string>('/interest-form/update-form', data);
    return response;
  },

  // Test authentication by making a simple request
  testAuthentication: async () => {
    console.log('InterestFormService: Testing authentication');
    try {
      await apiClient.get('/interest-form/check-first-login');
      return true;
    } catch (error) {
      throw error as any;
    }
  },

  // Convert InterestFormData to ProfileData
  toProfileData: (data: any) => {
    return {
      firstName: data.name || '',
      lastName: data.surname || '',
      weight: data.weight || 0,
      height: data.height || 0,
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || '',
      profilePhoto: data.profilePhoto || null,
    };
  },

  // Convert ProfileData to InterestFormData
  fromProfileData: (data: any) => {
    const photo: string | null = typeof data.profilePhoto === 'string' && data.profilePhoto.startsWith('data:image/')
      ? data.profilePhoto
      : null;
    return {
      name: data.firstName || '',
      surname: data.lastName || '',
      weight: data.weight || 0,
      height: data.height || 0,
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || '',
      profilePhoto: photo,
    };
  },
};

export default interestFormService;
