import { AffirmationsCard } from '@/components/AffirmationsCard';
import FloatingActionButtons from '@/components/FloatingActionButtons';
import { Image as ExpoImage } from 'expo-image';
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { useThemeSelection } from '../../context/ThemeContextProvider';
import { AFFIRMATIONS } from '../../data/affirmation';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const { selectedTheme } = useThemeSelection();

  return (
    <View style={styles.container}>
      <ExpoImage
        cachePolicy="memory-disk"
        contentFit="cover"
        source={selectedTheme.image}
        style={styles.backgroundImage}
        transition={0}
      />
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
            id={item.id}
            affirmation={item.text}
            category={item.category}
            style={[styles.card, { height }]}
          />
        )}
        snapToAlignment="start"
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33, 27, 68, 0.30)',
  },
  card: {
    minHeight: 460,
  },
});
