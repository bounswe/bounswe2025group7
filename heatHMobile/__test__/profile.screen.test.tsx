import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ProfileScreen from '@/app/(tabs)/profile';
import { authService } from '@/services/authService';
import { interestFormService } from '@/services/interestFormService';
import { feedService } from '@/services/feedService';

const mockedRouter = { replace: jest.fn() };
jest.mock('expo-router', () => ({
  useRouter: () => mockedRouter,
}));

// Mock DateTimePicker module (ESM)
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  MediaTypeOptions: { Images: 'Images' },
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('@/services/authService', () => ({
  authService: {
    getAccessToken: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/services/interestFormService', () => ({
  interestFormService: {
    getInterestForm: jest.fn(),
  },
}));

jest.mock('@/services/feedService', () => ({
  feedService: {
    getFeedByUser: jest.fn(),
  },
}));

describe('ProfileScreen redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to sign-in if no token', async () => {
    (authService.getAccessToken as jest.Mock).mockResolvedValueOnce(null);
    render(<ProfileScreen />);
    await waitFor(() => {
      expect(mockedRouter.replace).toHaveBeenCalledWith('/auth/sign-in');
    });
  });

  it('loads profile and feeds when token exists', async () => {
    (authService.getAccessToken as jest.Mock).mockResolvedValueOnce('TOKEN');
    (interestFormService.getInterestForm as jest.Mock).mockResolvedValueOnce({ name: 'A', surname: 'B', dateOfBirth: '', height: 0, weight: 0, gender: '' });
    (feedService.getFeedByUser as jest.Mock).mockResolvedValueOnce([]);
    render(<ProfileScreen />);
    await waitFor(() => {
      expect(mockedRouter.replace).not.toHaveBeenCalled();
    });
  });
});


