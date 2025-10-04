import React from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  useTheme,
  IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Language as LanguageIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1),
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const NavIconButton = styled(IconButton)({
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const LanguageSwitcher = ({ variant = 'text', size = 'medium' }) => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
    handleClose();
  };

  const getCurrentLanguageName = () => {
    return i18n.language === 'tr' ? t('common.turkish') : t('common.english');
  };

  const getCurrentLanguageFlag = () => {
    return i18n.language === 'tr' ? '🇹🇷' : '🇺🇸';
  };

  if (variant === 'icon') {
    return (
      <Box>
        <NavIconButton
          onClick={handleClick}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          size={size}
          title={t('common.language')}
        >
          <LanguageIcon />
        </NavIconButton>
        <Menu
          id="language-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'language-button',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem 
            onClick={() => handleLanguageChange('en')}
            selected={i18n.language === 'en'}
          >
            <ListItemIcon>🇺🇸</ListItemIcon>
            <ListItemText>{t('common.english')}</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => handleLanguageChange('tr')}
            selected={i18n.language === 'tr'}
          >
            <ListItemIcon>🇹🇷</ListItemIcon>
            <ListItemText>{t('common.turkish')}</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  return (
    <Box>
      <StyledButton
        onClick={handleClick}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant={variant}
        size={size}
        startIcon={<LanguageIcon />}
      >
        <Typography variant="body2">
          {getCurrentLanguageFlag()} {getCurrentLanguageName()}
        </Typography>
      </StyledButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={i18n.language === 'en'}
        >
          <ListItemIcon>🇺🇸</ListItemIcon>
          <ListItemText>{t('common.english')}</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('tr')}
          selected={i18n.language === 'tr'}
        >
          <ListItemIcon>🇹🇷</ListItemIcon>
          <ListItemText>{t('common.turkish')}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;
