# Codebase Overview

## Purpose

HigherSelf is a mobile-first affirmation app. The user experience is built around a visually rich home feed of affirmations, personal saving/organizing tools, and a set of supporting flows like streak tracking, mood prompts, and recorded affirmations.

## Top-Level Structure

### `app/`

This is the routing layer. Because the app uses Expo Router, every file in `app/` is a route or layout.

- `app/_layout.tsx`: Root app shell. Composes providers and defines the main stack.
- `app/(tabs)/`: Primary tab routes. The current app behavior is mostly driven by `index.tsx`.
- `app/modals/`: Overlay screens such as profile, library, themes, mood, practice, recording, and streak.
- `app/modals/widgets.tsx`: Widget configuration sheet with home, topics, theme, and refresh detail views.
- `app/my-content/`: The personal content hub for favorites, collections, user-created affirmations, and recordings.

### `components/`

Reusable UI pieces. These range from simple cards and buttons to larger workflow components like:

- `AffirmationsCard.tsx`
- `SavedAffirmationCard.tsx`
- `CollectionPickerAlert.tsx`
- `CustomChooseAffirmationAlert.tsx`
- `UserStreak.tsx`
- `AffirmationShareCard.tsx`

### `context/`

App-wide state containers using React Context and hooks. Most contexts load and persist their data with AsyncStorage.

- `SavedAffirmationContext.tsx`
- `AffirmationCollectionsContext.tsx`
- `CustomAffirmationsContext.tsx`
- `StreakContext.tsx`
- `ThemeContextProvider.tsx`
- `WidgetsContext.tsx`

### `data/`

Static or semi-static app data.

- `affirmation.ts`: Seed affirmations shown on the home screen.
- `themes.ts`: Available background themes.
- `widgetTopics.ts`: Legacy widget topic definitions and fallback affirmation source resolution.
- `HigherSelf_StorageKeys.ts`: Shared storage key registry.

### `hooks/`

Shared logic that does not belong in a single component.

- `use-affirmation-share.tsx`: Builds and shares a themed affirmation card image.
- `use-color-scheme.ts`: Light/dark preference helper for navigation theme setup.
- `use-theme-color.ts`: Shared color helper.

### `types/`

TypeScript models for the app’s main data objects:

- affirmations
- collections
- recordings
- widget configurations

## App Entry Flow

The main app entry is `app/_layout.tsx`.

It does three jobs:

1. Sets up the app-wide navigation theme.
2. Wraps the app in all required providers.
3. Declares the main stack routes and modal presentation styles.

Provider order matters here because screen components depend on these contexts being available everywhere in the tree.

## User Experience Model

The app is organized around a few key user journeys:

1. Browse affirmations on the home screen.
2. Save affirmations to favorites.
3. Move saved affirmations into collections.
4. Create custom affirmations.
5. Build a practice queue and record affirmations.
6. Review recordings later.
7. Track consistency with a streak UI.
8. Share affirmations as themed cards.
9. Configure home-screen widgets and connect them to a user collection.

## Design Pattern Used Across The App

A common pattern appears throughout the codebase:

- a route screen owns the page-level layout and navigation
- a context owns durable user data
- a reusable component renders repeated UI
- AsyncStorage persists state between launches

The widget flow follows the same pattern:

- `WidgetsContext` owns persisted widget state
- `AffirmationCollectionsContext` owns the collection contents
- widget configs reference collections by id instead of copying affirmations
- widget preview helpers resolve the final content pool when rendering

This keeps screens fairly lean and pushes data logic into dedicated providers.

## Important Technical Characteristics

- The app is stateful but mostly local-first.
- There is no backend in the current codebase.
- Persistence is handled on-device through AsyncStorage and local file storage.
- Audio recordings are stored in the app’s document directory.
- The app favors modal and bottom-sheet-like experiences for secondary flows.
