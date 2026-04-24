export type ReminderSchedule =
  | {
      hour: number;
      minute: number;
      weekdays?: undefined;
    }
  | {
      hour: number;
      minute: number;
      weekdays: number[];
    };

export type ReminderDefinition = {
  id: string;
  title: string;
  frequencyLabel: string;
  scheduleLabel: string;
  notificationBody: string;
  notificationTitle?: string;
  schedules: ReminderSchedule[];
  defaultEnabled?: boolean;
  locked?: boolean;
};

const WEEKDAYS = [2, 3, 4, 5, 6];

export const REMINDER_NOTIFICATION_LOGO = require('@/assets/images/reminder-notification-logo.jpg');
export const REMINDER_NOTIFICATION_CHANNEL_ID = 'daily-reminders';

export const REMINDER_DEFINITIONS: ReminderDefinition[] = [
  {
    id: 'general',
    title: 'General',
    frequencyLabel: '10x  Every day',
    scheduleLabel: '9:00AM-10:00PM',
    notificationTitle: 'HigherSelf reminder',
    notificationBody: 'Pause for a second and come back to the affirmations shaping your day.',
    defaultEnabled: true,
    schedules: [
      { hour: 9, minute: 0 },
      { hour: 10, minute: 30 },
      { hour: 12, minute: 0 },
      { hour: 13, minute: 30 },
      { hour: 15, minute: 0 },
      { hour: 16, minute: 30 },
      { hour: 18, minute: 0 },
      { hour: 19, minute: 0 },
      { hour: 20, minute: 30 },
      { hour: 22, minute: 0 },
    ],
  },
  {
    id: 'daily-practice',
    title: 'Daily practice reminder',
    frequencyLabel: '1x  Every day',
    scheduleLabel: '10:00AM',
    notificationTitle: 'Practice reminder',
    notificationBody: 'Take a few minutes to speak your affirmations out loud today.',
    schedules: [{ hour: 10, minute: 0 }],
  },
  {
    id: 'daily-writing',
    title: 'Daily writing reminder',
    frequencyLabel: '1x  Every day',
    scheduleLabel: '10:00AM',
    notificationTitle: 'Writing reminder',
    notificationBody: 'Write down the affirmations you want to reinforce today.',
    schedules: [{ hour: 10, minute: 0 }],
  },
  {
    id: 'streak',
    title: 'Streak reminder',
    frequencyLabel: '1x  Every day',
    scheduleLabel: '9:00PM',
    notificationTitle: 'Protect your streak',
    notificationBody: 'Keep your HigherSelf streak going with one more affirmation session today.',
    defaultEnabled: true,
    schedules: [{ hour: 21, minute: 0 }],
  },
  {
    id: 'career-success',
    title: 'Achieve career success',
    frequencyLabel: '3x  Every weekday',
    scheduleLabel: '9:00AM-5:00PM',
    notificationTitle: 'Career reminder',
    notificationBody: 'Reconnect with the affirmations supporting your career growth.',
    locked: true,
    schedules: [
      { hour: 9, minute: 0, weekdays: WEEKDAYS },
      { hour: 13, minute: 0, weekdays: WEEKDAYS },
      { hour: 17, minute: 0, weekdays: WEEKDAYS },
    ],
  },
  {
    id: 'attract-love',
    title: 'Attract love',
    frequencyLabel: '3x  Every day',
    scheduleLabel: '6:00PM-9:00PM',
    notificationTitle: 'Love reminder',
    notificationBody: 'Return to the affirmations helping you welcome love in with intention.',
    locked: true,
    schedules: [
      { hour: 18, minute: 0 },
      { hour: 19, minute: 30 },
      { hour: 21, minute: 0 },
    ],
  },
];
