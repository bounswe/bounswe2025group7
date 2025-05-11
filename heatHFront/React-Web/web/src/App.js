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

import RecipeDetail from './pages/RecipeDetail';
import MyRecipes from './pages/myRecipes';


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

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/setup" element={<InitialProfileSetup />} />
            <Route path="/saved" element={<SavedRecipes />} />
            <Route path="/myrecipes" element={<MyRecipes />} /> 
            <Route path="/recipe/:id" element={<RecipeDetail />} />   
          </Route>  
        </Routes>
      </BrowserRouter>
    </ThemeProvider>  
  );
}

export default App;