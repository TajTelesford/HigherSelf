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
        <View style={styles.glow} />

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
    width: 1080,
    height: 1920,
    borderRadius: 64,
    overflow: 'hidden',
    backgroundColor: '#0B0F1A',
  },
  card: {
    flex: 1,
    paddingHorizontal: 84,
    paddingTop: 118,
    paddingBottom: 96,
    justifyContent: 'space-between',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 18, 32, 0.42)',
  },
  glow: {
    position: 'absolute',
    width: 620,
    height: 620,
    borderRadius: 310,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    top: 180,
    right: -120,
  },
  header: {
    gap: 32,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '800',
    letterSpacing: -1.6,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  quoteMark: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 160,
    lineHeight: 160,
    fontWeight: '700',
    marginBottom: 8,
  },
  affirmationText: {
    color: '#FFFFFF',
    fontSize: 82,
    lineHeight: 104,
    fontWeight: '800',
    letterSpacing: -2.2,
    textShadowColor: 'rgba(0, 0, 0, 0.26)',
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 22,
  },
  footer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '600',
  },
});

export default AffirmationShareCard;
