/**
 * Location Service using Expo Location (FREE)
 *
 * Features:
 * - Get current GPS location
 * - Reverse geocoding (coordinates to address)
 * - Location permission handling
 * - Fallback to default location
 */

import * as Location from 'expo-location';
import Config from './config';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  street?: string;
  formattedAddress: string;
  timestamp: number;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

class LocationService {
  private cachedLocation: LocationData | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current location with address details
   */
  async getCurrentLocation(forceRefresh = false): Promise<LocationData> {
    // Return cached location if valid and not forcing refresh
    if (!forceRefresh && this.cachedLocation) {
      const age = Date.now() - this.cachedLocation.timestamp;
      if (age < this.cacheExpiry) {
        return this.cachedLocation;
      }
    }

    // Check permissions
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        return this.getDefaultLocation();
      }
    }

    try {
      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      const addressData = await this.reverseGeocode(latitude, longitude);

      const locationData: LocationData = {
        latitude,
        longitude,
        ...addressData,
        timestamp: Date.now(),
      };

      this.cachedLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      return this.getDefaultLocation();
    }
  }

  /**
   * Reverse geocode coordinates to address (FREE - uses Expo Location)
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<Omit<LocationData, 'latitude' | 'longitude' | 'timestamp'>> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const address = results[0];
        return {
          city: address.city || address.subregion || 'Unknown',
          state: address.region || '',
          country: address.country || 'India',
          postalCode: address.postalCode || undefined,
          street: address.street || undefined,
          formattedAddress: this.formatAddress(address),
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }

    return {
      city: 'Unknown',
      state: '',
      country: 'India',
      formattedAddress: 'Location detected',
    };
  }

  /**
   * Format address from geocode result
   */
  private formatAddress(address: Location.LocationGeocodedAddress): string {
    const parts = [
      address.street,
      address.city || address.subregion,
      address.region,
      address.postalCode,
    ].filter(Boolean);

    return parts.join(', ') || 'Location detected';
  }

  /**
   * Get default fallback location
   */
  getDefaultLocation(): LocationData {
    return {
      ...Config.DEFAULT_LOCATION,
      country: 'India',
      formattedAddress: `${Config.DEFAULT_LOCATION.city}, ${Config.DEFAULT_LOCATION.state}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate distance between two points (in km)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Watch location changes (for real-time tracking)
   */
  async watchLocation(
    callback: (location: LocationData) => void,
    errorCallback?: (error: LocationError) => void
  ): Promise<Location.LocationSubscription | null> {
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      errorCallback?.({
        code: 'PERMISSION_DENIED',
        message: 'Location permission not granted',
      });
      return null;
    }

    try {
      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 100, // Update every 100 meters
        },
        async (position) => {
          const { latitude, longitude } = position.coords;
          const addressData = await this.reverseGeocode(latitude, longitude);

          const locationData: LocationData = {
            latitude,
            longitude,
            ...addressData,
            timestamp: Date.now(),
          };

          this.cachedLocation = locationData;
          callback(locationData);
        }
      );
    } catch (error) {
      errorCallback?.({
        code: 'UNKNOWN',
        message: 'Failed to watch location',
      });
      return null;
    }
  }

  /**
   * Get timezone for current location
   */
  getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Get local time formatted
   */
  getLocalTime(timezone?: string): {
    time: string;
    date: string;
    day: string;
    timezone: string;
  } {
    const tz = timezone || this.getTimezone();
    const now = new Date();

    const timeFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: tz,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const dayFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: tz,
      weekday: 'long',
    });

    return {
      time: timeFormatter.format(now),
      date: dateFormatter.format(now),
      day: dayFormatter.format(now),
      timezone: tz,
    };
  }
}

export const locationService = new LocationService();
export default locationService;
