import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

type HeartButtonProps = {
  saved: boolean;
  onPress: () => void;
  size?: 'default' | 'compact';
  variant?: 'default' | 'ghost';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HeartButton({
  saved,
  onPress,
  size = 'default',
  variant = 'default',
}: HeartButtonProps) {
  const scale = useSharedValue(saved ? 1 : 0.95);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(saved ? 1 : 0);

  useEffect(() => {
    rotate.value = withTiming(saved ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });

    scale.value = withSpring(saved ? 1.08 : 1, {
      damping: 10,
      stiffness: 220,
    });
  }, [rotate, saved, scale]);

  const handlePress = () => {
    translateY.value = withSequence(
      withTiming(-10, { duration: 120 }),
      withSpring(0, { damping: 8, stiffness: 240 })
    );

    scale.value = withSequence(
      withTiming(1.22, { duration: 120 }),
      withSpring(saved ? 1 : 1.08, { damping: 9, stiffness: 240 })
    );

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = `${interpolate(rotate.value, [0, 1], [0, 180])}deg`;

    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateY: rotation },
      ],
    };
  });

  return (
    <AnimatedPressable
      accessibilityLabel={saved ? 'Unsave affirmation' : 'Save affirmation'}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        size === 'compact' && styles.buttonCompact,
        variant === 'ghost' && styles.buttonGhost,
        pressed && styles.buttonPressed,
      ]}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={saved ? 'heart' : 'heart-outline'}
          size={size === 'compact' ? 18 : 26}
          color={saved ? '#EF4444' : '#FFFFFF'}
        />
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 62,
    width: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 34, 79, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.26)',
    shadowColor: '#120C24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonCompact: {
    height: 34,
    width: 34,
    borderRadius: 17,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});
