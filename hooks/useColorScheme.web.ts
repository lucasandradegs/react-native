import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [initialColorScheme, setInitialColorScheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Detecta a preferência do sistema antes da hidratação
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setInitialColorScheme(prefersDark ? 'dark' : 'light');
    }
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return initialColorScheme;
}
