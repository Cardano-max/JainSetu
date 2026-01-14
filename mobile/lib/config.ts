/**
 * API Configuration for JainSetu Mobile App
 *
 * FREE APIs INTEGRATED:
 * 1. OpenWeatherMap - Weather data (Free: 1000 calls/day)
 * 2. Expo Location - Device GPS location (Free, built-in)
 * 3. Google Maps - Maps display (Free tier: 28,000 loads/month)
 * 4. TimeZone - Using built-in Intl API (Free)
 * 5. IP Geolocation - Fallback location (Free tier available)
 *
 * HOW TO GET API KEYS:
 *
 * 1. OPENWEATHERMAP (Weather):
 *    - Go to https://openweathermap.org/api
 *    - Sign up for free account
 *    - Go to API Keys section
 *    - Copy your API key
 *    - Free tier: 1,000 calls/day, current weather + 5-day forecast
 *
 * 2. GOOGLE MAPS (Maps):
 *    - Go to https://console.cloud.google.com
 *    - Create new project
 *    - Enable "Maps SDK for Android" and "Maps SDK for iOS"
 *    - Go to Credentials > Create Credentials > API Key
 *    - Restrict key to your app's package name for security
 *    - Free tier: $200/month credit (~28,000 map loads)
 *
 * 3. GOOGLE PLACES (Place search - optional):
 *    - Same console, enable "Places API"
 *    - Uses same API key
 *    - Free tier: Part of $200/month credit
 */

import Constants from 'expo-constants';

// Environment detection
const ENV = {
  dev: {
    // Demo/Development API Keys (replace with your own for production)
    OPENWEATHERMAP_API_KEY: 'demo_key', // Get free key from openweathermap.org
    GOOGLE_MAPS_API_KEY: '', // Get from Google Cloud Console
    API_URL: 'http://192.168.1.100:5000/api', // Your backend
  },
  staging: {
    OPENWEATHERMAP_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHERMAP_KEY || '',
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '',
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://staging-api.jainsetu.com/api',
  },
  prod: {
    OPENWEATHERMAP_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHERMAP_KEY || '',
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '',
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.jainsetu.com/api',
  },
};

// Determine current environment
const getEnvVars = () => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;

  if (releaseChannel === 'production' || releaseChannel === 'prod') {
    return ENV.prod;
  }
  if (releaseChannel === 'staging') {
    return ENV.staging;
  }
  return ENV.dev;
};

export const Config = {
  ...getEnvVars(),

  // App Info
  APP_NAME: 'JainSetu',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',

  // Feature Flags
  ENABLE_WEATHER: true,
  ENABLE_LOCATION: true,
  ENABLE_MAPS: true,
  ENABLE_ANALYTICS: false, // Enable in production

  // API Endpoints (Free APIs)
  WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5',
  GEOCODING_API_URL: 'https://api.openweathermap.org/geo/1.0',

  // Fallback coordinates (Mumbai - default for Jain community)
  DEFAULT_LOCATION: {
    latitude: 19.0760,
    longitude: 72.8777,
    city: 'Mumbai',
    state: 'Maharashtra',
  },
};

export default Config;
