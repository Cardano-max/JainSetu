# JainSetu API Setup Guide

This guide explains how to set up and configure all the free APIs integrated into the JainSetu mobile app.

## Integrated APIs Overview

| API | Purpose | Free Tier Limits | Status |
|-----|---------|------------------|--------|
| **Expo Location** | GPS Location | Unlimited (device) | Works out of box |
| **OpenWeatherMap** | Weather Data | 1,000 calls/day | Needs API Key |
| **Google Maps** | Map Display | $200/month credit (~28K loads) | Needs API Key |
| **Intl API** | Timezone/Time | Unlimited (built-in) | Works out of box |

---

## 1. OpenWeatherMap API (Weather)

### Features
- Current weather (temperature, humidity, wind, etc.)
- 5-day forecast
- Weather icons
- Sunrise/sunset times

### How to Get Free API Key

1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click "Sign Up" and create a free account
3. Verify your email
4. Go to "API Keys" section in your account
5. Copy your default API key (or create a new one)

### Free Tier Limits
- 1,000 API calls per day
- Current weather data
- 5-day/3-hour forecast
- No credit card required

### Configure in App

Edit `mobile/lib/config.ts`:

```typescript
dev: {
  OPENWEATHERMAP_API_KEY: 'your_api_key_here', // Replace this
  // ...
}
```

**Or use environment variables (recommended for production):**

Create a `.env` file:
```
EXPO_PUBLIC_OPENWEATHERMAP_KEY=your_api_key_here
```

---

## 2. Google Maps API (Maps)

### Features
- Interactive maps showing temple/tirth locations
- Map markers with colors by type
- User location display
- Navigation to Google Maps/Apple Maps

### How to Get Free API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable these APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
4. Go to "Credentials" > "Create Credentials" > "API Key"
5. **Restrict your API key** (important for security):
   - Click on the key
   - Under "Application restrictions":
     - For Android: Select "Android apps" and add your package name `com.jainsetu.app`
     - For iOS: Select "iOS apps" and add your bundle ID `com.jainsetu.app`

### Free Tier Limits
- $200 free credit per month
- ~28,000 map loads per month
- Resets monthly
- Credit card required but won't be charged within free tier

### Configure in App

Edit `mobile/app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY_HERE"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY_HERE"
      }
    }
  }
}
```

### Important Notes
- You can use the same API key for both Android and iOS if not restricted
- Maps will work without API key in development (Expo Go) but need key for production builds
- Always restrict your API keys in production!

---

## 3. Expo Location (GPS)

### Features
- Get current device location (latitude/longitude)
- Reverse geocoding (coordinates to city/address)
- Location permission handling
- Distance calculations

### No API Key Required!
This is a device-level API that uses the phone's GPS. It works automatically.

### Permissions (Already Configured)
The app.json already includes:
```json
"android": {
  "permissions": [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION"
  ]
}
```

---

## 4. Built-in Time/Timezone (Intl API)

### Features
- Get local time for any timezone
- Format dates in Indian format
- Get day of week
- Timezone detection

### No API Key Required!
Uses JavaScript's built-in `Intl` API which is available in all modern devices.

---

## Demo Mode (Without API Keys)

The app will work in demo mode without API keys:

- **Weather**: Shows realistic mock weather data for Mumbai
- **Location**: Falls back to Mumbai coordinates
- **Maps**: Shows default map (may have watermarks)
- **Time**: Always works (built-in)

This is perfect for client demos before getting production API keys!

---

## Environment Configuration

### Development (.env.development)
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
EXPO_PUBLIC_OPENWEATHERMAP_KEY=your_dev_key
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_dev_key
```

### Production (.env.production)
```
EXPO_PUBLIC_API_URL=https://api.jainsetu.com/api
EXPO_PUBLIC_OPENWEATHERMAP_KEY=your_prod_key
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_prod_key
```

---

## Quick Start Checklist

### For Demo (No Keys Needed)
- [x] Install dependencies: `npm install`
- [x] Start app: `npx expo start`
- [x] Works with demo data!

### For Full Features
- [ ] Get OpenWeatherMap API key (5 min)
- [ ] Update `lib/config.ts` with weather API key
- [ ] Get Google Maps API key (10 min)
- [ ] Update `app.json` with Maps API keys
- [ ] Rebuild app: `npx expo prebuild --clean`

---

## Troubleshooting

### Weather not loading
1. Check if API key is correctly set in `lib/config.ts`
2. Check internet connection
3. Free tier allows 1000 calls/day - check if exceeded

### Maps not displaying
1. For Expo Go: Maps work without API key
2. For production build: Must add API key to app.json
3. Check if Google Maps SDK is enabled in Google Console

### Location permission denied
1. Go to phone Settings > Apps > JainSetu > Permissions
2. Enable Location permission
3. Restart the app

### Location showing wrong city
1. Ensure GPS is enabled on device
2. Try refreshing (pull down on home screen)
3. Check if in indoor location (GPS may be weak)

---

## Cost Estimates for Production

| API | Monthly Usage | Estimated Cost |
|-----|---------------|----------------|
| OpenWeatherMap | 30,000 calls | FREE (under 1K/day) |
| Google Maps | 10,000 loads | FREE ($200 credit) |
| Expo Location | Unlimited | FREE |
| **Total** | - | **$0/month** |

For most apps with <1000 daily users, all APIs remain completely free!

---

## Need Help?

- OpenWeatherMap Docs: https://openweathermap.org/api
- Google Maps Docs: https://developers.google.com/maps
- Expo Location Docs: https://docs.expo.dev/versions/latest/sdk/location/
