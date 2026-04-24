import { REMINDER_DEFINITIONS, REMINDER_NOTIFICATION_CHANNEL_ID, REMINDER_NOTIFICATION_LOGO, type ReminderDefinition, type ReminderSchedule } from '@/data/reminders';
import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

type ReminderStateItem = {
  enabled: boolean;
  scheduledNotificationIds: string[];
};

type StoredReminderState = Record<string, ReminderStateItem>;

export type ReminderPreference = ReminderDefinition & {
  enabled: boolean;
  scheduledNotificationIds: string[];
};

type RemindersContextType = {
  isLoaded: boolean;
  reminders: ReminderPreference[];
  toggleReminder: (reminderId: string, enabled: boolean) => Promise<void>;
};

const RemindersContext = createContext<RemindersContextType | null>(null);

function buildDefaultReminderState(): StoredReminderState {
  return REMINDER_DEFINITIONS.reduce<StoredReminderState>((state, reminder) => {
    state[reminder.id] = {
      enabled: Boolean(reminder.defaultEnabled),
      scheduledNotificationIds: [],
    };
    return state;
  }, {});
}

function normalizeReminderState(value: unknown): StoredReminderState {
  const defaultState = buildDefaultReminderState();

  if (!value || typeof value !== 'object') {
    return defaultState;
  }

  const candidate = value as Record<string, Partial<ReminderStateItem>>;

  for (const reminder of REMINDER_DEFINITIONS) {
    const entry = candidate[reminder.id];

    if (!entry || typeof entry !== 'object') {
      continue;
    }

    defaultState[reminder.id] = {
      enabled:
        typeof entry.enabled === 'boolean' ? entry.enabled : defaultState[reminder.id].enabled,
      scheduledNotificationIds: Array.isArray(entry.scheduledNotificationIds)
        ? entry.scheduledNotificationIds.filter((item): item is string => typeof item === 'string')
        : [],
    };
  }

  return defaultState;
}

async function getReminderAttachmentUri() {
  const asset = Asset.fromModule(REMINDER_NOTIFICATION_LOGO);

  if (!asset.localUri) {
    await asset.downloadAsync();
  }

  return asset.localUri ?? asset.uri;
}

function buildDailyTrigger(schedule: ReminderSchedule): Notifications.DailyTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
    hour: schedule.hour,
    minute: schedule.minute,
  };
}

function buildWeeklyTriggers(schedule: Extract<ReminderSchedule, { weekdays: number[] }>) {
  return schedule.weekdays.map<Notifications.WeeklyTriggerInput>((weekday) => ({
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
    weekday,
    hour: schedule.hour,
    minute: schedule.minute,
  }));
}

async function scheduleReminderNotifications(reminder: ReminderDefinition) {
  const attachmentUri = Platform.OS === 'ios' ? await getReminderAttachmentUri() : null;
  const scheduledIds: string[] = [];

  for (const schedule of reminder.schedules) {
    const triggers =
      'weekdays' in schedule && schedule.weekdays?.length
        ? buildWeeklyTriggers(schedule)
        : [buildDailyTrigger(schedule)];

    for (const trigger of triggers) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.notificationTitle ?? reminder.title,
          body: reminder.notificationBody,
          sound: 'default',
          color: '#8B7CFF',
          data: {
            reminderId: reminder.id,
          },
          ...(attachmentUri
            ? {
                attachments: [
                  {
                    identifier: `${reminder.id}-logo`,
                    url: attachmentUri,
                    type: 'public.jpeg',
                    typeHint: 'public.jpeg',
                  },
                ],
              }
            : {}),
        },
        trigger,
      });

      scheduledIds.push(identifier);
    }
  }

  return scheduledIds;
}

async function cancelReminderNotifications(notificationIds: string[]) {
  await Promise.all(
    notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch((error) => {
        console.error(`Failed to cancel reminder notification ${id}:`, error);
      })
    )
  );
}

async function ensureNotificationPermission() {
  if (Platform.OS === 'web') {
    Alert.alert('COMING SOON', 'Reminder notifications are only available on iOS and Android.');
    return false;
  }

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.granted) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();

  if (requestedPermissions.granted) {
    return true;
  }

  Alert.alert(
    'Notifications are off',
    'Enable notifications for HigherSelf in your device settings to use reminders.'
  );

  return false;
}

async function configureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_NOTIFICATION_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.HIGH,
    description: 'HigherSelf reminder notifications',
    vibrationPattern: [0, 200, 120, 200],
    lightColor: '#8B7CFF',
    sound: 'default',
  });
}

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminderState, setReminderState] = useState<StoredReminderState>(buildDefaultReminderState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadReminderState = async () => {
      try {
        await configureNotificationChannel();

        const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
        const parsedValue = storedValue ? JSON.parse(storedValue) : null;

        if (!isMounted) {
          return;
        }

        setReminderState(normalizeReminderState(parsedValue));
      } catch (error) {
        console.error('Failed to load reminders:', error);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadReminderState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminderState)).catch((error) => {
      console.error('Failed to persist reminders:', error);
    });
  }, [isLoaded, reminderState]);

  useEffect(() => {
    if (!isLoaded || Platform.OS === 'web') {
      return;
    }

    const syncScheduledReminders = async () => {
      try {
        const permissions = await Notifications.getPermissionsAsync();

        if (!permissions.granted) {
          return;
        }

        for (const reminder of REMINDER_DEFINITIONS) {
          const currentEntry = reminderState[reminder.id];

          if (!currentEntry?.enabled || reminder.locked) {
            continue;
          }

          const nextIds = await scheduleReminderNotifications(reminder);

          if (currentEntry.scheduledNotificationIds.length) {
            await cancelReminderNotifications(currentEntry.scheduledNotificationIds);
          }

          setReminderState((currentState) => ({
            ...currentState,
            [reminder.id]: {
              ...currentState[reminder.id],
              scheduledNotificationIds: nextIds,
            },
          }));
        }
      } catch (error) {
        console.error('Failed to synchronize reminders:', error);
      }
    };

    syncScheduledReminders();
    // This only runs after the initial load so saved enabled reminders get rescheduled on launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const reminders = useMemo(
    () =>
      REMINDER_DEFINITIONS.map((reminder) => ({
        ...reminder,
        enabled: reminderState[reminder.id]?.enabled ?? Boolean(reminder.defaultEnabled),
        scheduledNotificationIds: reminderState[reminder.id]?.scheduledNotificationIds ?? [],
      })),
    [reminderState]
  );

  const toggleReminder = async (reminderId: string, enabled: boolean) => {
    const reminder = REMINDER_DEFINITIONS.find((item) => item.id === reminderId);

    if (!reminder) {
      return;
    }

    if (reminder.locked) {
      Alert.alert('COMING SOON');
      return;
    }

    const currentEntry = reminderState[reminder.id] ?? {
      enabled: false,
      scheduledNotificationIds: [],
    };

    if (!enabled) {
      if (currentEntry.scheduledNotificationIds.length) {
        await cancelReminderNotifications(currentEntry.scheduledNotificationIds);
      }

      setReminderState((currentState) => ({
        ...currentState,
        [reminder.id]: {
          enabled: false,
          scheduledNotificationIds: [],
        },
      }));

      return;
    }

    const hasPermission = await ensureNotificationPermission();

    if (!hasPermission) {
      return;
    }

    await configureNotificationChannel();

    if (currentEntry.scheduledNotificationIds.length) {
      await cancelReminderNotifications(currentEntry.scheduledNotificationIds);
    }

    const nextIds = await scheduleReminderNotifications(reminder);

    setReminderState((currentState) => ({
      ...currentState,
      [reminder.id]: {
        enabled: true,
        scheduledNotificationIds: nextIds,
      },
    }));
  };

  return (
    <RemindersContext.Provider
      value={{
        isLoaded,
        reminders,
        toggleReminder,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(RemindersContext);

  if (!context) {
    throw new Error('useReminders must be used inside a RemindersProvider');
  }

  return context;
}
