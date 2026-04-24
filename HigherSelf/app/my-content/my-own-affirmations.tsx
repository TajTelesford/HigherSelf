import { CollectionPickerAlert } from '@/components/CollectionPickerAlert';
import { SavedAffirmationCard } from '@/components/SavedAffirmationCard';
import { Text } from '@/components/ui/text';
import { useAffirmationCollections } from '@/context/AffirmationCollectionsContext';
import { useCustomAffirmations } from '@/context/CustomAffirmationsContext';
import { useSavedAffirmations } from '@/context/SavedAffirmationContext';
import { useAffirmationShare } from '@/hooks/use-affirmation-share';
import type { Affirmation } from '@/types/affirmations';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SortOrder = 'newest' | 'oldest';

export default function MyOwnAffirmationsScreen() {
  const { collections, isAffirmationInCollection, toggleAffirmationInCollection } =
    useAffirmationCollections();
  const { addCustomAffirmation, customAffirmations, loading } = useCustomAffirmations();
  const { loading: savedLoading } = useSavedAffirmations();
  const { shareAffirmation, shareCardPortal } = useAffirmationShare();
  const [draftText, setDraftText] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAffirmation, setSelectedAffirmation] = useState<Affirmation | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const bookmarkedAffirmationIds = useMemo(
    () =>
      new Set(
        collections.flatMap((collection) =>
          collection.affirmations.map((affirmation) => affirmation.id)
        )
      ),
    [collections]
  );

  const visibleAffirmations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredAffirmations = normalizedQuery
      ? customAffirmations.filter((affirmation) =>
          affirmation.text.toLowerCase().includes(normalizedQuery)
        )
      : customAffirmations;

    return [...filteredAffirmations].sort((left, right) => {
      const leftTime = new Date(left.createdAt ?? 0).getTime();
      const rightTime = new Date(right.createdAt ?? 0).getTime();

      return sortOrder === 'newest' ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [customAffirmations, searchQuery, sortOrder]);

  const closeComposer = () => {
    setDraftText('');
    setIsComposerOpen(false);
  };

  const handleSaveAffirmation = () => {
    const trimmedText = draftText.trim();

    if (!trimmedText) {
      Alert.alert('Add an affirmation', 'Write your affirmation before saving it.');
      return;
    }

    addCustomAffirmation(trimmedText);
    closeComposer();
  };

  const renderContent = () => {
    if (loading || savedLoading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator color="#F5F7FA" />
        </View>
      );
    }

    if (!customAffirmations.length) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons color="#F4C95D" name="create-outline" size={46} />
          </View>

          <Text style={styles.emptyTitle}>You haven&apos;t added any affirmations yet</Text>
          <Text style={styles.emptyCopy}>
            Create a private affirmation for yourself and it will appear here and in
            your practice queue.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        contentContainerStyle={styles.listContent}
        data={visibleAffirmations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedAffirmationCard
            affirmation={item}
            bookmarked={bookmarkedAffirmationIds.has(item.id)}
            onBookmarkPress={() => setSelectedAffirmation(item)}
            onSharePress={() =>
              shareAffirmation({
                affirmation: item.text,
                category: item.category,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.filteredEmptyState}>
            <Text style={styles.filteredEmptyTitle}>No matching affirmations</Text>
            <Text style={styles.filteredEmptyCopy}>
              Try a different search term or create a new affirmation below.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <Ionicons color="#F5F7FA" name="chevron-back" size={30} />
            </Pressable>

            <Text numberOfLines={1} style={styles.title}>
              Your Own Affirmations
            </Text>
          </View>

          <Pressable
            accessibilityLabel={
              sortOrder === 'newest' ? 'Sort by oldest first' : 'Sort by newest first'
            }
            accessibilityRole="button"
            onPress={() =>
              setSortOrder((currentOrder) =>
                currentOrder === 'newest' ? 'oldest' : 'newest'
              )
            }
            style={styles.sortPill}
          >
            <Ionicons color="#F5F7FA" name="swap-vertical" size={18} />
            <Text style={styles.sortPillText}>
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.content}>{renderContent()}</View>

        <View style={styles.footer}>
          <Pressable onPress={() => setIsComposerOpen(true)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Add affirmation</Text>
          </Pressable>

          {customAffirmations.length ? (
            <View style={styles.searchShell}>
              <Ionicons color="rgba(245,247,250,0.72)" name="search" size={22} />
              <TextInput
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor="rgba(245,247,250,0.5)"
                style={styles.searchInput}
                value={searchQuery}
              />
            </View>
          ) : null}
        </View>
      </SafeAreaView>

      <Modal
        animationType="slide"
        onRequestClose={closeComposer}
        presentationStyle="overFullScreen"
        transparent
        visible={isComposerOpen}
      >
        <View style={styles.composerBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.composerKeyboardArea}
          >
            <SafeAreaView edges={['bottom']} style={styles.composerSheet}>
              <View style={styles.composerHeader}>
                <Pressable
                  accessibilityLabel="Close add affirmation"
                  accessibilityRole="button"
                  onPress={closeComposer}
                  style={styles.iconButton}
                >
                  <Ionicons color="#F5F7FA" name="chevron-back" size={30} />
                </Pressable>

                <Text style={styles.composerTitle}>Add An Affirmation</Text>
                <View style={styles.headerSpacer} />
              </View>

              <Text style={styles.composerCopy}>
                Add your own affirmation. It will only be visible to you.
              </Text>

              <TextInput
                autoCapitalize="sentences"
                autoFocus
                multiline
                onChangeText={setDraftText}
                placeholder="Affirmation"
                placeholderTextColor="rgba(245,247,250,0.5)"
                style={styles.composerInput}
                textAlignVertical="top"
                value={draftText}
              />

              <Pressable onPress={handleSaveAffirmation} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </Pressable>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <CollectionPickerAlert
        affirmation={selectedAffirmation}
        collections={collections}
        isAffirmationInCollection={isAffirmationInCollection}
        isVisible={selectedAffirmation !== null}
        onClose={() => setSelectedAffirmation(null)}
        onToggleCollection={(collectionId, affirmation) =>
          toggleAffirmationInCollection(collectionId, affirmation)
        }
      />
      {shareCardPortal}
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
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#9CA3AF',
    opacity: 0.55,
    marginBottom: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 8,
  },
  headerSpacer: {
    width: 38,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
  },
  sortPill: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sortPillText: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 28,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  emptyIconWrap: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244,201,93,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,201,93,0.18)',
    marginBottom: 28,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 34,
    lineHeight: 42,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptyCopy: {
    color: 'rgba(245,247,250,0.72)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 310,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 14,
  },
  filteredEmptyState: {
    paddingTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  filteredEmptyTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  filteredEmptyCopy: {
    color: 'rgba(245,247,250,0.68)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    gap: 16,
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: 32,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: '#121826',
    fontSize: 17,
    fontWeight: '800',
  },
  searchShell: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 18,
    paddingVertical: 0,
  },
  composerBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3, 7, 18, 0.62)',
  },
  composerKeyboardArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  composerSheet: {
    minHeight: '72%',
    backgroundColor: '#121826',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  composerTitle: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
  },
  composerCopy: {
    color: '#F5F7FA',
    fontSize: 18,
    lineHeight: 28,
    marginTop: 28,
    marginBottom: 18,
  },
  composerInput: {
    minHeight: 140,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    color: '#F5F7FA',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
  },
});
