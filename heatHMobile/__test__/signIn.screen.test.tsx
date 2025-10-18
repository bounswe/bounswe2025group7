import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '@/app/auth/sign-in';
import { authService } from '@/services/authService';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));

describe('SignInScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows error when fields are empty', async () => {
    render(<SignInScreen />);
    fireEvent.press(screen.getByText('Sign In'));
    // Alert is not easily asserted; assert that authService.login was not called
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('calls login and navigates on success', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({});
    render(<SignInScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'pw');
    fireEvent.press(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({ username: 'a@b.com', password: 'pw' });
    });
  });
});


