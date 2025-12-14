import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const DarkModeToggle = () => {
  const { mode, toggleColorMode } = useThemeMode();
  const { t } = useTranslation();

  return (
    <Tooltip title={mode === 'dark' ? t('common.lightMode') : t('common.darkMode')}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label={mode === 'dark' ? t('common.lightMode') : t('common.darkMode')}
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default DarkModeToggle;

