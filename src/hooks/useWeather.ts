import { useState } from "react";

export interface WeatherResult {
  temperature: number | null;
  loading: boolean;
  error: string;
  fetchWeather: (city: string) => Promise<void>;
}

export function useWeather(): WeatherResult {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (city: string) => {
    if (!city.trim()) {
      setError("Indtast venligst et bynavn");
      return;
    }

    setLoading(true);
    setError("");
    setTemperature(null);

    try {
      const GeoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1`
      );
      const geoData = await GeoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("By ikke fundet");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = geoData.results[0];

      const WeatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await WeatherRes.json();

      setTemperature(weatherData.current_weather.temperature);
    } catch {
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  return { temperature, loading, error, fetchWeather };
}
