import { ImageBackground, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { ThemeItem } from '@/data/themes';

type AffirmationShareCardProps = {
  affirmation: string;
  category?: string;
  theme: ThemeItem;
};

export function AffirmationShareCard({
  affirmation,
  category,
  theme,
}: AffirmationShareCardProps) {
  const normalizedCategory = category
    ? category.replace(/-/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase())
    : null;

  return (
    <View collapsable={false} style={styles.frame}>
      <ImageBackground resizeMode="cover" source={theme.image} style={styles.card}>
        <View style={styles.overlay} />

        <View style={styles.header}>
          <Text style={styles.brand}>HigherSelf</Text>
          {normalizedCategory ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{normalizedCategory}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <Text style={styles.quoteMark}>{'"'}</Text>
          <Text style={styles.affirmationText}>{affirmation}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Affirm it. Feel it. Share it.</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 480,
    height: 854,
    padding: 20,
    backgroundColor: 'transparent',
  },
  card: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 36,
    paddingTop: 52,
    paddingBottom: 42,
    justifyContent: 'space-between',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 18, 32, 0.42)',
  },
  header: {
    gap: 14,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  quoteMark: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 70,
    lineHeight: 70,
    fontWeight: '700',
    marginBottom: 4,
  },
  affirmationText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.26)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  footer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
});

export default AffirmationShareCard;
