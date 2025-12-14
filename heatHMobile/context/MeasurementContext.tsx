import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MeasurementSystem } from '../constants/measurements';

type MeasurementContextValue = {
  system: MeasurementSystem;
  isMetric: boolean;
  setSystem: (next: MeasurementSystem) => Promise<void>;
  toggleSystem: () => Promise<void>;
};

const MeasurementContext = createContext<MeasurementContextValue | undefined>(undefined);
const STORAGE_KEY = 'user-measurement-system';

export const MeasurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [system, setSystemState] = useState<MeasurementSystem>('metric');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'metric' || stored === 'imperial') {
          setSystemState(stored);
        }
      } catch (error) {
        console.warn('Failed to load measurement preference', error);
      }
    })();
  }, []);

  const persistSystem = useCallback(async (next: MeasurementSystem) => {
    setSystemState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      console.warn('Failed to persist measurement preference', error);
    }
  }, []);

  const toggleSystem = useCallback(async () => {
    const next = system === 'metric' ? 'imperial' : 'metric';
    await persistSystem(next);
  }, [persistSystem, system]);

  const value = useMemo<MeasurementContextValue>(
    () => ({
      system,
      isMetric: system === 'metric',
      setSystem: persistSystem,
      toggleSystem,
    }),
    [persistSystem, system, toggleSystem]
  );

  return <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>;
};

export const useMeasurement = (): MeasurementContextValue => {
  const ctx = useContext(MeasurementContext);
  if (!ctx) {
    throw new Error('useMeasurement must be used within a MeasurementProvider');
  }
  return ctx;
};

