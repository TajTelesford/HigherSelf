import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type StreakDayState = 'done' | 'missed' | 'upcoming';

export type StreakDay = {
  label: string;
  state: StreakDayState;
  dateKey: string;
};

type StoredStreakState = {
  trackingEnabled: boolean;
  streakCount: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  checkInHistory: string[];
  lastBrokenDate: string | null;
};

type StreakContextType = {
  days: StreakDay[];
  isLoaded: boolean;
  lastCheckInDate: string | null;
  longestStreak: number;
  streakCount: number;
  trackingEnabled: boolean;
  toggleTracking: (enabled: boolean) => Promise<void>;
};

const DEFAULT_STREAK_STATE: StoredStreakState = {
  trackingEnabled: true,
  streakCount: 0,
  longestStreak: 0,
  lastCheckInDate: null,
  checkInHistory: [],
  lastBrokenDate: null,
};

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const StreakContext = createContext<StreakContextType | null>(null);

function getLocalDateKey(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function getDayDifference(fromDateKey: string, toDateKey: string) {
  const diffMs = parseDateKey(toDateKey).getTime() - parseDateKey(fromDateKey).getTime();
  return Math.round(diffMs / 86_400_000);
}

function appendUniqueDate(history: string[], dateKey: string) {
  if (history.includes(dateKey)) {
    return history;
  }

  return [...history, dateKey].sort();
}

function normalizeState(value: unknown): StoredStreakState {
  if (!value || typeof value !== 'object') {
    return DEFAULT_STREAK_STATE;
  }

  const candidate = value as Partial<StoredStreakState>;

  return {
    trackingEnabled:
      typeof candidate.trackingEnabled === 'boolean'
        ? candidate.trackingEnabled
        : DEFAULT_STREAK_STATE.trackingEnabled,
    streakCount:
      typeof candidate.streakCount === 'number'
        ? Math.max(0, candidate.streakCount)
        : DEFAULT_STREAK_STATE.streakCount,
    longestStreak:
      typeof candidate.longestStreak === 'number'
        ? Math.max(0, candidate.longestStreak)
        : DEFAULT_STREAK_STATE.longestStreak,
    lastCheckInDate:
      typeof candidate.lastCheckInDate === 'string' ? candidate.lastCheckInDate : null,
    checkInHistory: Array.isArray(candidate.checkInHistory)
      ? candidate.checkInHistory.filter((entry): entry is string => typeof entry === 'string')
      : [],
    lastBrokenDate:
      typeof candidate.lastBrokenDate === 'string' ? candidate.lastBrokenDate : null,
  };
}

function reconcileStreakState(
  state: StoredStreakState,
  todayKey = getLocalDateKey()
): StoredStreakState {
  if (!state.trackingEnabled) {
    return state;
  }

  if (!state.lastCheckInDate) {
    const firstCheckInHistory = appendUniqueDate(state.checkInHistory, todayKey);

    return {
      ...state,
      streakCount: 1,
      longestStreak: Math.max(state.longestStreak, 1),
      lastCheckInDate: todayKey,
      checkInHistory: firstCheckInHistory,
      lastBrokenDate: null,
    };
  }

  const dayDifference = getDayDifference(state.lastCheckInDate, todayKey);

  if (dayDifference <= 0) {
    return state;
  }

  if (dayDifference === 1) {
    const nextCount = state.streakCount + 1;

    return {
      ...state,
      streakCount: nextCount,
      longestStreak: Math.max(state.longestStreak, nextCount),
      lastCheckInDate: todayKey,
      checkInHistory: appendUniqueDate(state.checkInHistory, todayKey),
      lastBrokenDate: null,
    };
  }

  return {
    ...state,
    streakCount: 0,
    lastCheckInDate: todayKey,
    checkInHistory: appendUniqueDate(state.checkInHistory, todayKey),
    lastBrokenDate: todayKey,
  };
}

function getWeekStart(date = new Date()) {
  const weekStart = new Date(date);
  weekStart.setHours(12, 0, 0, 0);
  weekStart.setDate(date.getDate() - date.getDay());
  return weekStart;
}

function buildWeekDays(state: StoredStreakState, todayKey = getLocalDateKey()): StreakDay[] {
  const todayDate = parseDateKey(todayKey);
  const weekStart = getWeekStart(todayDate);
  const history = new Set(state.checkInHistory);

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + index);

    const dateKey = getLocalDateKey(currentDate);
    const isFuture = getDayDifference(todayKey, dateKey) > 0;
    const wasDone = history.has(dateKey);

    let stateForDay: StreakDayState = 'upcoming';

    if (wasDone) {
      stateForDay = 'done';
    } else if (!isFuture && state.trackingEnabled) {
      stateForDay = 'missed';
    }

    return {
      label: WEEKDAY_LABELS[currentDate.getDay()],
      state: stateForDay,
      dateKey,
    };
  });
}

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [streakState, setStreakState] = useState<StoredStreakState>(DEFAULT_STREAK_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    let isMounted = true;

    const loadStreakState = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_STREAK);
        const parsedState = storedValue
          ? normalizeState(JSON.parse(storedValue))
          : DEFAULT_STREAK_STATE;
        const nextState = reconcileStreakState(parsedState);

        if (!isMounted) {
          return;
        }

        setStreakState(nextState);

        if (JSON.stringify(nextState) !== JSON.stringify(parsedState)) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_STREAK, JSON.stringify(nextState));
        }
      } catch (error) {
        console.error('Failed to load streak state:', error);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadStreakState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      const wasInactive =
        appStateRef.current === 'inactive' || appStateRef.current === 'background';
      appStateRef.current = nextAppState;

      if (!wasInactive || nextAppState !== 'active') {
        return;
      }

      setStreakState((currentState) => {
        const nextState = reconcileStreakState(currentState);

        if (JSON.stringify(nextState) !== JSON.stringify(currentState)) {
          AsyncStorage.setItem(STORAGE_KEYS.USER_STREAK, JSON.stringify(nextState)).catch(
            (error) => {
              console.error('Failed to refresh streak state:', error);
            }
          );
        }

        return nextState;
      });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const toggleTracking = async (enabled: boolean) => {
    setStreakState((currentState) => {
      const nextState = enabled
        ? reconcileStreakState({
            ...currentState,
            trackingEnabled: true,
          })
        : {
            ...currentState,
            trackingEnabled: false,
          };

      AsyncStorage.setItem(STORAGE_KEYS.USER_STREAK, JSON.stringify(nextState)).catch(
        (error) => {
          console.error('Failed to update streak tracking preference:', error);
        }
      );

      return nextState;
    });
  };

  const value = useMemo<StreakContextType>(() => {
    return {
      days: buildWeekDays(streakState),
      isLoaded,
      lastCheckInDate: streakState.lastCheckInDate,
      longestStreak: streakState.longestStreak,
      streakCount: streakState.streakCount,
      trackingEnabled: streakState.trackingEnabled,
      toggleTracking,
    };
  }, [isLoaded, streakState]);

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

export function useStreak() {
  const context = useContext(StreakContext);

  if (!context) {
    throw new Error('useStreak must be used inside StreakProvider');
  }

  return context;
}
