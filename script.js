/**
 * Weather Forecast Application
 * --------------------------
 * This application fetches and displays current weather data using the OpenWeatherMap API.
 * Features include:
 * - Search for weather by city name
 * - Get weather for current location using geolocation
 * - Toggle between Celsius and Fahrenheit units
 * - Display of weather conditions, temperature, humidity, wind speed, and pressure
 */

// API configuration
const apiKey = "0c402fea271356b052755eb2466e088a";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

// DOM Elements
const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("current-location");
const weatherInfo = document.getElementById("weather-info");
const errorMessage = document.getElementById("error-message");
const loadingIndicator = document.getElementById("loading-indicator");
const weatherIcon = document.getElementById("weather-icon");
const celsiusBtn = document.getElementById("celsius");
const fahrenheitBtn = document.getElementById("fahrenheit");

// State variables
let currentWeatherData = null; // Stores the last fetched weather data
let currentUnit = "metric"; // Default to Celsius

/**
 * Icon mappings for different weather conditions
 * Maps OpenWeatherMap condition names to local image files
 */
const iconMapping = {
  clear: "images/clear.png",
  clouds: "images/clouds.png",
  drizzle: "images/drizzle.png",
  rain: "images/rain.png",
  thunderstorm: "images/rain.png",
  snow: "images/snow.png",
  mist: "images/mist.png",
  fog: "images/mist.png",
  haze: "images/mist.png",
};

/**
 * Shows the loading indicator and hides other UI elements
 */
function showLoading() {
  loadingIndicator.style.display = "flex";
  weatherInfo.style.display = "none";
  errorMessage.style.display = "none";
}

/**
 * Hides the loading indicator
 */
function hideLoading() {
  loadingIndicator.style.display = "none";
}

/**
 * Formats the current date and time for display
 * @return {string} Formatted date and time string
 */
function formatDateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return now.toLocaleDateString("en-US", options);
}

/**
 * Converts temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature in Celsius
 * @param {string} unit - Target unit ('metric' for Celsius, 'imperial' for Fahrenheit)
 * @return {number} Converted temperature
 */
function convertTemperature(temp, unit) {
  if (unit === "imperial") {
    return (temp * 9) / 5 + 32; // Convert to Fahrenheit
  }
  return temp; // Return as Celsius
}

/**
 * Updates the UI with weather data
 * @param {Object} data - Weather data from OpenWeatherMap API
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 */
function updateWeatherUI(data, unit = "metric") {
  // Update location and time
  document.getElementById(
    "city-name"
  ).innerText = `${data.name}, ${data.sys.country}`;
  document.getElementById("date-time").innerText = formatDateTime();

  // Convert and display temperature values
  const temperature = convertTemperature(data.main.temp, unit);
  const feelsLike = convertTemperature(data.main.feels_like, unit);

  document.getElementById("temperature").innerText = `${Math.round(
    temperature
  )}°${unit === "metric" ? "C" : "F"}`;
  document.getElementById("feels-like").innerText = `Feels like: ${Math.round(
    feelsLike
  )}°${unit === "metric" ? "C" : "F"}`;
  document.getElementById("weather-description").innerText =
    data.weather[0].description;

  // Update other weather details
  document.getElementById("humidity").innerText = `${data.main.humidity}%`;
  document.getElementById("wind-speed").innerText = `${
    unit === "metric" ? data.wind.speed : (data.wind.speed * 2.237).toFixed(1)
  } ${unit === "metric" ? "m/s" : "mph"}`;
  document.getElementById("pressure").innerText = `${data.main.pressure} hPa`;

  // Set weather icon based on current conditions
  const weatherCondition = data.weather[0].main.toLowerCase();
  weatherIcon.src = iconMapping[weatherCondition] || "images/default.png";

  // Show weather info and hide loading indicator
  weatherInfo.style.display = "block";
  hideLoading();
}

/**
 * Fetches weather data for a specific city
 * @param {string} city - Name of the city
 */
async function fetchWeatherByCity(city) {
  showLoading();

  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    currentWeatherData = data;
    updateWeatherUI(data, currentUnit);
  } catch (error) {
    hideLoading();
    weatherInfo.style.display = "none";
    errorMessage.style.display = "block";
  }
}

/**
 * Fetches weather data based on geographic coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function fetchWeatherByCoords(lat, lon) {
  showLoading();

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("Location data not available");

    const data = await response.json();
    currentWeatherData = data;
    updateWeatherUI(data, currentUnit);
  } catch (error) {
    hideLoading();
    weatherInfo.style.display = "none";
    errorMessage.style.display = "block";
  }
}

/**
 * Gets user's current location using geolocation API
 * and fetches weather data for that location
 */
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        errorMessage.style.display = "block";
        errorMessage.querySelector("p").innerText =
          "Unable to get your location. Please search for a city instead.";
      }
    );
  } else {
    errorMessage.style.display = "block";
    errorMessage.querySelector("p").innerText =
      "Geolocation is not supported by your browser.";
  }
}

/**
 * Toggles between Celsius and Fahrenheit units
 * @param {string} unit - 'metric' for Celsius, 'imperial' for Fahrenheit
 */
function toggleUnits(unit) {
  currentUnit = unit;

  // Update active state of buttons
  if (unit === "metric") {
    celsiusBtn.classList.add("active");
    fahrenheitBtn.classList.remove("active");
  } else {
    celsiusBtn.classList.remove("active");
    fahrenheitBtn.classList.add("active");
  }

  // Update UI if we have weather data
  if (currentWeatherData) {
    updateWeatherUI(currentWeatherData, currentUnit);
  }
}

// Event Listeners

// Search button click
searchBtn.addEventListener("click", () => {
  const city = searchBox.value.trim();
  if (city) fetchWeatherByCity(city);
});

// Enter key in search box
searchBox.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const city = searchBox.value.trim();
    if (city) fetchWeatherByCity(city);
  }
});

// Get current location button
locationBtn.addEventListener("click", getCurrentLocation);

// Temperature unit toggle buttons
celsiusBtn.addEventListener("click", () => toggleUnits("metric"));
fahrenheitBtn.addEventListener("click", () => toggleUnits("imperial"));

// Initialize with user's location or default city on page load
window.addEventListener("load", () => {
  // Try to get user's location first
  getCurrentLocation();

  // Fallback to a default city if location access is denied or takes too long
  setTimeout(() => {
    if (weatherInfo.style.display !== "block") {
      fetchWeatherByCity("London");
    }
  }, 3000);
});
