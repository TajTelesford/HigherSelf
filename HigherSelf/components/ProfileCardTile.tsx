import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ProfileCard = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
};


export const ProfileCardTile = ({ title, icon, onPress }: ProfileCard) => {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <LinearGradient
        colors={['#090D16', '#12192A', '#1A1430']}
        end={{ x: 0.88, y: 1 }}
        start={{ x: 0.12, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={['rgba(146, 94, 255, 0.42)', 'rgba(39, 24, 78, 0.18)']}
            end={{ x: 0.9, y: 0.95 }}
            start={{ x: 0.1, y: 0.05 }}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons
              color="#F4C95D"
              name={icon}
              size={42}
            />
          </LinearGradient>
        </View>

        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(154, 112, 255, 0.38)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'space-between',
    borderRadius: 26,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(164, 124, 255, 0.3)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.24)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
});
