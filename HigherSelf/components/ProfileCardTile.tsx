import { colors } from '@/assets/theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ProfileCard = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
};


export const ProfileCardTile = ({ title, icon, onPress }: ProfileCard) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tile, styles.tilePressed]}
    >
      <View style={styles.tileArt}>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons color={colors.accent.gold} name={icon} size={64} />
        </View>
        <Ionicons
          name="sparkles"
          size={14}
          color="rgba(242, 201, 76, 0.9)"
          style={styles.tileSparkleOne}
        />
        <Ionicons
          name="sparkles"
          size={14}
          color="rgba(139, 124, 255, 0.9)"
          style={styles.tileSparkleTwo}
        />
      </View>

      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
};


const styles = StyleSheet.create({
  tile: {
    width: '50%',
    minHeight: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(242, 201, 76, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(242, 201, 76, 0.22)',
    overflow: 'hidden',
  },
  tilePressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  tileArt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 0,
    paddingBottom: 0,
  },
  iconBadge: {
    width: '100%',
    height: 178,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSparkleOne: {
    position: 'absolute',
    top: 8,
    left: 20,
  },
  tileSparkleTwo: {
    position: 'absolute',
    top: 18,
    right: 24,
  },
  tileTitle: {
    color: colors.text.primary,
    fontSize: 21,
    fontWeight: '300',
    lineHeight: 27,
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 22,
  },
});
