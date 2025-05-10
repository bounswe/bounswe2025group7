// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme'; 

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';

import SignupPage from './pages/Login/SignupPage.jsx';
import SignIn from './pages/Login/SignIn.tsx';
import SavedRecipes from './pages/SavedRecipes';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/saved" element={<SavedRecipes />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>  
  );
}

export default App;