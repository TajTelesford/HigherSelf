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
    return <Ionicons color="#F5F7FA" name={icon.name} size={35} />;
  }

  return <MaterialCommunityIcons color="#F5F7FA" name={icon.name} size={35} />;
}

export function MyContentCard({ title, href, icon }: MyContentCardProps) {
  return (
    <Pressable
      onPress={() => router.push(`/?${href}`)}
      style={styles.card}
    >
      <View style={styles.contentRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.iconWrap}>
          <CardIcon icon={icon} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 25,
    width: '48%',
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(27, 34, 51, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width:  40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    
  },
});
