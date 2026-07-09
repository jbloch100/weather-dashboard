import { useState } from 'react';
import "./App.css";

type Weather = {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
};

function getWeatherCondition(weatherCode: number) {
  switch (weatherCode) {
    case 0:
      return "☀️ Clear Sky";
    case 1:
      return "🌤️ Mainly Clear";
    case 2:
      return "⛅ Partly Cloudy";
    case 3:
      return "☁️ Overcast";
    case 61:
      return "🌧️ Rain";
    case 71:
      return "❄️ Snow";
    default:
      return "🌍 Unknown";
  }
}

function App() {

  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  async function fetchWeatherByCoordinates(
    latitude: number,
    longitude: number,
    locationName: string
  ) {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    );

    const weatherData = await weatherResponse.json();

    setErrorMessage("");

    setWeather({
      city: locationName,
      temperature: weatherData.current.temperature_2m,
      condition: getWeatherCondition(weatherData.current.weather_code),
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
    });
  }

  async function getWeather() {

    setLoading(true);

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("City not found.");
      }

      const latitude = data.results[0].latitude;
      const longitude = data.results[0].longitude;

      await fetchWeatherByCoordinates(latitude, longitude, city);

    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        setWeather(null);
      }
    } finally {
      setLoading(false);
    }
  }

  function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      await fetchWeatherByCoordinates(
        latitude,
        longitude,
        "My Location"
      );
    });
  }
 

  return (
    <main>
      <h1>Weather Dashboard</h1>
      <p>Search for a city and view the current weather.</p>
      
      <form 
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          getWeather();
        }}
      >
        <input
          type="text"
          placeholder="Enter a city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button type="submit">
          Search Weather
        </button>
      </form>

      <button 
        type="button"
        onClick={getCurrentLocation}
      >
        📍 Use My Location
      </button>

      {loading && <p>Searching...</p>}

      {errorMessage && (
        <p className="error">{errorMessage}</p>
      )}

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>

          <p className="condition">{weather.condition}</p>

          <p className="temperature">
            🌡️ {weather.temperature}°C
          </p>

          <p>💧 Humidity: {weather.humidity}%</p>

          <p>💨 Wind Speed: {weather.windSpeed} km/h</p>
          
        </div>
      )}
    </main>
  );
}

export default App;