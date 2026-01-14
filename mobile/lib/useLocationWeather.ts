/**
 * Combined Location + Weather Hook
 *
 * Provides:
 * - Current location with city name
 * - Local time and timezone
 * - Current weather data
 * - 5-day forecast
 * - Loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import locationService, { LocationData } from './location';
import weatherService, { WeatherData, ForecastData } from './weather';

interface LocationWeatherState {
  // Location
  location: LocationData | null;
  locationLoading: boolean;
  locationError: string | null;

  // Time
  localTime: {
    time: string;
    date: string;
    day: string;
    timezone: string;
  } | null;

  // Weather
  weather: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;

  // Forecast
  forecast: ForecastData | null;
  forecastLoading: boolean;

  // Actions
  refresh: () => Promise<void>;
  refreshWeather: () => Promise<void>;
}

export function useLocationWeather(): LocationWeatherState {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [localTime, setLocalTime] = useState<LocationWeatherState['localTime']>(null);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      setLocalTime(locationService.getLocalTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch location
  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
      return loc;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location';
      setLocationError(message);
      // Use default location on error
      const defaultLoc = locationService.getDefaultLocation();
      setLocation(defaultLoc);
      return defaultLoc;
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Fetch weather for location
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const weatherData = await weatherService.getCurrentWeather(lat, lon);
      setWeather(weatherData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get weather';
      setWeatherError(message);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Fetch forecast
  const fetchForecast = useCallback(async (lat: number, lon: number) => {
    setForecastLoading(true);

    try {
      const forecastData = await weatherService.getForecast(lat, lon);
      setForecast(forecastData);
    } catch (error) {
      console.error('Forecast error:', error);
    } finally {
      setForecastLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const loc = await fetchLocation();
      if (loc) {
        await Promise.all([
          fetchWeather(loc.latitude, loc.longitude),
          fetchForecast(loc.latitude, loc.longitude),
        ]);
      }
    };

    init();
  }, [fetchLocation, fetchWeather, fetchForecast]);

  // Refresh all data
  const refresh = useCallback(async () => {
    const loc = await fetchLocation();
    if (loc) {
      await Promise.all([
        fetchWeather(loc.latitude, loc.longitude),
        fetchForecast(loc.latitude, loc.longitude),
      ]);
    }
  }, [fetchLocation, fetchWeather, fetchForecast]);

  // Refresh just weather
  const refreshWeather = useCallback(async () => {
    if (location) {
      await fetchWeather(location.latitude, location.longitude);
    }
  }, [location, fetchWeather]);

  return {
    location,
    locationLoading,
    locationError,
    localTime,
    weather,
    weatherLoading,
    weatherError,
    forecast,
    forecastLoading,
    refresh,
    refreshWeather,
  };
}

export default useLocationWeather;
