import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  openaiKey: string | null;
  notionToken: string | null;
  notionDatabaseId: string | null;
  githubToken: string | null;
  googleToken: string | null;
}

interface SettingsContextValue extends Settings {
  setOpenaiKey: (key: string) => Promise<void>;
  setNotionToken: (token: string) => Promise<void>;
  setNotionDatabaseId: (id: string) => Promise<void>;
  setGithubToken: (token: string) => Promise<void>;
  setGoogleToken: (token: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'opn_settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    openaiKey: null,
    notionToken: null,
    notionDatabaseId: null,
    githubToken: null,
    googleToken: null,
  });

  useEffect(() => {
    // Load stored settings on mount
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (json) {
          setSettings(JSON.parse(json));
        }
      } catch (err) {
        console.warn('Failed to load settings', err);
      }
    })();
  }, []);

  const persist = async (next: Settings) => {
    setSettings(next);
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn('Failed to save settings', err);
    }
  };

  const value: SettingsContextValue = {
    ...settings,
    setOpenaiKey: async (key) => {
      await persist({ ...settings, openaiKey: key });
    },
    setNotionToken: async (token) => {
      await persist({ ...settings, notionToken: token });
    },
    setNotionDatabaseId: async (id) => {
      await persist({ ...settings, notionDatabaseId: id });
    },
    setGithubToken: async (token) => {
      await persist({ ...settings, githubToken: token });
    },
    setGoogleToken: async (token) => {
      await persist({ ...settings, googleToken: token });
    },
    clearAll: async () => {
      const cleared: Settings = {
        openaiKey: null,
        notionToken: null,
        notionDatabaseId: null,
        githubToken: null,
        googleToken: null,
      };
      await persist(cleared);
    },
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};