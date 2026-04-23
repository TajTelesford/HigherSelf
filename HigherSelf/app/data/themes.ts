import type { ImageSourcePropType } from 'react-native';

export type ThemeItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

export const THEMES: ThemeItem[] = [
  {
    id: 'beach-canyon',
    name: 'Beach Canyon',
    image: require('../../assets/images/beach_canyon.jpg'),
  },
  {
    id: 'city-speedy-lights',
    name: 'City Speedy Lights',
    image: require('../../assets/images/city_speedy_lights.jpg'),
  },
  {
    id: 'tree-plains',
    name: 'Tree Plains',
    image: require('../../assets/images/tree_plains.jpg'),
  },
];
