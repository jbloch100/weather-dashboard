import { useState } from 'react';
import "./App.css";

type Weather = {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
};

function App() {

  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);

  async function getWeather() {

    setLoading(true);

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const data = await response.json();

      const latitude = data.results[0].latitude;
      const longitude = data.results[0].longitude;

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
      );

      const weatherData = await weatherResponse.json();

      setWeather({
        city: city,
        temperature: weatherData.current.temperature_2m,
        condition: "Current Weather",
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
 

  return (
    <main>
      <h1>Weather Dashboard</h1>
      <p>Search for a city and view the current weather.</p>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter a city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button onClick={getWeather}>
          Search Weather
        </button>
      </div>

      {loading && <p>Searching...</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>

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