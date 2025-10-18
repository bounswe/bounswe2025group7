# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Unit testing

This app uses Jest (with `jest-expo`) and React Native Testing Library.

- Where tests live: `__test__/` (snapshots live in `__test__/__snapshots__/`).
- Aliases: `@/` maps to the project root (see `jest.config.js`).

Run tests:

```bash
npm test                 # run once
npm run test:watch       # watch mode
npm run test:ci          # CI-friendly + coverage

# target a single file or test name
npm test -- __test__/signIn.screen.test.tsx
npm test -- -t "registers successfully"

# update saved snapshots (e.g., FeedCard)
npm test -- -u
```

What’s covered (examples):
- Utils: storage read/write/remove/clear (AsyncStorage mocked)
- Services: auth, feed, recipe, interest form, semantic search
- HTTP: `apiClient` request interceptor adds Authorization header
- Components: `FeedCard` (includes 2 snapshots)
- Screens: sign-in, sign-up, recipe detail, profile (auth redirect)

Common mocks and tips:
- Preconfigured in `jest.setup.ts`: Reanimated, Gesture Handler, AsyncStorage, expo-router.
- Screen tests also mock: safe area (`react-native-safe-area-context`), `@expo/vector-icons`, DateTimePicker, `expo-image-picker` where needed.
- If you see ESM/transform errors from Expo/RN libs, check `transformIgnorePatterns` in `jest.config.js` and keep `jest-expo` as the preset.
- If you see “No safe area value available”, mock `react-native-safe-area-context` in your test.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
