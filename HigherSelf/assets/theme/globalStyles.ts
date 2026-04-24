import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: 24,
  },

  textPrimary: {
    ...typography.body,
    color: colors.text.primary,
  },

  textSecondary: {
    ...typography.small,
    color: colors.text.secondary,
  },

  heading: {
    ...typography.headingLarge,
    color: colors.text.primary,
  },

  buttonPrimary: {
    backgroundColor: colors.accent.lavender,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
});