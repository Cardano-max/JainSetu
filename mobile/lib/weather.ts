/**
 * Weather Service using OpenWeatherMap API (FREE TIER)
 *
 * Free Tier Limits:
 * - 1,000 API calls per day
 * - Current weather data
 * - 5-day/3-hour forecast
 *
 * Sign up: https://openweathermap.org/api
 */

import Config from './config';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  iconUrl: string;
  condition: WeatherCondition;
  visibility: number;
  clouds: number;
  sunrise: Date;
  sunset: Date;
  cityName: string;
  country: string;
  timestamp: Date;
}

export interface ForecastItem {
  date: Date;
  temperature: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  description: string;
  icon: string;
  iconUrl: string;
  condition: WeatherCondition;
}

export interface ForecastData {
  city: string;
  country: string;
  items: ForecastItem[];
}

export type WeatherCondition =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'fog'
  | 'haze'
  | 'dust'
  | 'smoke'
  | 'unknown';

// Weather condition icons mapping
export const WEATHER_ICONS: Record<WeatherCondition, string> = {
  clear: 'sunny',
  clouds: 'cloudy',
  rain: 'rainy',
  drizzle: 'rainy',
  thunderstorm: 'thunderstorm',
  snow: 'snow',
  mist: 'water-outline',
  fog: 'water-outline',
  haze: 'water-outline',
  dust: 'alert-circle',
  smoke: 'alert-circle',
  unknown: 'help-circle',
};

class WeatherService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.apiKey = Config.OPENWEATHERMAP_API_KEY;
    this.baseUrl = Config.WEATHER_API_URL;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return this.apiKey !== '' && this.apiKey !== 'demo_key';
  }

  /**
   * Get current weather for coordinates
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number
  ): Promise<WeatherData> {
    // If no API key, return demo data
    if (!this.isConfigured()) {
      return this.getDemoWeather(latitude, longitude);
    }

    const cacheKey = `weather_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const weather = this.parseCurrentWeather(data);

      this.setCache(cacheKey, weather);
      return weather;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getDemoWeather(latitude, longitude);
    }
  }

  /**
   * Get 5-day forecast
   */
  async getForecast(
    latitude: number,
    longitude: number
  ): Promise<ForecastData> {
    if (!this.isConfigured()) {
      return this.getDemoForecast();
    }

    const cacheKey = `forecast_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      const forecast = this.parseForecast(data);

      this.setCache(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.error('Forecast API error:', error);
      return this.getDemoForecast();
    }
  }

  /**
   * Get weather by city name
   */
  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    if (!this.isConfigured()) {
      return this.getDemoWeather(19.076, 72.877);
    }

    const cacheKey = `weather_city_${cityName.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const weather = this.parseCurrentWeather(data);

      this.setCache(cacheKey, weather);
      return weather;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getDemoWeather(19.076, 72.877);
    }
  }

  /**
   * Parse current weather response
   */
  private parseCurrentWeather(data: any): WeatherData {
    const condition = this.mapCondition(data.weather[0].main);

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg || 0,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      condition,
      visibility: (data.visibility || 10000) / 1000, // Convert to km
      clouds: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      cityName: data.name,
      country: data.sys.country,
      timestamp: new Date(),
    };
  }

  /**
   * Parse forecast response
   */
  private parseForecast(data: any): ForecastData {
    // Get one entry per day (at noon)
    const dailyForecasts: ForecastItem[] = [];
    const seenDates = new Set<string>();

    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!seenDates.has(dateKey) && dailyForecasts.length < 5) {
        seenDates.add(dateKey);
        const condition = this.mapCondition(item.weather[0].main);

        dailyForecasts.push({
          date,
          temperature: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          humidity: item.main.humidity,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          condition,
        });
      }
    }

    return {
      city: data.city.name,
      country: data.city.country,
      items: dailyForecasts,
    };
  }

  /**
   * Map OpenWeatherMap condition to our condition type
   */
  private mapCondition(main: string): WeatherCondition {
    const mapping: Record<string, WeatherCondition> = {
      Clear: 'clear',
      Clouds: 'clouds',
      Rain: 'rain',
      Drizzle: 'drizzle',
      Thunderstorm: 'thunderstorm',
      Snow: 'snow',
      Mist: 'mist',
      Fog: 'fog',
      Haze: 'haze',
      Dust: 'dust',
      Smoke: 'smoke',
    };
    return mapping[main] || 'unknown';
  }

  /**
   * Demo weather data for testing without API key
   */
  private getDemoWeather(lat: number, lon: number): WeatherData {
    // Generate somewhat realistic demo data based on time
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    const baseTemp = isDay ? 32 : 26; // Typical Indian temperature

    return {
      temperature: baseTemp + Math.floor(Math.random() * 5),
      feelsLike: baseTemp + 2 + Math.floor(Math.random() * 3),
      humidity: 60 + Math.floor(Math.random() * 20),
      pressure: 1013,
      windSpeed: 3 + Math.random() * 5,
      windDirection: Math.floor(Math.random() * 360),
      description: isDay ? 'partly cloudy' : 'clear sky',
      icon: isDay ? '02d' : '01n',
      iconUrl: `https://openweathermap.org/img/wn/${isDay ? '02d' : '01n'}@2x.png`,
      condition: isDay ? 'clouds' : 'clear',
      visibility: 10,
      clouds: 25,
      sunrise: new Date(new Date().setHours(6, 15, 0)),
      sunset: new Date(new Date().setHours(18, 45, 0)),
      cityName: 'Mumbai',
      country: 'IN',
      timestamp: new Date(),
    };
  }

  /**
   * Demo forecast data
   */
  private getDemoForecast(): ForecastData {
    const items: ForecastItem[] = [];
    const conditions: WeatherCondition[] = ['clear', 'clouds', 'clear', 'rain', 'clouds'];
    const descriptions = ['clear sky', 'partly cloudy', 'sunny', 'light rain', 'scattered clouds'];

    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      items.push({
        date,
        temperature: 30 + Math.floor(Math.random() * 5),
        tempMin: 26 + Math.floor(Math.random() * 3),
        tempMax: 34 + Math.floor(Math.random() * 3),
        humidity: 55 + Math.floor(Math.random() * 25),
        description: descriptions[i],
        icon: conditions[i] === 'clear' ? '01d' : conditions[i] === 'rain' ? '10d' : '03d',
        iconUrl: `https://openweathermap.org/img/wn/01d@2x.png`,
        condition: conditions[i],
      });
    }

    return {
      city: 'Mumbai',
      country: 'IN',
      items,
    };
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get weather icon name for Ionicons
   */
  getWeatherIcon(condition: WeatherCondition, isDay: boolean = true): string {
    const icons: Record<WeatherCondition, string> = {
      clear: isDay ? 'sunny' : 'moon',
      clouds: isDay ? 'partly-sunny' : 'cloudy-night',
      rain: 'rainy',
      drizzle: 'rainy-outline',
      thunderstorm: 'thunderstorm',
      snow: 'snow',
      mist: 'water-outline',
      fog: 'cloud-outline',
      haze: 'cloud',
      dust: 'warning',
      smoke: 'warning-outline',
      unknown: 'help-circle',
    };
    return icons[condition];
  }

  /**
   * Format temperature with unit
   */
  formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
    if (unit === 'F') {
      return `${Math.round(temp * 9 / 5 + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
  }
}

export const weatherService = new WeatherService();
export default weatherService;
