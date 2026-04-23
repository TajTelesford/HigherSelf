
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
      style={styles.tile}
    >
      <View style={styles.tileArt}>
        <MaterialCommunityIcons color="#F2E9E4" name={icon} size={70} />
        <Ionicons
          name="sparkles"
          size={15}
          color="rgba(242, 233, 228, 0.92)"
          style={styles.tileSparkleOne}
        />
        <Ionicons
          name="sparkles"
          size={15}
          color="rgba(242, 233, 228, 0.68)"
          style={styles.tileSparkleTwo}
        />
      </View>

      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
 
  title: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 18,
  },
  tile: {
    width: '48%',
    height: 200,
    borderRadius: 28,
    backgroundColor: '#28375f',
    paddingHorizontal: 18,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  tileArt: {
    height: 142,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  tileSparkleOne: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  tileSparkleTwo: {
    position: 'absolute',
    top: 30,
    right: 18,
  },
  tileTitle: {
    color: '#F2E9E4',
    fontSize:20,
    fontWeight: '400',
    lineHeight: 0,
    position: 'absolute',
    bottom: 18,
    left: 18,
  },
});