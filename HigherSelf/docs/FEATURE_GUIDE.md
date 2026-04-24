# Feature Guide

## Home Screen

File: `app/(tabs)/index.tsx`

The home screen displays a vertically paged feed of affirmations using a `FlatList`. Each card is rendered by `components/AffirmationsCard.tsx`.

Main behaviors:

- reads the selected theme from `ThemeContextProvider`
- renders the theme image full-screen in the background
- displays seed affirmations from `data/affirmation.ts`
- allows saving affirmations
- allows sharing affirmations through the themed share flow
- shows floating action buttons for secondary navigation

## Favorites

File: `app/my-content/favorites.tsx`

This screen shows affirmations the user has saved.

Main behaviors:

- reads saved affirmations from `SavedAffirmationContext`
- checks collection membership from `AffirmationCollectionsContext`
- allows opening `CollectionPickerAlert` to add or remove an affirmation from collections
- allows sharing saved affirmations

## Collections

Files:

- `app/my-content/collections.tsx`
- `app/my-content/collection-detail.tsx`

This feature lets the user organize affirmations into folders.

Main behaviors:

- create collections through `CustomNameCollectionAlert`
- open a collection detail screen
- add or remove affirmations from a collection
- delete a collection
- share affirmations from inside a collection

## Custom Affirmations

File: `app/my-content/my-own-affirmations.tsx`

This screen manages user-created affirmations.

Main behaviors:

- create a new affirmation in a modal composer
- search and sort created affirmations
- add custom affirmations to collections
- reuse the same card presentation pattern as saved affirmations

Important note:

Custom affirmations are persisted separately from saved affirmations, but they still use the shared `Affirmation` type.

## Recording Affirmations

Files:

- `app/modals/practiceAffirmations.tsx`
- `app/modals/recordAffirmations.tsx`
- `app/my-content/recorded-affirmations.tsx`

This is the app’s guided recording workflow.

Typical flow:

1. Build a queue of affirmations to practice.
2. Start a recording session.
3. Swipe through queued affirmations while recording.
4. Save the resulting audio file locally.
5. Review the finished recordings in the recorded affirmations screen.

Key related components:

- `CustomChooseAffirmationAlert.tsx`
- `RecordMicrophoneButton.tsx`
- `RecordedAffirmationCard.tsx`

## Profile And Library

Files:

- `app/modals/profile.tsx`
- `app/modals/library.tsx`

These screens act as navigation hubs.

Profile includes:

- streak summary
- customization shortcuts
- upsell-style unlock messaging
- links into library or future features

Library includes:

- content hub entry points
- cards that route into favorites, collections, custom affirmations, and recordings

## Themes

File: `app/modals/themes.tsx`

This screen lets the user select a background theme for the home experience.

Main behaviors:

- shows a grid of image themes
- updates `selectedThemeId` in `ThemeContextProvider`
- changes the visual background on the home screen
- affects the background used in the share card flow

## Streak

Files:

- `context/StreakContext.tsx`
- `components/UserStreak.tsx`
- `app/modals/streak.tsx`

This feature tracks daily engagement through local date-based logic.

Main behaviors:

- automatically reconciles streak state when the app loads
- refreshes when the app returns to the foreground
- exposes a weekly list of day states for UI rendering
- supports toggling streak tracking on and off

## Mood

Files:

- `app/modals/mood.tsx`
- `components/MoodPicker.tsx`
- `components/TodaysMood.tsx`
- `components/MoodCalendar.tsx`

The mood feature appears to support daily mood input and calendar-style display. It fits into the broader self-reflection aspect of the app, although it is less central than affirmations, collections, and recording.

## Reusable UI Building Blocks

Common reusable pieces include:

- `SavedAffirmationCard.tsx`
- `AffirmationsCard.tsx`
- `HeartButton.tsx`
- `CollectionFolderCard.tsx`
- `FloatingActionButtons.tsx`
- `ProfileCardTile.tsx`
- `MyContentCardDisplay.tsx`

These components make the screen files easier to read and help keep styling consistent.
