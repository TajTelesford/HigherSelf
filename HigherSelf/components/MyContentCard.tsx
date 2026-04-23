import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type MyContentCardProps = {
  title: string;
  href: string;
  icon:
    | {
        family: 'ionicons';
        name: keyof typeof Ionicons.glyphMap;
      }
    | {
        family: 'material-community';
        name: keyof typeof MaterialCommunityIcons.glyphMap;
      };
};

function CardIcon({ icon }: { icon: MyContentCardProps['icon'] }) {
  if (icon.family === 'ionicons') {
    return <Ionicons color="#F5F7FA" name={icon.name} size={52} />;
  }

  return <MaterialCommunityIcons color="#F5F7FA" name={icon.name} size={52} />;
}

export function MyContentCard({ title, href, icon }: MyContentCardProps) {
  return (
    <Pressable
      onPress={() => router.push(`/?${href}`)}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <CardIcon icon={icon} />
      </View>

      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    height: 150,
    borderRadius: 28,
    backgroundColor: 'rgba(27, 34, 51, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 22,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.988 }],
  },
  iconWrap: {
    minHeight: 56,
    justifyContent: 'center',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 26,
  },
});
