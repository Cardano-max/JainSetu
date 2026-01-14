# How to Build APK and Send to Client

This guide explains how to build an Android APK for client demo and testing.

---

## Quick Answer: Should You Integrate First?

**YES!** Integrate everything first, then build the APK. Here's why:
1. Demo data works without API keys
2. Client can see all features working
3. You can add real API keys later without rebuilding

---

## Method 1: EAS Build (Recommended - Easiest)

EAS (Expo Application Services) builds APK in the cloud. No Android Studio needed!

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure Build
```bash
cd mobile
eas build:configure
```

### Step 4: Build APK (Development)
```bash
# For internal testing APK (faster, larger file)
eas build --platform android --profile preview
```

This will:
1. Upload your code to Expo servers
2. Build the APK in the cloud (~10-15 mins)
3. Give you a download link for the APK

### Step 5: Download and Send APK
- You'll get a link like: `https://expo.dev/artifacts/eas/xxx.apk`
- Download the APK
- Send to client via WhatsApp/Email/Google Drive

---

## Method 2: Local APK Build (Without EAS)

If you want to build locally (requires more setup):

### Prerequisites
- Android Studio installed
- Java JDK 17
- Android SDK

### Step 1: Prebuild
```bash
cd mobile
npx expo prebuild --platform android
```

### Step 2: Build APK
```bash
cd android
./gradlew assembleRelease
```

### Step 3: Find APK
APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Method 3: Expo Go (For Quick Demo)

For the fastest demo without building an APK:

### Step 1: Start Development Server
```bash
cd mobile
npx expo start
```

### Step 2: Share with Client
- Client installs "Expo Go" from Play Store
- Share the QR code or link with client
- Client scans/opens and sees the app instantly

**Limitations:**
- Requires internet connection
- Some native features may not work
- Not a real APK (just preview)

---

## EAS Build Profiles

Add this to `eas.json` for different build types:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Then build with:
```bash
# For demo/testing APK
eas build --platform android --profile preview

# For Play Store (AAB file)
eas build --platform android --profile production
```

---

## Sending APK to Client

### Option 1: WhatsApp
1. Rename file to end with `.apk.zip` (WhatsApp blocks .apk)
2. Send via WhatsApp
3. Tell client to rename back to `.apk` after downloading

### Option 2: Google Drive
1. Upload APK to Google Drive
2. Share link with client
3. Client downloads and installs

### Option 3: Direct Link
1. After EAS build, you get a direct download link
2. Share this link with client
3. Valid for ~30 days

### Option 4: Firebase App Distribution (Recommended for Teams)
1. Upload APK to Firebase App Distribution
2. Add client's email as tester
3. Client gets email with install link

---

## Client Installation Instructions

Send this to your client:

```
How to Install JainSetu Demo:

1. Download the APK file I sent
2. Open your phone's File Manager
3. Find the downloaded APK
4. Tap on it to install
5. If prompted "Install from unknown sources":
   - Go to Settings
   - Security / Apps
   - Enable "Install unknown apps" for your browser/file manager
6. Complete installation
7. Open JainSetu app!

Note: This is a demo version for testing.
```

---

## Common Issues

### "App not installed" error
- Delete any previous version of the app
- Make sure you have enough storage
- Try downloading APK again

### "Parse error"
- APK might be corrupted during download
- Re-download and try again

### App crashes on start
- Check if you have Android 6.0 or higher
- Try clearing app data and reopening

---

## Build Commands Summary

```bash
# Quick demo (no build needed)
npx expo start

# Build APK for testing
eas build --platform android --profile preview

# Build for Play Store
eas build --platform android --profile production

# Build iOS for TestFlight
eas build --platform ios --profile production
```

---

## Timeline

| Method | Time | Best For |
|--------|------|----------|
| Expo Go | Instant | Quick preview |
| EAS Build (APK) | 10-15 min | Client demo |
| Local Build | 20-30 min | Offline development |
| Play Store | 1-3 days | Production release |

---

## Next Steps After Client Approval

1. Get API keys (OpenWeatherMap, Google Maps)
2. Update configuration files
3. Build production APK/AAB
4. Submit to Play Store
5. Submit to App Store (requires Mac)
