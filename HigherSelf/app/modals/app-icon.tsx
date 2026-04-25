import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { STORAGE_KEYS } from '../../data/HigherSelf_StorageKeys';
import { APP_ICON_OPTIONS, DEFAULT_APP_ICON_ID } from '../../data/appIcons';

type DynamicAppIconModule = {
  getAppIcon(): string;
  setAppIcon(icon: string): string;
};

function getDynamicAppIconModule(): DynamicAppIconModule | null {
  if (Constants.executionEnvironment === 'storeClient') {
    return null;
  }

  try {
    return requireOptionalNativeModule<DynamicAppIconModule>('ExpoDynamicAppIcon');
  } catch {
    return null;
  }
}

export default function AppIconScreen() {
  const { width } = useWindowDimensions();
  const [selectedIconId, setSelectedIconId] = useState(DEFAULT_APP_ICON_ID);
  const iconSize = Math.min(112, Math.max(84, (width - 92) / 3));

  useEffect(() => {
    let isMounted = true;

    const loadSelection = async () => {
      try {
        const dynamicAppIconModule = getDynamicAppIconModule();
        const currentIconName = dynamicAppIconModule?.getAppIcon();
        const storedIconId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_APP_ICON);
        const nextSelectedIconId =
          currentIconName && currentIconName !== 'Default'
            ? currentIconName
            : storedIconId || DEFAULT_APP_ICON_ID;

        if (isMounted) {
          setSelectedIconId(nextSelectedIconId);
        }
      } catch {
        if (isMounted) {
          setSelectedIconId(DEFAULT_APP_ICON_ID);
        }
      }
    };

    loadSelection();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectIcon = async (iconId: string) => {
    const dynamicAppIconModule = getDynamicAppIconModule();

    if (!dynamicAppIconModule) {
      Alert.alert(
        'App icon unavailable',
        'Build the app on a device or simulator to test icon switching. Expo Go cannot change the home screen icon.'
      );
      return;
    }

    try {
      const result = dynamicAppIconModule.setAppIcon(iconId);

      if (typeof result === 'string' && result.startsWith('Error:')) {
        Alert.alert('App icon unavailable', result.replace('Error: ', ''));
        return;
      }

      setSelectedIconId(iconId);
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_APP_ICON, iconId);
    } catch {
      Alert.alert(
        'App icon unavailable',
        'Build the app on a device or simulator to test icon switching. Expo Go cannot change the home screen icon.'
      );
    }
  };

  return (
    <View style={styles.backdrop}>
      <Pressable onPress={() => router.back()} style={styles.dismissArea} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>App Icon</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={20} />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.helperText}>
              Choose the icon shown on your phone&apos;s home screen.
            </Text>
            
          </View>

          <View style={styles.grid}>
            {APP_ICON_OPTIONS.map((icon) => {
              const isSelected = icon.id === selectedIconId;

              return (
                <Pressable
                  key={icon.id}
                  accessibilityRole="button"
                  onPress={() => handleSelectIcon(icon.id)}
                  style={[{ width: iconSize }]}
                >
                  <View
                    style={[
                      styles.iconFrame,
                      { width: iconSize, height: iconSize, borderRadius: iconSize * 0.28 },
                      isSelected && styles.iconFrameSelected,
                    ]}
                  >
                    <Image source={icon.preview} style={styles.iconImage} />
                  </View>
                  <Text numberOfLines={2} style={styles.iconLabel}>
                    {icon.label}
                  </Text>
                  <Text style={[styles.iconStatus, isSelected && styles.iconStatusSelected]}>
                    
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    minHeight: '55%',
    height: '90%',
    maxHeight: '90%',
    backgroundColor: '#121826',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#9CA3AF',
    opacity: 0.45,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 44,
  },
  heroCard: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 20,
  },
  helperText: {
    color: '#F5F7FA',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 6,
  },
  subtleText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 2,
  },
  
  
  iconFrame: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#0F1726',
  },
  iconFrameSelected: {
    borderColor: '#8B7CFF',
    shadowColor: '#8B7CFF',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  iconLabel: {
    color: '#F5F7FA',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
  iconStatus: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
  },
  iconStatusSelected: {
    color: '#B9B0FF',
  },
  footnote: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
  },
});
