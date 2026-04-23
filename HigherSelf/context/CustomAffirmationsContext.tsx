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
import type { Affirmation } from '@/types/affirmations';

type StoredAffirmationLike =
  | string
  | {
      id?: string | number;
      text?: string;
      affirmation?: string;
      category?: string;
      createdAt?: string;
      savedAt?: string;
    };

type CustomAffirmationsContextType = {
  addCustomAffirmation: (text: string) => Affirmation;
  customAffirmations: Affirmation[];
  deleteCustomAffirmation: (id: string) => void;
  loading: boolean;
};

const normalizeStoredCustomAffirmations = (value: string | null): Affirmation[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as StoredAffirmationLike[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map<Affirmation | null>((item, index) => {
        if (typeof item === 'string') {
          const text = item.trim();

          if (!text) {
            return null;
          }

          return {
            id: `custom-${index}-${text}`,
            text,
            category: 'custom',
            createdAt: new Date().toISOString(),
          } satisfies Affirmation;
        }

        const text = item.text?.trim() || item.affirmation?.trim();

        if (!text) {
          return null;
        }

        return {
          id: String(item.id ?? `custom-${index}-${text}`),
          text,
          category: item.category ?? 'custom',
          createdAt: item.createdAt ?? item.savedAt ?? new Date().toISOString(),
          savedAt: item.savedAt,
        };
      })
      .filter((item): item is Affirmation => Boolean(item))
      .sort((a, b) => {
        const aTime = new Date(a.createdAt ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? 0).getTime();

        return bTime - aTime;
      });
  } catch (error) {
    console.error('Failed to parse custom affirmations:', error);
    return [];
  }
};

const CustomAffirmationsContext = createContext<
  CustomAffirmationsContextType | undefined
>(undefined);

export function CustomAffirmationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customAffirmations, setCustomAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomAffirmations = async () => {
      try {
        const storedCustomAffirmations = await AsyncStorage.getItem(
          STORAGE_KEYS.CUSTOM_AFFIRMATIONS
        );

        setCustomAffirmations(
          normalizeStoredCustomAffirmations(storedCustomAffirmations)
        );
      } catch (error) {
        console.error('Failed to load custom affirmations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomAffirmations();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const persistCustomAffirmations = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.CUSTOM_AFFIRMATIONS,
          JSON.stringify(customAffirmations)
        );
      } catch (error) {
        console.error('Failed to save custom affirmations:', error);
      }
    };

    persistCustomAffirmations();
  }, [customAffirmations, loading]);

  const addCustomAffirmation = useCallback((text: string) => {
    const trimmedText = text.trim();
    const createdAt = new Date().toISOString();
    const affirmation: Affirmation = {
      id: `custom-${Date.now()}`,
      text: trimmedText,
      category: 'custom',
      createdAt,
    };

    setCustomAffirmations((currentAffirmations) => [
      affirmation,
      ...currentAffirmations,
    ]);

    return affirmation;
  }, []);

  const deleteCustomAffirmation = useCallback((id: string) => {
    setCustomAffirmations((currentAffirmations) =>
      currentAffirmations.filter((affirmation) => affirmation.id !== id)
    );
  }, []);

  const value = useMemo(
    () => ({
      addCustomAffirmation,
      customAffirmations,
      deleteCustomAffirmation,
      loading,
    }),
    [addCustomAffirmation, customAffirmations, deleteCustomAffirmation, loading]
  );

  return (
    <CustomAffirmationsContext.Provider value={value}>
      {children}
    </CustomAffirmationsContext.Provider>
  );
}

export function useCustomAffirmations() {
  const context = useContext(CustomAffirmationsContext);

  if (!context) {
    throw new Error(
      'useCustomAffirmations must be used inside CustomAffirmationsProvider'
    );
  }

  return context;
}
