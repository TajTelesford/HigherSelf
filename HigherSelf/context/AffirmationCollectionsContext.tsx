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
import type { AffirmationCollection } from '@/types/collections';

type AffirmationCollectionsContextType = {
  collections: AffirmationCollection[];
  loading: boolean;
  addCollection: (name: string) => AffirmationCollection;
  toggleAffirmationInCollection: (
    collectionId: string,
    affirmation: Affirmation
  ) => void;
  isAffirmationInCollection: (collectionId: string, affirmationId: string) => boolean;
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

  const toggleAffirmationInCollection = useCallback(
    (collectionId: string, affirmation: Affirmation) => {
      setCollections((prev) =>
        prev.map((collection) => {
          if (collection.id !== collectionId) {
            return collection;
          }

          const alreadyIncluded = collection.affirmations.some(
            (item) => item.id === affirmation.id
          );

          return {
            ...collection,
            affirmations: alreadyIncluded
              ? collection.affirmations.filter((item) => item.id !== affirmation.id)
              : [...collection.affirmations, affirmation],
          };
        })
      );
    },
    []
  );

  const isAffirmationInCollection = useCallback(
    (collectionId: string, affirmationId: string) =>
      collections.some(
        (collection) =>
          collection.id === collectionId &&
          collection.affirmations.some((item) => item.id === affirmationId)
      ),
    [collections]
  );

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
      toggleAffirmationInCollection,
      isAffirmationInCollection,
      deleteCollection,
      getCollectionById,
    }),
    [
      addCollection,
      collections,
      deleteCollection,
      getCollectionById,
      isAffirmationInCollection,
      loading,
      toggleAffirmationInCollection,
    ]
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
