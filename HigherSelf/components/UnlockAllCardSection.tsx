import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

type UnlockAllCardSectionProps = {
  text?: string;
}

export const UnlockAllCardSection = ({text}: UnlockAllCardSectionProps) => {
  return (
    <Pressable
            onPress={() => Alert.alert('Unlock all', 'Premium upgrade flow is coming next.')}
            style={styles.upgradeCard}
          >
            <View style={styles.upgradeContentRow}>
              <View style={styles.upgradeTextWrap}>
                <Text style={styles.upgradeTitle}>Unlock all</Text>
                <Text style={styles.upgradeBody}>
                  {text}
                </Text>
              </View>

              <View style={styles.upgradeArtWrap}>
                <MaterialCommunityIcons
                  name="diamond-stone"
                  size={54}
                  color="rgba(220, 112, 234, 0.72)"
                />
              </View>
            </View>
          </Pressable>
  )
}


const styles = StyleSheet.create({
  upgradeCard: {
    minHeight: 132,
    borderRadius: 26,
    backgroundColor: 'rgba(216, 157, 185, 0.92)',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  upgradeCardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },
  upgradeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 26,
    padding: 15,
  },
  upgradeTextWrap: {
    flex: 1,
    paddingRight: 20,
    justifyContent: 'center',
  },
  upgradeTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  upgradeBody: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  upgradeArtWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
