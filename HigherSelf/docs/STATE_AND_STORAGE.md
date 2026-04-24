# State And Storage

## Shared Types

### `Affirmation`

Defined in `types/affirmations.ts`.

Fields:

- `id: string`
- `text: string`
- `category: AffirmationCategory | string`
- `createdAt?: string`
- `savedAt?: string`

### `AffirmationCollection`

Defined in `types/collections.ts`.

Fields:

- `id: string`
- `name: string`
- `affirmations: Affirmation[]`
- `createdAt: string`

### `VoiceRecordingEntry`

Defined in `types/recordings.ts`.

Fields:

- `id: string`
- `uri: string`
- `fileName: string`
- `durationMillis: number`
- `createdAt: string`
- `affirmations: Affirmation[]`

### `WidgetConfiguration`

Defined in `context/WidgetsContext.tsx`.

Fields:

- `id: string`
- `name: string`
- `enabled: boolean`
- `themeId: string`
- `showBorder: boolean`
- `refreshFrequency: 'daily' | 'frequently' | 'hourly' | 'occasionally'`
- `topicIds: WidgetTopicId[]`
- `collectionIds: string[]`

Notes:

- `collectionIds` is the current widget-specific content source for the Topics flow.
- The widget stores collection ids, not copied affirmations.
- `topicIds` is still kept for compatibility and fallback.
- If a widget has no selected collections, or its selected collections resolve to no affirmations, preview generation falls back to the `general` topic pool.

## AsyncStorage Keys

Defined in `data/HigherSelf_StorageKeys.ts`.

- `saved_affirmations`
- `affirmation_collections`
- `custom_affirmations`
- `selected_theme`
- `daily_mood_selections`
- `practice_affirmation_queue`
- `practice_affirmation_prompt_date`
- `voice_recordings`
- `user_streak`
- `widget_configurations`

## Context Providers

### `SavedAffirmationsProvider`

File: `context/SavedAffirmationContext.tsx`

Responsibilities:

- load saved affirmations from AsyncStorage
- expose `savedAffirmations`
- expose `isSaved(id)`
- expose `toggleSaved(affirmation)`
- persist changes automatically

### `AffirmationCollectionsProvider`

File: `context/AffirmationCollectionsContext.tsx`

Responsibilities:

- load collections from AsyncStorage
- create new collections
- add or remove affirmations from collections
- delete collections
- look up collections by id
- report whether an affirmation exists in a collection

### `CustomAffirmationsProvider`

File: `context/CustomAffirmationsContext.tsx`

Responsibilities:

- load custom affirmations from AsyncStorage
- normalize older or inconsistent stored data shapes
- add new custom affirmations
- delete custom affirmations
- persist changes automatically

This provider is slightly defensive compared with the others because it accepts older storage formats and converts them into the current `Affirmation` shape.

### `StreakProvider`

File: `context/StreakContext.tsx`

Responsibilities:

- load and normalize streak state
- reconcile streaks based on the local date
- build a weekly day model for UI
- refresh when the app comes back to the foreground
- toggle streak tracking

### `ThemeContextProvider`

File: `context/ThemeContextProvider.tsx`

Responsibilities:

- track the selected theme id
- expose the currently selected theme object
- preload theme images for smoother rendering
- persist the selected theme id to AsyncStorage

### `WidgetsProvider`

File: `context/WidgetsContext.tsx`

Responsibilities:

- load widget configurations from AsyncStorage
- normalize legacy widget shapes on read
- track the active widget id
- create and delete widget configurations
- update widget settings such as theme, refresh rate, border, enabled state, and selected collection ids
- persist widget configurations automatically

## Local File Storage

Recorded audio files are saved into the app document directory instead of AsyncStorage.

The recording flow:

1. records audio
2. creates a file in the `recordings` directory
3. stores only the metadata in AsyncStorage

This split is important because binary audio files should not be stored directly in AsyncStorage.

## Data Flow Examples

### Saving An Affirmation

1. User taps the heart on a card.
2. `toggleSaved` runs in `SavedAffirmationContext`.
3. React state updates immediately.
4. The persistence effect writes the updated array to AsyncStorage.

### Adding An Affirmation To A Collection

1. User opens `CollectionPickerAlert`.
2. Screen calls `toggleAffirmationInCollection`.
3. `AffirmationCollectionsContext` updates the matching collection.
4. The persistence effect writes updated collections to AsyncStorage.

### Sharing An Affirmation

1. Screen calls `shareAffirmation` from `use-affirmation-share.tsx`.
2. The hook renders `AffirmationShareCard` off-screen.
3. The hook ensures the selected theme asset is loaded.
4. The card uses the currently selected theme.
5. The card is captured as an image and handed to the native share sheet.

### Selecting A Widget Collection

1. User taps `Topics` from the widget settings sheet.
2. The widgets modal opens the widget topics detail screen.
3. `WidgetTopicsPanel` reads collections from `AffirmationCollectionsContext`.
4. The user selects a collection.
5. `WidgetsContext` updates the active widget with `collectionIds: [selectedCollectionId]`.
6. The persistence effect writes the updated widget configurations to AsyncStorage.

### Resolving A Widget Preview Affirmation

1. `WidgetHomeContent` asks `getPreviewAffirmation` for the active widget preview text.
2. The helper checks `collectionIds` on the widget configuration.
3. If matching collections exist and contain affirmations, their affirmations become the source pool.
4. Otherwise the helper falls back to the existing `topicIds` source, currently `general`.
5. A seeded selection based on `refreshFrequency` chooses the displayed affirmation.
