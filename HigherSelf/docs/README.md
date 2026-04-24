# HigherSelf Docs

This folder contains the project documentation for the HigherSelf mobile app.

## What This App Is

HigherSelf is an Expo + React Native affirmation app built with Expo Router. The app centers around:

- browsing themed affirmations on the home screen
- saving affirmations to favorites
- organizing affirmations into collections
- creating custom affirmations
- recording spoken affirmations
- tracking user streaks
- sharing affirmations as themed cards

## Docs In This Folder

- [Codebase Overview](./CODEBASE_OVERVIEW.md): High-level explanation of the app structure, routing, state, and feature areas.
- [Architecture](./ARCHITECTURE.md): Technical view of how navigation, providers, storage, and shared UI patterns fit together.
- [Feature Guide](./FEATURE_GUIDE.md): Screen-by-screen and workflow-oriented documentation.
- [Affirmation Sharing](./SHARING_FEATURE.md): Detailed documentation for the themed affirmation sharing flow.
- [State And Storage](./STATE_AND_STORAGE.md): Context providers, AsyncStorage keys, and persisted data shapes.

## Quick Orientation

If you are new to the repo, read these in order:

1. `docs/CODEBASE_OVERVIEW.md`
2. `docs/ARCHITECTURE.md`
3. `docs/FEATURE_GUIDE.md`
4. `docs/SHARING_FEATURE.md`
5. `docs/STATE_AND_STORAGE.md`

## Main Source Areas

- `app/`: Route files and screen entry points.
- `components/`: Reusable UI building blocks.
- `context/`: App-wide state providers backed mostly by AsyncStorage.
- `data/`: Seed data and storage key constants.
- `hooks/`: Small reusable behavior hooks such as sharing and theme helpers.
- `types/`: Shared TypeScript models.
- `assets/`: Images and theme primitives.

## Current Stack

- Expo
- React Native
- Expo Router
- TypeScript
- AsyncStorage
- Expo Audio
- Expo Image
- Expo Sharing
- react-native-view-shot
