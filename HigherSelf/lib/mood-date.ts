export const MOOD_PICKER_START_HOUR = 6;

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function canSelectMoodForCurrentDate(date = new Date()) {
  return date.getHours() >= MOOD_PICKER_START_HOUR;
}

export function pruneFutureMoodEntries(
  moodsByDate: Record<string, string>,
  currentDateKey = getLocalDateKey()
) {
  return Object.fromEntries(
    Object.entries(moodsByDate).filter(([dateKey]) => dateKey <= currentDateKey)
  );
}
