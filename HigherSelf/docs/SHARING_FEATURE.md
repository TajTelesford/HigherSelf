# Affirmation Sharing

## Purpose

The affirmation sharing feature lets the user export an affirmation as a themed image and send it through the native share sheet.

The shared output is designed to stay visually aligned with the app experience by using the same theme the user selected on the themes screen.

## Where It Is Used

The share flow is available from:

- the home screen affirmation cards
- favorites
- collection detail items
- user-created affirmation cards

Main route files involved:

- `app/(tabs)/index.tsx`
- `app/my-content/favorites.tsx`
- `app/my-content/collection-detail.tsx`
- `app/my-content/my-own-affirmations.tsx`

## Main Files

- `hooks/use-affirmation-share.tsx`
- `components/AffirmationShareCard.tsx`
- `context/ThemeContextProvider.tsx`
- `data/themes.ts`

## How It Works

### 1. A Screen Calls The Share Hook

Each screen that supports sharing calls `useAffirmationShare()` and gets back:

- `shareAffirmation`
- `shareCardPortal`

`shareAffirmation` starts the share flow for a specific affirmation.

`shareCardPortal` renders an off-screen copy of the share card so it can be captured without affecting the visible UI.

### 2. The Hook Uses The Active Theme

The hook reads `selectedTheme` from `ThemeContextProvider`.

That means the generated share image uses the same theme the user most recently selected in the themes screen.

### 3. The Theme Asset Is Loaded Before Capture

The hook explicitly waits for the selected theme image asset to load before trying to capture the share card.

This matters because the share flow can otherwise race the initial image decode, which can lead to a fallback or default-looking background on the first share attempt.

### 4. The Share Card Is Captured Off-Screen

`AffirmationShareCard.tsx` renders the visual card.

The hook mounts that component off-screen and then uses `react-native-view-shot` to capture it into an image file.

### 5. The Native Share Sheet Opens

After capture completes, the hook uses `expo-sharing` to open the device share sheet with the generated image.

If native sharing is not available, the hook falls back to sharing plain text with React Native `Share`.

## Theme And Asset Behavior

The current implementation uses optimized theme image assets from:

- `assets/images/optimized/`

This helps reduce load time and avoids unnecessary decoding cost from very large original images.

The selected theme is also persisted through `ThemeContextProvider`, so the share feature remains aligned with the theme screen even after app reloads.

## Current Output Strategy

The share image is currently captured as a PNG.

Important details:

- the exported canvas is smaller than the original implementation to reduce file size
- the outer canvas is transparent
- the actual themed card is inset inside that transparent canvas

This preserves transparent edges while still keeping the themed card visually rich.

## Data Flow Summary

1. User taps a share icon.
2. The screen calls `shareAffirmation({ affirmation, category })`.
3. The hook loads the selected theme asset if needed.
4. The off-screen `AffirmationShareCard` is rendered.
5. The card is captured to an image file.
6. `expo-sharing` opens the native share sheet.

## Known Tradeoffs

- PNG preserves transparency but can become large if the canvas is too big.
- Large theme images can delay the first capture if they are not loaded yet.
- The hook adds a small wait after paint to make the first capture more reliable.

## Future Improvement Ideas

- Add a retry capture path if the first capture appears incomplete.
- Add per-platform output tuning for iOS vs Android.
- Add a branded footer or watermark toggle.
- Add analytics or instrumentation around share attempts and failures.
