import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface DashboardSettings {
  bottlesToShow: number;
  poopsToShow: number;
  lastBottleDefault: number; // persisted default amount for last bottle
}

interface SettingsContextType {
  dashboardSettings: DashboardSettings;
  updateDashboardSettings: (settings: Partial<DashboardSettings>) => void;
}

const defaultSettings: DashboardSettings = {
  bottlesToShow: 5,
  poopsToShow: 1,
  lastBottleDefault: 120,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(defaultSettings);

  // Load persisted settings on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('dashboardSettings');
        if (raw) {
          const parsed = JSON.parse(raw);
          // Shallow-merge with defaults to tolerate missing keys
          setDashboardSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        // Ignore and keep defaults
      }
    })();
  }, []);

  const updateDashboardSettings = (newSettings: Partial<DashboardSettings>) => {
    setDashboardSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Persist asynchronously (fire-and-forget)
      AsyncStorage.setItem('dashboardSettings', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ dashboardSettings, updateDashboardSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 