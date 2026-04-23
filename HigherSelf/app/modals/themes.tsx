import { useThemeSelection } from '@/context/ThemeContextProvider';
import { THEMES } from '@/data/themes';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ThemesScreen() {
  const { selectedThemeId, setSelectedThemeId } = useThemeSelection();

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Choose Theme</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={20} />
          </Pressable>
        </View>

        <FlatList
          data={THEMES}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedThemeId;

            return (
              <Pressable
                onPress={() => setSelectedThemeId(item.id)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <ExpoImage
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  source={item.image}
                  style={styles.image}
                  transition={0}
                />
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    height: '90%',
    maxHeight: '90%',
    backgroundColor: '#121826',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 20,
  },
  handle: {
    width: 52,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#1B2233',
    aspectRatio: 0.68,
  },
  cardSelected: {
    borderColor: '#8B7CFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
