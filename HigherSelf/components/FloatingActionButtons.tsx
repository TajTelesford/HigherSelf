import HomeScreenButton from '@/components/HomeScreenButton';
import RecoridngHomesScreeButton from '@/components/RecoridngHomesScreenButton';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';



export default function FloatingActionButtons() {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <HomeScreenButton
        icon="person-outline"
        onPress={() => router.push('/modals/profile')}
        style={styles.topLeft}
        variant="glass"
      />

      <HomeScreenButton
        icon="color-palette-outline"
        onPress={() => router.push('/modals/themes')}
        style={styles.topRight}
        variant="glass"
      />

      <HomeScreenButton
        icon="library-outline"
        onPress={() => router.push('/modals/library')}
        style={styles.bottomLeft}
        variant="glass"
      />

      <HomeScreenButton
        icon="happy-outline"
        onPress={() => router.push('/modals/mood')}
        style={styles.bottomRight}
        variant="glass"
      />

      <RecoridngHomesScreeButton
        label="Practice"
        onPress={() => router.push('/modals/practiceAffirmations')}
        style={styles.bottomCenter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    zIndex: 20,
    elevation: 20,
  },
  topLeft: {
    position: 'absolute',
    top: 64,
    left: 18,
  },
  topRight: {
    position: 'absolute',
    top: 64,
    right: 18,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 50,
    left: 22,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 50,
    right: 22,
  },
  bottomCenter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});
