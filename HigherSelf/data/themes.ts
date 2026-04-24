export type ThemeItem = {
  id: string;
  name: string;
  image: number;
};

export const THEMES: ThemeItem[] = [
  {
    id: 'beach-canyon',
    name: 'Beach Canyon',
    image: require('../assets/images/optimized/beach_canyon.jpg'),
  },
  {
    id: 'city-speedy-lights',
    name: 'City Speedy Lights',
    image: require('../assets/images/optimized/city_speedy_lights.jpg'),
  },
  {
    id: 'tree-plains',
    name: 'Tree Plains',
    image: require('../assets/images/optimized/tree_plains.jpg'),
  },
];
