# JainSetu App - Testing & Distribution Guide

## 🧪 Testing the App

### Method 1: Test on Your Phone (Fastest)

1. **Start the development server:**
   ```bash
   cd /home/user/JainSetu/mobile
   npm start
   ```

2. **On your phone:**
   - Download "Expo Go" from Play Store/App Store
   - Scan the QR code shown in terminal
   - App loads instantly!

### Method 2: Test on Android Emulator

```bash
npm run android
```

---

## 📱 Building APK for Client

### Step 1: One-time Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo (create free account at expo.dev)
eas login
```

### Step 2: Build APK

```bash
# For testing/preview APK (smaller, faster build)
eas build --platform android --profile preview

# For production APK (optimized)
eas build --platform android --profile production
```

### Step 3: Download & Share

After build completes:
1. Download APK from the link provided
2. Share via WhatsApp, Google Drive, or email to client
3. Client installs APK on their Android phone

---

## 🚀 Sharing Options

### Option A: Share APK Directly
- Build APK using EAS
- Send file to client via WhatsApp/Drive
- Client installs by opening the file

### Option B: Internal Testing Link
- Use `eas build` with internal distribution
- Client gets a link to install directly
- Automatic updates possible

### Option C: Expo Go (For Quick Demos)
- Run `npx expo start --tunnel`
- Share the URL with client
- Client opens in Expo Go app

---

## 📋 Pre-Launch Checklist

Before sharing with client:

- [ ] Test all screens load properly
- [ ] Test login flow works
- [ ] Test Stories feature
- [ ] Test Messenger opens
- [ ] Test Add Content (+) button
- [ ] Test Festival Post creator
- [ ] Test Tirth & Dharamshala navigation
- [ ] Test weather widget displays
- [ ] Test slider auto-scrolls

---

## 🔧 Common Issues & Fixes

### "Cannot find module 'ajv'"
```bash
npm install ajv@8 --legacy-peer-deps
```

### "Metro bundler error"
```bash
npx expo start -c  # Clear cache
```

### "Build failed"
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 📅 Target: March 1st Launch

For production launch:
1. Complete all testing
2. Build production APK
3. Submit to Google Play Store
4. Submit to Apple App Store (requires Apple Developer account)

---

## Need Help?

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
