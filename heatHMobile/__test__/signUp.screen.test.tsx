import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '@/app/auth/sign-up';
import { authService } from '@/services/authService';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/services/authService', () => ({
  authService: {
    register: jest.fn(),
  },
}));

describe('SignUpScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('validates email format and password match', async () => {
    render(<SignUpScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Enter your email'), 'bad-email');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'a');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm your password'), 'b');
    fireEvent.press(screen.getByText('Sign Up'));
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('registers successfully', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});
    render(<SignUpScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'pw');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm your password'), 'pw');
    fireEvent.press(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({ username: 'a@b.com', password: 'pw' });
    });
  });
});


