import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AffirmationsCard } from '@/components/AffirmationsCard';
import { AFFIRMATIONS } from '../data/affirmation';

export default function HomeScreen() {
  const { height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={[styles.glow, styles.topGlow]} />
      <View style={[styles.glow, styles.bottomGlow]} />
      <View pointerEvents="none" style={styles.overlay} />

      <FlatList
        data={AFFIRMATIONS}
        decelerationRate="fast"
        disableIntervalMomentum
        getItemLayout={(_, index) => ({
          index,
          length: height,
          offset: height * index,
        })}
        keyExtractor={(item) => item.id}
        pagingEnabled
        renderItem={({ item }) => (
          <AffirmationsCard
            affirmation={item.text}
            category={item.category}
            style={[styles.card, { height }]}
          />
        )}
        snapToAlignment="start"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#B8B9DA',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33, 27, 68, 0.28)',
  },
  card: {
    minHeight: 460,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  topGlow: {
    top: 80,
    right: -30,
    height: 220,
    width: 220,
  },
  bottomGlow: {
    bottom: 120,
    left: -70,
    height: 280,
    width: 280,
  },
});
