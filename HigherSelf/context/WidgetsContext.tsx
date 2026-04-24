import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import type { WidgetTopicId } from '@/data/widgetTopics';
import { THEMES } from '@/data/themes';

export type WidgetRefreshFrequency = 'daily' | 'frequently' | 'hourly' | 'occasionally';

export type WidgetConfiguration = {
  enabled: boolean;
  id: string;
  name: string;
  refreshFrequency: WidgetRefreshFrequency;
  showBorder: boolean;
  themeId: string;
  topicIds: WidgetTopicId[];
};

type WidgetsContextType = {
  activeWidgetId: string;
  createWidgetConfiguration: () => void;
  deleteWidgetConfiguration: (id: string) => void;
  isLoaded: boolean;
  selectWidgetConfiguration: (id: string) => void;
  updateWidgetConfiguration: (
    id: string,
    updates: Partial<Omit<WidgetConfiguration, 'id'>>
  ) => void;
  widgetConfigurations: WidgetConfiguration[];
};

const DEFAULT_WIDGET_CONFIGURATION: WidgetConfiguration = {
  id: 'widget-1',
  name: 'Widget configuration #1',
  enabled: true,
  topicIds: ['general'],
  themeId: THEMES[0]?.id ?? '',
  showBorder: true,
  refreshFrequency: 'hourly',
};

const isWidgetRefreshFrequency = (
  value: unknown
): value is WidgetRefreshFrequency =>
  value === 'daily' ||
  value === 'frequently' ||
  value === 'hourly' ||
  value === 'occasionally';

const normalizeWidgetConfiguration = (
  value: unknown,
  index: number
): WidgetConfiguration | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<WidgetConfiguration>;
  const topicIds: WidgetTopicId[] =
    Array.isArray(candidate.topicIds) && candidate.topicIds.includes('general')
      ? ['general']
      : ['general'];

  return {
    id: typeof candidate.id === 'string' ? candidate.id : `widget-${index + 1}`,
    name:
      typeof candidate.name === 'string' && candidate.name.trim()
        ? candidate.name
        : `Widget configuration #${index + 1}`,
    enabled: typeof candidate.enabled === 'boolean' ? candidate.enabled : true,
    topicIds,
    themeId:
      typeof candidate.themeId === 'string' &&
      THEMES.some((theme) => theme.id === candidate.themeId)
        ? candidate.themeId
        : DEFAULT_WIDGET_CONFIGURATION.themeId,
    showBorder:
      typeof candidate.showBorder === 'boolean'
        ? candidate.showBorder
        : DEFAULT_WIDGET_CONFIGURATION.showBorder,
    refreshFrequency: isWidgetRefreshFrequency(candidate.refreshFrequency)
      ? candidate.refreshFrequency
      : DEFAULT_WIDGET_CONFIGURATION.refreshFrequency,
  };
};

const WidgetsContext = createContext<WidgetsContextType | null>(null);

export function WidgetsProvider({ children }: { children: React.ReactNode }) {
  const [widgetConfigurations, setWidgetConfigurations] = useState<WidgetConfiguration[]>([
    DEFAULT_WIDGET_CONFIGURATION,
  ]);
  const [activeWidgetId, setActiveWidgetId] = useState(DEFAULT_WIDGET_CONFIGURATION.id);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadWidgetConfigurations = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.WIDGET_CONFIGURATIONS);

        if (!storedValue) {
          setIsLoaded(true);
          return;
        }

        const parsed = JSON.parse(storedValue) as {
          activeWidgetId?: string;
          widgetConfigurations?: unknown[];
        };

        const normalizedConfigurations = Array.isArray(parsed.widgetConfigurations)
          ? parsed.widgetConfigurations
              .map((item, index) => normalizeWidgetConfiguration(item, index))
              .filter((item): item is WidgetConfiguration => Boolean(item))
          : [];

        const nextConfigurations =
          normalizedConfigurations.length > 0
            ? normalizedConfigurations
            : [DEFAULT_WIDGET_CONFIGURATION];

        setWidgetConfigurations(nextConfigurations);
        setActiveWidgetId(
          nextConfigurations.some((item) => item.id === parsed.activeWidgetId)
            ? (parsed.activeWidgetId as string)
            : nextConfigurations[0].id
        );
      } catch (error) {
        console.error('Failed to load widget configurations:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadWidgetConfigurations();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEYS.WIDGET_CONFIGURATIONS,
      JSON.stringify({ activeWidgetId, widgetConfigurations })
    ).catch((error) => {
      console.error('Failed to save widget configurations:', error);
    });
  }, [activeWidgetId, isLoaded, widgetConfigurations]);

  const updateWidgetConfiguration = useCallback(
    (id: string, updates: Partial<Omit<WidgetConfiguration, 'id'>>) => {
      setWidgetConfigurations((currentConfigurations) =>
        currentConfigurations.map((configuration) =>
          configuration.id === id ? { ...configuration, ...updates } : configuration
        )
      );
    },
    []
  );

  const createWidgetConfiguration = useCallback(() => {
    const nextConfigurationId = `widget-${Date.now()}`;

    setWidgetConfigurations((currentConfigurations) => {
      const nextIndex = currentConfigurations.length + 1;

      return [
        ...currentConfigurations,
        {
          ...DEFAULT_WIDGET_CONFIGURATION,
          id: nextConfigurationId,
          name: `Widget configuration #${nextIndex}`,
        },
      ];
    });

    setActiveWidgetId(nextConfigurationId);
  }, []);

  const deleteWidgetConfiguration = useCallback((id: string) => {
    setWidgetConfigurations((currentConfigurations) => {
      if (currentConfigurations.length <= 1) {
        return currentConfigurations;
      }

      const currentIndex = currentConfigurations.findIndex(
        (configuration) => configuration.id === id
      );
      const nextConfigurations = currentConfigurations.filter(
        (configuration) => configuration.id !== id
      );

      setActiveWidgetId((currentActiveWidgetId) => {
        if (currentActiveWidgetId !== id) {
          return currentActiveWidgetId;
        }

        const fallbackIndex =
          currentIndex > 0 ? currentIndex - 1 : 0;

        return nextConfigurations[fallbackIndex]?.id ?? nextConfigurations[0]?.id ?? '';
      });

      return nextConfigurations;
    });
  }, []);

  const selectWidgetConfiguration = useCallback((id: string) => {
    setActiveWidgetId(id);
  }, []);

  const value = useMemo(
    () => ({
      activeWidgetId,
      createWidgetConfiguration,
      deleteWidgetConfiguration,
      isLoaded,
      selectWidgetConfiguration,
      updateWidgetConfiguration,
      widgetConfigurations,
    }),
    [
      activeWidgetId,
      createWidgetConfiguration,
      deleteWidgetConfiguration,
      isLoaded,
      selectWidgetConfiguration,
      updateWidgetConfiguration,
      widgetConfigurations,
    ]
  );

  return <WidgetsContext.Provider value={value}>{children}</WidgetsContext.Provider>;
}

export function useWidgets() {
  const context = useContext(WidgetsContext);

  if (!context) {
    throw new Error('useWidgets must be used inside WidgetsProvider');
  }

  return context;
}
