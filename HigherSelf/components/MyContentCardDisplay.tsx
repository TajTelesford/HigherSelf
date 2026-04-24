import { StyleSheet, View } from 'react-native';
import { MyContentCard, type MyContentCardProps } from './MyContentCard';

const CONTENT_ROWS: MyContentCardProps[][] = [
  [
    {
      title: 'Favorites',
      href: '/my-content/favorites',
      icon: { family: 'ionicons' as const, name: 'heart-outline' as const },
    },
    {
      title: 'Collections',
      href: '/my-content/collections',
      icon: { family: 'ionicons' as const, name: 'bookmark-outline' as const },
    },
  ],
  [
    {
      title: 'My\naffirmations',
      href: '/my-content/my-own-affirmations',
      icon: {
        family: 'material-community' as const,
        name: 'feather' as const,
      },
    },
    {
      title: 'Recorded\naffirmations',
      href: '/my-content/recorded-affirmations',
      icon: { family: 'ionicons' as const, name: 'play-outline' as const },
    },
  ],
];

export function MyContentCardDisplay() {
  return (
    <View style={styles.grid}>
      {CONTENT_ROWS.map((row, index) => (
        <View key={`content-row-${index}`} style={styles.row}>
          {row.map((card) => (
            <MyContentCard key={card.title} {...card} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
