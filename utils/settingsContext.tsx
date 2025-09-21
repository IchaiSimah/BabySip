import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DashboardSettings {
  bottlesToShow: number;
  poopsToShow: number;
}

interface SettingsContextType {
  dashboardSettings: DashboardSettings;
  updateDashboardSettings: (settings: Partial<DashboardSettings>) => void;
}

const defaultSettings: DashboardSettings = {
  bottlesToShow: 5,
  poopsToShow: 1,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(defaultSettings);

  const updateDashboardSettings = (newSettings: Partial<DashboardSettings>) => {
    setDashboardSettings(prev => ({ ...prev, ...newSettings }));
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