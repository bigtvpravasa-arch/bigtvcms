'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { GlobalErrorSnackbar } from '../components/GlobalErrorSnackbar';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'dark' ? '#facc15' : '#d97706', // Warm Gold on dark, Warm Amber on light (Login Flow)
        },
        background: {
          default: mode === 'dark' ? '#161202' : '#fcfbf7', // Warm Charcoal base on dark, Warm Cream on light
          paper: mode === 'dark' ? '#231b05' : '#ffffff', // Warm dark amber on dark, pure white on light
        },
        text: {
          primary: mode === 'dark' ? '#ffffff' : '#1a1300',
          secondary: mode === 'dark' ? '#fde68a' : '#78350f',
        },
      },
      typography: {
        fontFamily: 'Poppins, sans-serif',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: 600,
            },
            containedPrimary: {
              background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
              color: '#1a1300',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(234, 179, 8, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)',
                boxShadow: '0 6px 20px rgba(234, 179, 8, 0.5)',
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: '8px',
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#facc15',
                boxShadow: '0 0 10px rgba(250, 204, 21, 0.25)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              borderColor: mode === 'dark' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(217, 119, 6, 0.15)',
            },
          },
        },
        MuiPopover: {
          styleOverrides: {
            paper: {
              backgroundColor: mode === 'dark' ? '#231b05' : '#ffffff',
              backgroundImage: 'none',
              border:
                mode === 'dark'
                  ? '1px solid rgba(250, 204, 21, 0.25)'
                  : '1px solid rgba(217, 119, 6, 0.15)',
            },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              backgroundColor: mode === 'dark' ? '#231b05' : '#ffffff',
              backgroundImage: 'none',
              border:
                mode === 'dark'
                  ? '1px solid rgba(250, 204, 21, 0.25)'
                  : '1px solid rgba(217, 119, 6, 0.15)',
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(234, 179, 8, 0.15)' : '#fef9c3',
              },
              '&.Mui-selected': {
                backgroundColor: mode === 'dark' ? 'rgba(234, 179, 8, 0.25)' : '#fde047',
                color: mode === 'dark' ? '#facc15' : '#1a1300',
                fontWeight: 700,
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(234, 179, 8, 0.35)' : '#fde047',
                },
              },
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: mode === 'dark' ? '#231b05' : '#1a1300',
              color: mode === 'dark' ? '#fde68a' : '#ffffff',
              fontSize: '0.8rem',
              borderRadius: '8px',
              border:
                mode === 'dark'
                  ? '1px solid rgba(250, 204, 21, 0.25)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              padding: '8px 12px',
            },
            arrow: {
              color: mode === 'dark' ? '#231b05' : '#1a1300',
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <GlobalErrorSnackbar />
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
