// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme'; 

import LandingPage from './pages/LandingPage';
import SignupPage from './pages/Login/SignupPage.jsx';
import SignIn from './pages/Login/SignIn.tsx';
import Profile from './pages/Profile';
import InitialProfileSetup from './pages/InitialProfileSetup';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/setup" element={<InitialProfileSetup />} />
          <Route path="/feed" element={<Navigate to="/profile" />} />
          <Route path="/saved-recipes" element={<Navigate to="/profile" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>  
  );
}

export default App;