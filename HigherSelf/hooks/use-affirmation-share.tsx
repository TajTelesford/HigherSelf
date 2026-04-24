import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useThemeSelection } from '../context/ThemeContextProvider';

import { AffirmationShareCard } from '../components/AffirmationShareCard';

type SharePayload = {
  affirmation: string;
  category?: string;
};

type PendingShare = SharePayload & {
  resolve: () => void;
  reject: (error: Error) => void;
};

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });

export function useAffirmationShare() {
  const { selectedTheme } = useThemeSelection();
  const selectedThemeImage = selectedTheme.image;
  const shareCardRef = useRef<View | null>(null);
  const [pendingShare, setPendingShare] = useState<PendingShare | null>(null);

  const shareAffirmation = useCallback(
    ({ affirmation, category }: SharePayload) =>
      new Promise<void>((resolve, reject) => {
        setPendingShare({ affirmation, category, resolve, reject });
      }),
    []
  );

  useEffect(() => {
    if (!pendingShare || !shareCardRef.current) {
      return;
    }

    let isCancelled = false;

    const runShare = async () => {
      try {
        await Asset.loadAsync([selectedThemeImage]);
        await waitForPaint();
        await wait(120);

        const imageUri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 0.8,
          result: 'tmpfile',
        });

        const sharingAvailable = await Sharing.isAvailableAsync();

        if (sharingAvailable) {
          await Sharing.shareAsync(imageUri, {
            dialogTitle: 'Share affirmation',
            mimeType: 'image/png',
            UTI: 'public.png',
          });
        } else {
          await Share.share({
            message: pendingShare.affirmation,
          });
        }

        if (!isCancelled) {
          pendingShare.resolve();
        }
      } catch (error) {
        const shareError =
          error instanceof Error ? error : new Error('Unable to share affirmation.');
        const shareCancelled = /cancel/i.test(shareError.message);

        if (!isCancelled && !shareCancelled) {
          pendingShare.reject(shareError);
          Alert.alert(
            'Share unavailable',
            'We could not generate your affirmation card right now.'
          );
        } else if (!isCancelled) {
          pendingShare.resolve();
        }
      } finally {
        if (!isCancelled) {
          setPendingShare(null);
        }
      }
    };

    runShare();

    return () => {
      isCancelled = true;
    };
  }, [pendingShare, selectedThemeImage]);

  const shareCardPortal = useMemo(
    () => (
      <View pointerEvents="none" style={styles.captureHost}>
        {pendingShare ? (
          <View collapsable={false} ref={shareCardRef} style={styles.captureCard}>
            <AffirmationShareCard
              affirmation={pendingShare.affirmation}
              category={pendingShare.category}
              theme={selectedTheme}
            />
          </View>
        ) : null}
      </View>
    ),
    [pendingShare, selectedTheme]
  );

  return {
    shareAffirmation,
    shareCardPortal,
  };
}

const styles = StyleSheet.create({
  captureHost: {
    position: 'absolute',
    left: -2000,
    top: 0,
    opacity: 1,
  },
  captureCard: {
    width: 480,
    height: 854,
    backgroundColor: 'transparent',
  },
});

export default useAffirmationShare;
