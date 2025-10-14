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

1. **Update version/build number** in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.0",
       "buildNumber": "6"
     }
   }
   ```

2. **Prebuild the iOS project**:
   ```bash
   npx expo prebuild --platform ios --clean
   ```

3. **Open Xcode**:
   ```bash
   open ios/hydrate.xcworkspace
   ```

4. **Archive and Upload**:
   - In Xcode, select "Any iOS Device (arm64)" as the destination
   - Go to **Product → Archive**
   - Once archived, click **Distribute App**
   - Select **App Store Connect**
   - Follow the prompts to upload to TestFlight

5. **Process in App Store Connect**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Wait 10-30 minutes for processing
   - Add build to TestFlight for testing

### Android Release Build

1. **First time only: Generate a signing key**:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore ~/hydrate-upload-key.keystore -alias hydrate-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

   ⚠️ **Important**:
   - Save the passwords you create
   - Backup the keystore file securely
   - You'll need this same keystore for all future releases

2. **Configure signing** (first time only):

   Create `android/keystore.properties` with your keystore info:
   ```properties
   storeFile=/path/to/your/hydrate-upload-key.keystore
   keyAlias=hydrate-key-alias
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   ```

   ⚠️ This file is gitignored and contains sensitive data - never commit it!

3. **Update version/build number** in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.0",
       "buildNumber": "6"
     }
   }
   ```

4. **Prebuild the Android project**:
   ```bash
   npx expo prebuild --platform android --clean
   ```

5. **Build the release bundle**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

   This creates an `.aab` file at: `android/app/build/outputs/bundle/release/app-release.aab`

6. **Upload to Google Play Console**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Select your app → **Testing → Internal testing**
   - Click **Create new release**
   - Upload the `.aab` file
   - Add release notes and publish

### Important Notes

- **Build numbers** must always increase for each upload
- **iOS and Android** can have different build numbers
- **Keystore backups** are critical - you can't update your Android app without the original keystore
- `android/keystore.properties` is gitignored to protect your passwords

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
