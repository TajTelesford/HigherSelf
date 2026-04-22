import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type RecoridngHomesScreeButtonProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function RecoridngHomesScreeButton({
  label,
  onPress,
  style,
}: RecoridngHomesScreeButtonProps) {
  return (
    <View pointerEvents="box-none" style={style}>
      <Pressable
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <View style={styles.surface}>
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            intensity={40}
            tint="dark"
            style={styles.blurFill}
          />

          <View style={styles.content}>
            <MaterialCommunityIcons
              name="meditation"
              size={34}
              color="#F5F7FA"
              style={styles.icon}
            />

            <Text style={styles.label}>{label}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 72,
    borderRadius: 36,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
  },
  surface: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: 'rgba(86, 93, 103, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
  },
  content: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  icon: {
    opacity: 0.98,
  },
  label: {
    marginLeft: 10,
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
