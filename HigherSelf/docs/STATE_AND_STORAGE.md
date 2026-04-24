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
