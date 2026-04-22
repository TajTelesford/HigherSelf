import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Alert, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';

type AffirmationsCardProps = {
  affirmation: string;
  style?: StyleProp<ViewStyle>;
  category: string;
};

type ActionButtonProps = {
  accessibilityLabel: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
};

function ActionButton({ accessibilityLabel, icon, onPress }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
    >
      <Ionicons color="#FFFFFF" name={icon} size={26} />
    </Pressable>
  );
}



export function AffirmationsCard({
  affirmation,
  style,
  category,
}: AffirmationsCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.content}>
        <Text style={styles.affirmationText}>{affirmation}</Text>
      </View>

      <View style={styles.actions}>
        <ActionButton accessibilityLabel="Dislike affirmation" icon="close" onPress={() => Alert.alert('Skipped', 'We can show another affirmation next.')} />
        <ActionButton accessibilityLabel="Like affirmation" icon="heart" onPress={() => Alert.alert('Saved', 'This affirmation feels like a keeper.')} />
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 420,
    justifyContent: 'space-between',
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 200,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  affirmationText: {
    maxWidth: 260,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.24)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 32,
    paddingBottom: 36,
    zIndex: 2,
  },
  actionButton: {
    height: 62,
    width: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 34, 79, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.26)',
    shadowColor: '#120C24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});

export default AffirmationsCard;
