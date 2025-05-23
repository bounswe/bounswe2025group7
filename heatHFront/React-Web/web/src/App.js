// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme'; 
import LandingPage from './pages/LandingPage';

import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';


import Profile from './pages/Profile';
import InitialProfileSetup from './pages/InitialProfileSetup';

import HomePage from './pages/HomePage';

import SignupPage from './pages/Login/SignupPage.jsx';
import SignIn from './pages/Login/SignIn.tsx';
import SavedRecipes from './pages/SavedRecipes';
import ProtectedRoute from './components/ProtectedRoute';
import EditProfile from './pages/EditProfile';
import RecipeDetail from './pages/RecipeDetail';
import MyRecipes from './pages/myRecipes';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsofService';
import ContactUs from './pages/ContactUs';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/setup" element={<InitialProfileSetup />} />
            <Route path="/profile/edit" element={<EditProfile />} />   
            <Route path="/saved" element={<SavedRecipes />} />
            <Route path="/myrecipes" element={<MyRecipes />} /> 
            <Route path="/recipe/:id" element={<RecipeDetail />} />  
            <Route path="/user/:userId" element={<UserProfile />} /> 
          </Route>  
        </Routes>
      </BrowserRouter>
    </ThemeProvider>  
  );
}

export default App;