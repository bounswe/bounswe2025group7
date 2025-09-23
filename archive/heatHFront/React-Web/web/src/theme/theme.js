import { createTheme } from '@mui/material/styles';
import '@fontsource/sora';

const theme = createTheme({
  palette: {
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
      default: '#ffffff',
      paper: '#f5f7fa',
    },
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
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
});

export default theme;