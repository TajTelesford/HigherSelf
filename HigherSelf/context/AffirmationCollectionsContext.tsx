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
import type { AffirmationCollection } from '@/types/collections';

type AffirmationCollectionsContextType = {
  collections: AffirmationCollection[];
  loading: boolean;
  addCollection: (name: string) => AffirmationCollection;
  deleteCollection: (id: string) => void;
  getCollectionById: (id: string) => AffirmationCollection | undefined;
};

const AffirmationCollectionsContext = createContext<
  AffirmationCollectionsContextType | undefined
>(undefined);

export function AffirmationCollectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collections, setCollections] = useState<AffirmationCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const storedCollections = await AsyncStorage.getItem(
          STORAGE_KEYS.AFFIRMATION_COLLECTIONS
        );

        if (storedCollections) {
          setCollections(JSON.parse(storedCollections));
        }
      } catch (error) {
        console.error('Failed to load affirmation collections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  useEffect(() => {
    if (loading) return;

    const persistCollections = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.AFFIRMATION_COLLECTIONS,
          JSON.stringify(collections)
        );
      } catch (error) {
        console.error('Failed to save affirmation collections:', error);
      }
    };

    persistCollections();
  }, [collections, loading]);

  const addCollection = useCallback((name: string) => {
    const createdAt = new Date().toISOString();
    const collection: AffirmationCollection = {
      id: `${Date.now()}`,
      name: name.trim(),
      affirmations: [],
      createdAt,
    };

    setCollections((prev) => [collection, ...prev]);
    return collection;
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) =>
      prev.filter((collection) => collection.id !== id)
    );
  }, []);

  const getCollectionById = useCallback(
    (id: string) => collections.find((collection) => collection.id === id),
    [collections]
  );

  const value = useMemo(
    () => ({
      collections,
      loading,
      addCollection,
      deleteCollection,
      getCollectionById,
    }),
    [addCollection, collections, deleteCollection, getCollectionById, loading]
  );

  return (
    <AffirmationCollectionsContext.Provider value={value}>
      {children}
    </AffirmationCollectionsContext.Provider>
  );
}

export function useAffirmationCollections() {
  const context = useContext(AffirmationCollectionsContext);

  if (!context) {
    throw new Error(
      'useAffirmationCollections must be used inside AffirmationCollectionsProvider'
    );
  }

  return context;
}
