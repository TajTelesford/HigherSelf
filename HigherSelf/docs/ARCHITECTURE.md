# Architecture

## Routing And Navigation

The app uses Expo Router.

### Root Layout

`app/_layout.tsx` is the central composition point.

It wraps the app with:

- `ThemeContextProvider`
- `StreakProvider`
- `SavedAffirmationsProvider`
- `CustomAffirmationsProvider`
- `AffirmationCollectionsProvider`
- React Navigation `ThemeProvider`

It also defines stack routes for:

- the main tabs
- modal-style screens under `app/modals`
- personal content routes under `app/my-content`

### Tabs

`app/(tabs)/_layout.tsx` configures the tab navigator. The current tab bar is effectively hidden, so the app behaves more like a single-screen experience with supporting modal flows.

## State Architecture

The app uses local React Context providers instead of an external state library.

### Why This Works Here

This app’s data model is relatively small and centered around user-owned local state:

- saved affirmations
- custom affirmations
- collections
- streak data
- selected theme

These are stable, app-wide concerns, so context is a good fit.

### Context Responsibilities

- `ThemeContextProvider`: Tracks the selected background theme and preloads theme images.
- `SavedAffirmationContext`: Stores the user’s saved affirmations.
- `CustomAffirmationsContext`: Stores user-authored affirmations.
- `AffirmationCollectionsContext`: Stores named collections of affirmations.
- `StreakContext`: Tracks day-based streak logic and a weekly streak view model.

## Persistence Model

Most user data is stored in AsyncStorage.

This means:

- data survives app restarts
- the app works offline
- there is no server sync in the current implementation

Audio recordings use a different persistence path:

- files are saved to the app document directory through Expo FileSystem
- metadata is stored in AsyncStorage

## Sharing Architecture

The themed sharing feature is built in layers:

1. `use-affirmation-share.tsx` prepares the share flow.
2. `AffirmationShareCard.tsx` renders the visual share card.
3. `react-native-view-shot` captures the hidden card as an image.
4. `expo-sharing` opens the native share sheet with the generated file.

The selected theme comes from `ThemeContextProvider`, so the shared image matches the user’s current home-screen theme.

The current implementation also explicitly loads the selected theme asset before capture and uses smaller optimized theme files to make the first share attempt more reliable.

## Audio Recording Architecture

The recording flow in `app/modals/recordAffirmations.tsx` is one of the more complex parts of the app.

It combines:

- queued affirmations loaded from AsyncStorage
- permission requests through `expo-audio`
- recorder state from `useAudioRecorder` and `useAudioRecorderState`
- file persistence into the app document directory
- metadata persistence under the voice recordings storage key

This screen is effectively both a workflow coordinator and a UI screen.

## UI Composition Pattern

Most screens follow a consistent structure:

1. route-level container
2. safe area wrapper
3. header controls
4. content body
5. optional modal or alert component

Examples:

- favorites screen uses `SavedAffirmationCard` plus `CollectionPickerAlert`
- collections screen uses `CollectionFolderCard` plus `CustomNameCollectionAlert`
- profile screen composes cards like `UserStreak`, `ProfileCardTile`, and `LibraryContentCard`

## Theme And Visual Architecture

There are two separate theme ideas in the app:

1. React Navigation theme setup for shell colors and navigation visuals
2. the user-selectable affirmation background theme used on the home screen and share cards

The second one is the more user-facing feature theme, defined in `data/themes.ts` and managed by `ThemeContextProvider`.

That same theme value is reused by the affirmation sharing feature, which keeps the shared image visually consistent with the home screen.

## Technical Constraints To Keep In Mind

- There is no remote API layer yet.
- Most business logic is colocated in screens or context providers.
- Some screens are doing both orchestration and presentation, especially recording-related flows.
- Because routing is file-based, changing filenames in `app/` changes route behavior.
