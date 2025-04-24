// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme'; 
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>  
  );
}

export default App;