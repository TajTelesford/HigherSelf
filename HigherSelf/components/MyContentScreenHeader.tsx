import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type MyContentScreenHeaderProps = {
  title: string;
};

export function MyContentScreenHeader({
  title,
}: MyContentScreenHeaderProps) {
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel={`Go back from ${title}`}
        hitSlop={10}
        onPress={handleBackPress}
        style={styles.backButton}
      >
        <Ionicons color="#F5F7FA" name="arrow-back" size={26} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 30,
    fontWeight: '700',
  },
});
