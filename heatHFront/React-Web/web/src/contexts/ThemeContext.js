import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import '@fontsource/sora';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

const getTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#169873ff',
        light: '#1ab38a',
        dark: '#0f6b4f',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0077b6ff',
        light: '#0096d6',
        dark: '#005a8c',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#2a2a2a' : '#ffffff',
        paper: mode === 'dark' ? '#353535' : '#f5f7fa',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
        secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Sora", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        fontSize: '3.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 30,
            padding: '8px 24px',
            boxShadow: mode === 'dark' 
              ? '0 4px 14px rgba(0,0,0,0.3)' 
              : '0 4px 14px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: mode === 'dark'
                ? '0 6px 20px rgba(0,0,0,0.4)'
                : '0 6px 20px rgba(0,0,0,0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: mode === 'dark' ? '#353535' : '#f3f4f6',
            boxShadow: mode === 'dark'
              ? '0 8px 20px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: mode === 'dark'
                ? '0 16px 30px rgba(0,0,0,0.4)'
                : '0 4px 16px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#353535' : '#169873ff',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'dark' ? '#2a2a2a' : '#ffffff',
            color: mode === 'dark' ? '#ffffff' : '#000000',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
    },
  });
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Get saved preference from localStorage or default to 'light'
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    // Save preference to localStorage whenever it changes
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value = {
    mode,
    toggleColorMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

