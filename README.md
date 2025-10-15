# Hydrate - Water Tracker

A React Native water tracking app built with Expo, featuring daily goals, streak tracking, and detailed history analytics.

## Features

- 💧 Track daily water intake
- 🎯 Customizable daily goals
- 🔥 Streak tracking
- 📊 Detailed analytics (7D, 30D, 1Y, YTD)
- ⚙️ Unit conversion (ml/fl oz)
- 🚀 Quick add buttons (customizable)

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npx expo start
   ```

3. Run on iOS

   ```bash
   npx expo run:ios
   ```

4. Run on Android

   ```bash
   npx expo run:android
   ```

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Building for Production (Local Builds)

This project uses local builds instead of EAS Build for faster iteration and cost savings.

### iOS Release Build

1. **Update build number** in `app.json`:

   ```json
   {
     "expo": {
       "version": "1.0.0",
       "buildNumber": "9"  // Increment this for each release
     }
   }
   ```

2. **Prebuild the iOS project**:

   ```bash
   npx expo prebuild --platform ios --clean
   ```

3. **Open Xcode**:

   ```bash
   open ios/Hydr8.xcworkspace
   ```

   **Important**: Always open the `.xcworkspace` file, not the `.xcodeproj` file.

4. **Configure signing in Xcode**:
   - Select the "Hydr8" project in the left sidebar
   - Select the "Hydr8" target
   - Go to the "Signing & Capabilities" tab
   - Check "Automatically manage signing"
   - Select your development team from the dropdown

   TODO: Need to find a way to not manually select your team each time.

5. **Archive**:
   - At the top of Xcode, select "Any iOS Device (arm64)" as the destination
   - Go to **Product → Archive**
   - Wait for the archive to complete (Xcode automatically uses Release configuration)

6. **Upload to TestFlight**:
   - The Organizer window will open automatically after archiving
   - Click **Distribute App**
   - Select **App Store Connect**
   - Follow the prompts to upload

7. **Process in App Store Connect**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Wait 10-30 minutes for processing
   - Add build to TestFlight for testing

### Android Release Build

1. **Update version code** in `app.json`:

   ```json
   {
     "expo": {
       "version": "1.0.0",
       "android": {
         "versionCode": 9  // Increment this for each release
       }
     }
   }
   ```

2. **Prebuild the Android project**:

   ```bash
   npx expo prebuild --platform android --clean
   ```

3. **Add release signing configuration**:

   You can probably just revert these changes in git and then re-update the build number. TODO: Need to find a way to improve this flow.

   **Important**: Prebuild overwrites `android/app/build.gradle`, so you need to manually add the signing config after each prebuild.

   Edit `android/app/build.gradle` and add the following:

   a. Add the release signing config inside the `signingConfigs` block (around line 98):

   ```gradle
   signingConfigs {
       debug {
           storeFile file('debug.keystore')
           storePassword 'android'
           keyAlias 'androiddebugkey'
           keyPassword 'android'
       }
       release {
           storeFile file('../../@corymchambers1__hydrate.jks')
           storePassword 'YOUR_STORE_PASSWORD'
           keyAlias 'YOUR_KEY_ALIAS'
           keyPassword 'YOUR_KEY_PASSWORD'
       }
   }
   ```

   b. Update the release buildType to use the release signing config (around line 117):

   ```gradle
   release {
       signingConfig signingConfigs.release  // Change from signingConfigs.debug
       shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false)
       minifyEnabled enableProguardInReleaseBuilds
       proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
       crunchPngs (findProperty('android.enablePngCrunchInReleaseBuilds')?.toBoolean() ?: true)
   }
   ```

4. **Build the release bundle**:

   ```bash
   cd android
   ./gradlew bundleRelease
   ```

   This creates an `.aab` file at: `android/app/build/outputs/bundle/release/app-release.aab`

5. **Upload to Google Play Console**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Select your app → **Testing → Internal testing** (or Production)
   - Click **Create new release**
   - Upload the `.aab` file
   - Add release notes and publish

### First Time Setup (Android)

If this is your first time building for Android, you'll need to set up signing:

1. **Your keystore file** should be at the project root: `@corymchambers1__hydrate.jks`
2. **Important**: Never commit the keystore file or passwords to git
3. **Backup the keystore file** - you can't update your app without it

### Important Notes

- **Build numbers** must always increase for each upload
  - iOS uses `buildNumber` in `app.json`
  - Android uses `versionCode` in `app.json` (under `android`)
- **iOS and Android** can have different build numbers
- **Keystore backups** are critical - you can't update your Android app without the original keystore
- **After each prebuild**, you must manually re-add the Android signing configuration to `build.gradle`
- **Xcode signing**: You must select your development team in Xcode before archiving

## Tech Stack

- **Framework**: React Native with Expo
- **Router**: expo-router (file-based routing)
- **Database**: expo-sqlite
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind for React Native)

## Project Structure

```
app/
  ├── (tabs)/          # Tab navigation screens
  │   ├── index.tsx    # Home screen
  │   ├── history.tsx  # History screen
  │   └── settings.tsx # Settings screen
  ├── _layout.tsx      # Root layout
components/
  ├── WaterDrop.tsx
  └── WaterGoalAnimation.tsx
src/
  ├── state/
  │   └── settingsStore.ts  # Zustand store
  └── utils/
      └── conversions.ts    # Unit conversion utilities
```
