import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Affirmation } from '../types/affirmations';

import { STORAGE_KEYS } from '../data/HigherSelf_StorageKeys';

type SavedAffirmationsContextType = {
  savedAffirmations: Affirmation[];
  isSaved: (id: string) => boolean;
  toggleSaved: (affirmation: Affirmation) => void;
  loading: boolean;
};

const SavedAffirmationsContext = createContext<SavedAffirmationsContextType| undefined>(undefined);

export function SavedAffirmationsProvider({ children }: { children: React.ReactNode }) {

    const [savedAffirmations, setSavedAffirmations] = useState<Affirmation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSavedAffirmations = async () => {
            try {
                const storedSavedAffirmations = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_AFFIRMATIONS);
                if (storedSavedAffirmations) {
                    setSavedAffirmations(JSON.parse(storedSavedAffirmations));

                }
            } catch (error) {
                console.error('Failed to load saved affirmations:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSavedAffirmations();
    }, []);

    useEffect(() => {
        if (loading) return; // Don't save to AsyncStorage until we've loaded the initial data
        const persistedAffirmations = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.SAVED_AFFIRMATIONS, 
                    JSON.stringify(savedAffirmations));
            } catch (error) {
                console.error('Failed to save affirmations:', error);
            }
        };
        persistedAffirmations();
    }, [savedAffirmations, loading]);

    const isSaved = (id: string) => savedAffirmations.some(item => item.id === id);

    const toggleSaved = (affirmation: Affirmation) => {
        setSavedAffirmations(prev => {
            if (prev.some(a => a.id === affirmation.id)) {
                return prev.filter(a => a.id !== affirmation.id);
            } else {
                return [...prev, affirmation];
            }
        });
    };

    const value = useMemo(() => ({
        savedAffirmations,
        isSaved,
        toggleSaved,
        loading,
    }), [savedAffirmations, loading]);

    return (
        <SavedAffirmationsContext.Provider value={value}>
            {children}
        </SavedAffirmationsContext.Provider>
    );

}

export function useSavedAffirmations() {
  const context = useContext(SavedAffirmationsContext);

  if (!context) {
    throw new Error('useSavedAffirmations must be used inside SavedAffirmationsProvider');
  }

  return context;
}