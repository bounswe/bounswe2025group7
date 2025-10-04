# Mobile Authentication Implementation

## Overview
This document outlines the complete authentication system implementation for the mobile app, matching the web application's authentication features.

## Features Implemented

### 1. Authentication Service (`services/authService.ts`)
- **Complete authService** with all web features:
  - `register()` - User registration with email verification
  - `login()` - User login with credentials
  - `refreshToken()` - Automatic token refresh
  - `logout()` - User logout and token cleanup
  - `sendVerificationCode()` - Email verification for registration
  - `verifyCode()` - Code verification
  - `forgotPassword()` - Password reset initiation
  - `resetPassword()` - Password reset completion
  - `exists()` - Check if email is already registered

### 2. HTTP Client (`services/httpClient.ts`)
- **Enhanced HTTP client** with authentication:
  - Token-based authentication support
  - Proper error handling and retry logic
  - Support for GET, POST, PUT, DELETE methods
  - No circular dependencies

### 3. Authentication Context (`context/AuthContext.tsx`)
- **Comprehensive auth state management**:
  - Token persistence using AsyncStorage
  - Authentication status tracking
  - Loading states
  - Login, register, logout functions
  - Automatic token refresh

### 4. Authentication Screens
- **Sign In Screen** (`app/auth/sign-in.tsx`):
  - Email/password login
  - Error handling
  - Success message display
  - Navigation to forgot password
  - First-login check and profile setup flow

- **Sign Up Screen** (`app/auth/sign-up.tsx`):
  - Email/password registration
  - Direct registration without email verification
  - Form validation

- **Forgot Password Screen** (`app/auth/forgot-password.tsx`):
  - Email input for password reset
  - Success/error messaging

- **Reset Password Screen** (`app/auth/reset-password.tsx`):
  - New password input with confirmation
  - Password validation
  - Success handling with navigation

### 5. Interest Form (`app/forms/interest.tsx`)
- **First-time user setup**:
  - Dietary preferences selection
  - Allergies selection
  - Cooking skill level
  - Favorite cuisines
  - Cooking time preferences
  - Health goals
  - Multi-select and single-select options

### 6. Protected Routes (`components/ProtectedRoute.tsx`)
- **Route protection**:
  - Authentication check
  - First-login check
  - Automatic navigation to appropriate screens
  - Loading states

### 7. Profile Management (`app/(tabs)/profile.tsx`)
- **User profile**:
  - Logout functionality
  - Authentication status display
  - Navigation to sign-in if not authenticated

## Dependencies Added
- `@react-native-async-storage/async-storage` - For token persistence

## Key Features Matching Web App

### 1. Token Management
- Access token and refresh token storage
- Automatic token refresh on API calls
- Secure token cleanup on logout

### 2. Email Verification
- 6-digit verification code system
- Code resend functionality with countdown
- Code validation before registration

### 3. Password Reset
- Forgot password flow
- Email-based reset instructions
- New password setting with confirmation

### 4. Profile Setup System
- **Required Fields**: First Name, Last Name, Height, Weight, Date of Birth, Gender
- **Validation**: Real-time validation with Turkish character support
- **Data Persistence**: Saves to backend using `interestFormService`
- **User Experience**: Clear error messages and loading states
- **Flow**: New users are redirected to profile setup after registration

### 5. Error Handling
- Comprehensive error messages
- Network error handling
- Validation error display

## Usage

### 1. Install Dependencies
```bash
cd heatHMobile
npm install
```

### 2. Update Backend URL
Update the `BASE_URL` in `services/httpClient.ts` to match your backend server.

### 3. Authentication Flow
1. User opens app
2. If not authenticated, redirected to sign-in
3. After successful login, checked for first-login
4. If first login, redirected to interest form
5. After interest form, redirected to main app
6. All subsequent app usage requires authentication

### 4. Protected Routes
All main app screens are now protected and require authentication.

## Integration with Web App
The mobile authentication system is fully compatible with the web application:
- Same API endpoints
- Same token format
- Same authentication flow
- Same user experience

Users can register on web and login on mobile (and vice versa) seamlessly.
