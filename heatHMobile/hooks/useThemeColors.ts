import { useTheme } from '../context/ThemeContext';
import { colors, textColors, borderColors, darkColors, darkTextColors, darkBorderColors, fonts, fontSizes, lineHeights } from '../constants/theme';

export const useThemeColors = () => {
  const { isDark, isDyslexic, isColorBlind } = useTheme();

  // Get base colors
  const baseColors = isDark ? darkColors : colors;
  
  // Apply color blind adjustments if needed
  const adjustedColors = isColorBlind ? {
    ...baseColors,
    success: baseColors.colorBlindSuccess,
    error: baseColors.colorBlindError,
    warning: baseColors.colorBlindWarning,
    primary: baseColors.colorBlindPrimary,
    info: baseColors.colorBlindInfo,
  } : baseColors;

  return {
    colors: adjustedColors,
    textColors: isDark ? darkTextColors : textColors,
    borderColors: isDark ? darkBorderColors : borderColors,
    fonts: isDyslexic ? fonts.dyslexic : fonts.normal,
    fontSizes,
    lineHeights: isDyslexic ? lineHeights.dyslexic : lineHeights.normal,
  };
};
