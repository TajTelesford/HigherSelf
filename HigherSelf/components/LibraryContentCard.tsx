import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type LibraryContentCardProps = {
  text?: string;
};

export function LibraryContentCard({
  text = 'Open your favorites, collections, custom affirmations, and recordings.',
}: LibraryContentCardProps) {
  const handlePress = () => {
    router.dismissAll();
    router.push('/modals/library');
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.body}>{text}</Text>
        </View>

        <View style={styles.artWrap}>
          <Ionicons
            name="library-outline"
            size={52}
            color="rgba(244, 201, 93, 0.86)"
          />
          <Ionicons
            name="sparkles"
            size={14}
            color="rgba(255, 248, 220, 0.8)"
            style={styles.sparkleTop}
          />
          <Ionicons
            name="sparkles"
            size={10}
            color="rgba(255, 248, 220, 0.68)"
            style={styles.sparkleBottom}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 132,
    borderRadius: 26,
    backgroundColor: 'rgba(78, 58, 24, 0.96)',
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(244, 201, 93, 0.2)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 26,
    padding: 15,
  },
  textWrap: {
    flex: 1,
    paddingRight: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  artWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleTop: {
    position: 'absolute',
    top: 10,
    right: 6,
  },
  sparkleBottom: {
    position: 'absolute',
    bottom: 10,
    left: 8,
  },
});
