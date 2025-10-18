import { useFonts as useExpoFonts } from 'expo-font';

export const useFonts = () => {
  const [fontsLoaded] = useExpoFonts({
    'OpenDyslexic-Regular': require('../assets/fonts/OpenDyslexic-Regular.otf'),
    'OpenDyslexic-Bold': require('../assets/fonts/OpenDyslexic-Bold.otf'),
    'OpenDyslexic-Italic': require('../assets/fonts/OpenDyslexic-Italic.otf'),
    'OpenDyslexic-Bold-Italic': require('../assets/fonts/OpenDyslexic-Bold-Italic.otf'),
  });

  return fontsLoaded;
};
