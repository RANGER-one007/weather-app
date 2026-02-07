// API Configuration
const API_KEY = 'c7def7f0587a48be82c53232260702'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.weatherapi.com/v1';

// Weather App - Complete JavaScript File
// Copy this ENTIRE code and REPLACE your current script.js file

// API Configuration - Using Mock Data (No API Key Needed)
const mockWeatherData = {
    'chennai': {
        location: 'Chennai, IN',
        temp: 32,
        description: 'Partly cloudy',
        humidity: 78,
        wind: 12,
        feels_like: 35,
        condition: 'partly-cloudy-day',
        sunrise: '06:15',
        sunset: '18:30',
        pressure: 1013,
        visibility: 8
    },
    'london': {
        location: 'London, UK',
        temp: 15,
        description: 'Light rain',
        humidity: 82,
        wind: 18,
        feels_like: 13,
        condition: 'rain',
        sunrise: '07:45',
        sunset: '16:30',
        pressure: 1005,
        visibility: 5
    },
    'new york': {
        location: 'New York, US',
        temp: 22,
        description: 'Sunny',
        humidity: 65,
        wind: 10,
        feels_like: 23,
        condition: 'clear-day',
        sunrise: '07:00',
        sunset: '19:15',
        pressure: 1015,
        visibility: 15
    },
    'tokyo': {
        location: 'Tokyo, JP',
        temp: 25,
        description: 'Clear',
        humidity: 70,
        wind: 8,
        feels_like: 26,
        condition: 'clear-day',
        sunrise: '05:30',
        sunset: '18:45',
        pressure: 1010,
        visibility: 12
    },
    'paris': {
        location: 'Paris, FR',
        temp: 18,
        description: 'Cloudy',
        humidity: 75,
        wind: 14,
        feels_like: 17,
        condition: 'cloudy',
        sunrise: '08:15',
        sunset: '17:45',
        pressure: 1008,
        visibility: 6
    },
    'delhi': {
        location: 'Delhi, IN',
        temp: 30,
        description: 'Haze',
        humidity: 45,
        wind: 5,
        feels_like: 32,
        condition: 'fog',
        sunrise: '06:45',
        sunset: '18:15',
        pressure: 1002,
        visibility: 3
    },
    'mumbai': {
        location: 'Mumbai, IN',
        temp: 33,
        description: 'Humid',
        humidity: 85,
        wind: 15,
        feels_like: 38,
        condition: 'partly-cloudy-day',
        sunrise: '06:30',
        sunset: '18:45',
        pressure: 1009,
        visibility: 7
    },
    'bangalore': {
        location: 'Bangalore, IN',
        temp: 28,
        description: 'Pleasant',
        humidity: 65,
        wind: 8,
        feels_like: 29,
        condition: 'clear-day',
        sunrise: '06:20',
        sunset: '18:25',
        pressure: 1012,
        visibility: 10
    },
    'madurai': {
        location: 'Madurai, IN',
        temp: 34,
        description: 'Hot',
        humidity: 60,
        wind: 10,
        feels_like: 36,
        condition: 'clear-day',
        sunrise: '06:10',
        sunset: '18:20',
        pressure: 1010,
        visibility: 12
    },
    'coimbatore': {
        location: 'Coimbatore, IN',
        temp: 29,
        description: 'Mild',
        humidity: 70,
        wind: 12,
        feels_like: 31,
        condition: 'partly-cloudy-day',
        sunrise: '06:25',
        sunset: '18:35',
        pressure: 1011,
        visibility: 9
    }
};

// DOM Elements
const locationElement = document.getElementById('location');
const dateTimeElement = document.getElementById('date-time');
const temperatureElement = document.getElementById('temperature');
const weatherDescriptionElement = document.getElementById('weather-description');
const weatherIconElement = document.getElementById('weatherIcon');
const windElement = document.getElementById('wind');
const humidityElement = document.getElementById('humidity');
const feelsLikeElement = document.getElementById('feels-like');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecastContainer');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const lastUpdateElement = document.getElementById('lastUpdate');
const loadingOverlay = document.getElementById('loadingOverlay');
const thunderFlash = document.getElementById('thunderFlash');
const weatherEffects = document.getElementById('weatherEffects');
const backgroundCanvas = document.getElementById('backgroundCanvas');
const ctx = backgroundCanvas.getContext('2d');

// Theme elements
const themeButtons = document.querySelectorAll('.theme-btn');
const rainToggle = document.getElementById('rainToggle');
const snowToggle = document.getElementById('snowToggle');
const thunderToggle = document.getElementById('thunderToggle');

// App State
let currentWeatherData = null;
let currentTheme = 'auto';
let rainActive = false;
let snowActive = false;
let thunderActive = false;
let rainAnimationId = null;
let snowAnimationId = null;
let thunderIntervalId = null;
let currentCondition = 'clear';

// Initialize the app
function initApp() {
    setupEventListeners();
    setupCanvas();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Start with Chennai weather
    setTimeout(() => {
        getWeatherByCity('Chennai');
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
    }, 1500);
}

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
            cityInput.value = '';
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    locationBtn.addEventListener('click', () => {
        alert('Using Chennai as default location. Search for other cities!');
        getWeatherByCity('Chennai');
    });

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTheme = btn.dataset.theme;
            applyTheme();
        });
    });

    rainToggle.addEventListener('click', () => {
        rainActive = !rainActive;
        rainToggle.classList.toggle('active', rainActive);
        toggleRainEffect(rainActive);
    });

    snowToggle.addEventListener('click', () => {
        snowActive = !snowActive;
        snowToggle.classList.toggle('active', snowActive);
        toggleSnowEffect(snowActive);
    });

    thunderToggle.addEventListener('click', () => {
        thunderActive = !thunderActive;
        thunderToggle.classList.toggle('active', thunderActive);
        toggleThunderEffect(thunderActive);
    });
}

// Setup canvas for background effects
function setupCanvas() {
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        backgroundCanvas.width = window.innerWidth;
        backgroundCanvas.height = window.innerHeight;
        drawBackground();
    });
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    dateTimeElement.textContent = now.toLocaleDateString('en-US', options);

    // Auto theme based on time of day
    if (currentTheme === 'auto') {
        const hour = now.getHours();
        const isNight = hour < 6 || hour >= 18;
        document.body.classList.toggle('night-mode', isNight);
    }

    // Update last update time
    lastUpdateElement.textContent = `Last updated: ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
}

// Get weather by city name - Using Mock Data
async function getWeatherByCity(city) {
    try {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';

        console.log(`Fetching weather for: ${city}`);

        // Use mock data
        const cityLower = city.toLowerCase();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (mockWeatherData[cityLower]) {
            const data = mockWeatherData[cityLower];
            updateUIWithMockData(data, city);

            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);

        } else {
            // Default to Chennai if city not found
            updateUIWithMockData(mockWeatherData['chennai'], 'Chennai');

            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);

            alert(`City "${city}" not found in database. Showing Chennai weather instead.`);
        }

    } catch (error) {
        console.error('Error:', error);
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
        alert('Error loading weather. Please try again.');
    }
}

// Update UI with mock data
function updateUIWithMockData(data, city) {
    currentWeatherData = data;

    // Update location
    locationElement.textContent = data.location;

    // Update current weather
    temperatureElement.textContent = data.temp;
    weatherDescriptionElement.textContent = data.description;
    windElement.textContent = `${data.wind} km/h`;
    humidityElement.textContent = `${data.humidity}%`;
    feelsLikeElement.textContent = `${data.feels_like}°C`;

    // Update sunrise and sunset
    sunriseElement.textContent = data.sunrise;
    sunsetElement.textContent = data.sunset;

    // Update pressure and visibility
    pressureElement.textContent = `${data.pressure} hPa`;
    visibilityElement.textContent = `${data.visibility} km`;

    // Update weather icon based on condition
    updateWeatherIconMock(data.condition);

    // Generate mock forecast
    generateMockForecast(data.temp, data.condition);

    // Update effects
    updateEffectsFromCondition(data.condition);

    // Draw background
    drawBackgroundFromCondition(data.condition);

    // Apply theme
    applyTheme();

    console.log(`Weather updated for ${city}:`, data);
}

// Update weather icon for mock data
function updateWeatherIconMock(condition) {
    const iconMap = {
        'clear-day': 'wi-day-sunny',
        'clear-night': 'wi-night-clear',
        'partly-cloudy-day': 'wi-day-cloudy',
        'partly-cloudy-night': 'wi-night-alt-cloudy',
        'cloudy': 'wi-cloudy',
        'rain': 'wi-rain',
        'snow': 'wi-snow',
        'fog': 'wi-fog',
        'thunderstorm': 'wi-thunderstorm'
    };

    const iconClass = iconMap[condition] || 'wi-day-sunny';
    weatherIconElement.className = `wi ${iconClass}`;
    currentCondition = condition;
}

// Generate mock forecast
function generateMockForecast(baseTemp, condition) {
    forecastContainer.innerHTML = '';

    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'];
    const conditionMap = {
        'clear-day': ['clear-day', 'partly-cloudy-day', 'clear-day', 'cloudy', 'clear-day'],
        'partly-cloudy-day': ['partly-cloudy-day', 'cloudy', 'rain', 'partly-cloudy-day', 'clear-day'],
        'cloudy': ['cloudy', 'rain', 'cloudy', 'partly-cloudy-day', 'cloudy'],
        'rain': ['rain', 'rain', 'cloudy', 'partly-cloudy-day', 'clear-day'],
        'snow': ['snow', 'snow', 'cloudy', 'snow', 'partly-cloudy-day'],
        'fog': ['fog', 'cloudy', 'partly-cloudy-day', 'clear-day', 'cloudy'],
        'thunderstorm': ['thunderstorm', 'rain', 'cloudy', 'partly-cloudy-day', 'clear-day']
    };

    const conditions = conditionMap[condition] || ['clear-day', 'partly-cloudy-day', 'cloudy', 'rain', 'clear-day'];

    days.forEach((day, index) => {
        // Generate random temperature around baseTemp
        const temp = baseTemp + Math.floor(Math.random() * 6) - 3;
        const dayCondition = conditions[index];

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-day';
        forecastCard.innerHTML = `
            <h4>${day}</h4>
            <i class="wi ${getForecastIcon(dayCondition)} forecast-icon"></i>
            <p>${dayCondition.replace('-', ' ')}</p>
            <div class="forecast-temp">
                <span>${temp}°C</span>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

// Get forecast icon
function getForecastIcon(condition) {
    const iconMap = {
        'clear-day': 'wi-day-sunny',
        'clear-night': 'wi-night-clear',
        'partly-cloudy-day': 'wi-day-cloudy',
        'partly-cloudy-night': 'wi-night-alt-cloudy',
        'cloudy': 'wi-cloudy',
        'rain': 'wi-rain',
        'snow': 'wi-snow',
        'fog': 'wi-fog',
        'thunderstorm': 'wi-thunderstorm'
    };

    return iconMap[condition] || 'wi-day-sunny';
}

// Update effects from condition
function updateEffectsFromCondition(condition) {
    // Stop all effects first
    toggleRainEffect(false);
    toggleSnowEffect(false);
    toggleThunderEffect(false);

    rainToggle.classList.remove('active');
    snowToggle.classList.remove('active');
    thunderToggle.classList.remove('active');

    // Reset state
    rainActive = false;
    snowActive = false;
    thunderActive = false;

    // Enable effects based on condition
    if (condition === 'rain' || condition === 'thunderstorm') {
        toggleRainEffect(true);
        rainToggle.classList.add('active');
        rainActive = true;
    }

    if (condition === 'thunderstorm') {
        toggleThunderEffect(true);
        thunderToggle.classList.add('active');
        thunderActive = true;
    }

    if (condition === 'snow') {
        toggleSnowEffect(true);
        snowToggle.classList.add('active');
        snowActive = true;
    }
}

// Draw background based on condition
function drawBackgroundFromCondition(condition) {
    const width = backgroundCanvas.width;
    const height = backgroundCanvas.height;
    const isDay = document.body.classList.contains('night-mode') ? false : true;

    ctx.clearRect(0, 0, width, height);

    let gradient;

    if (condition === 'rain' || condition === 'thunderstorm') {
        // Rainy/stormy background
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isDay) {
            gradient.addColorStop(0, '#4a6fa5');
            gradient.addColorStop(1, '#2c3e50');
        } else {
            gradient.addColorStop(0, '#2c3e50');
            gradient.addColorStop(1, '#1a2530');
        }
    } else if (condition === 'snow') {
        // Snowy background
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isDay) {
            gradient.addColorStop(0, '#a8c0d8');
            gradient.addColorStop(1, '#6b8bab');
        } else {
            gradient.addColorStop(0, '#6b8bab');
            gradient.addColorStop(1, '#4a6fa5');
        }
    } else if (condition === 'fog') {
        // Foggy background
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isDay) {
            gradient.addColorStop(0, '#b8c6cc');
            gradient.addColorStop(1, '#8a9ba8');
        } else {
            gradient.addColorStop(0, '#8a9ba8');
            gradient.addColorStop(1, '#6b7b8a');
        }
    } else if (condition === 'clear-day' || condition === 'clear-night') {
        // Clear background
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isDay) {
            gradient.addColorStop(0, '#6ecbf5');
            gradient.addColorStop(1, '#059ee3');
        } else {
            gradient.addColorStop(0, '#1a2980');
            gradient.addColorStop(1, '#26d0ce');
        }
    } else {
        // Cloudy background
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isDay) {
            gradient.addColorStop(0, '#7a92a8');
            gradient.addColorStop(1, '#4a6fa5');
        } else {
            gradient.addColorStop(0, '#4a6fa5');
            gradient.addColorStop(1, '#2c3e50');
        }
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw clouds if cloudy
    if (condition.includes('cloudy')) {
        drawClouds(isDay, condition);
    }
}

// Draw clouds on canvas
function drawClouds(isDay, condition) {
    const width = backgroundCanvas.width;
    const cloudCount = condition === 'partly-cloudy-day' || condition === 'partly-cloudy-night' ? 3 : 5;

    for (let i = 0; i < cloudCount; i++) {
        const x = (width / cloudCount) * i + (Math.random() * 100 - 50);
        const y = 50 + Math.random() * 150;
        const size = 30 + Math.random() * 40;
        const opacity = isDay ? 0.7 : 0.5;

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        drawCloud(ctx, x, y, size);
    }
}

// Draw a single cloud
function drawCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y + size * 0.3, size * 0.8, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

// Apply theme based on selection
function applyTheme() {
    if (currentTheme === 'light') {
        document.body.classList.remove('night-mode');
    } else if (currentTheme === 'dark') {
        document.body.classList.add('night-mode');
    } else {
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour >= 18;
        document.body.classList.toggle('night-mode', isNight);
    }

    // Redraw background with new theme
    if (currentCondition) {
        drawBackgroundFromCondition(currentCondition);
    }
}

// Rain effect
function toggleRainEffect(enable) {
    if (enable && !rainAnimationId) {
        startRainEffect();
    } else if (!enable && rainAnimationId) {
        cancelAnimationFrame(rainAnimationId);
        rainAnimationId = null;
        weatherEffects.innerHTML = '';
    }
}

function startRainEffect() {
    const drops = [];
    const dropCount = 150;

    for (let i = 0; i < dropCount; i++) {
        drops.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            length: 10 + Math.random() * 20,
            speed: 3 + Math.random() * 7,
            opacity: 0.1 + Math.random() * 0.5
        });
    }

    function animateRain() {
        weatherEffects.innerHTML = '';

        drops.forEach(drop => {
            drop.y += drop.speed;
            if (drop.y > window.innerHeight) {
                drop.y = -20;
                drop.x = Math.random() * window.innerWidth;
            }

            const dropEl = document.createElement('div');
            dropEl.style.position = 'absolute';
            dropEl.style.left = `${drop.x}px`;
            dropEl.style.top = `${drop.y}px`;
            dropEl.style.width = '1px';
            dropEl.style.height = `${drop.length}px`;
            dropEl.style.background = 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.7))';
            dropEl.style.opacity = drop.opacity;
            weatherEffects.appendChild(dropEl);
        });

        rainAnimationId = requestAnimationFrame(animateRain);
    }

    animateRain();
}

// Snow effect
function toggleSnowEffect(enable) {
    if (enable && !snowAnimationId) {
        startSnowEffect();
    } else if (!enable && snowAnimationId) {
        cancelAnimationFrame(snowAnimationId);
        snowAnimationId = null;
        const snowflakes = document.querySelectorAll('.snowflake');
        snowflakes.forEach(flake => flake.remove());
    }
}

function startSnowEffect() {
    const flakes = [];
    const flakeCount = 80;

    for (let i = 0; i < flakeCount; i++) {
        flakes.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 2 + Math.random() * 4,
            speed: 0.5 + Math.random() * 1.5,
            sway: Math.random() * 2 - 1,
            swaySpeed: 0.01 + Math.random() * 0.02,
            swayOffset: Math.random() * Math.PI * 2
        });
    }

    function animateSnow() {
        const snowflakes = document.querySelectorAll('.snowflake');
        snowflakes.forEach(flake => flake.remove());

        flakes.forEach(flake => {
            flake.y += flake.speed;
            flake.x += Math.sin(Date.now() * flake.swaySpeed + flake.swayOffset) * flake.sway;

            if (flake.y > window.innerHeight) {
                flake.y = -10;
                flake.x = Math.random() * window.innerWidth;
            }
            if (flake.x > window.innerWidth) flake.x = 0;
            if (flake.x < 0) flake.x = window.innerWidth;

            const flakeEl = document.createElement('div');
            flakeEl.className = 'snowflake';
            flakeEl.style.position = 'absolute';
            flakeEl.style.left = `${flake.x}px`;
            flakeEl.style.top = `${flake.y}px`;
            flakeEl.style.width = `${flake.radius * 2}px`;
            flakeEl.style.height = `${flake.radius * 2}px`;
            flakeEl.style.borderRadius = '50%';
            flakeEl.style.background = 'white';
            flakeEl.style.opacity = '0.9';
            flakeEl.style.boxShadow = '0 0 5px white';
            weatherEffects.appendChild(flakeEl);
        });

        snowAnimationId = requestAnimationFrame(animateSnow);
    }

    animateSnow();
}

// Thunder effect
function toggleThunderEffect(enable) {
    if (enable && !thunderIntervalId) {
        startThunderEffect();
    } else if (!enable && thunderIntervalId) {
        clearInterval(thunderIntervalId);
        thunderIntervalId = null;
    }
}

function startThunderEffect() {
    // Initial flash
    setTimeout(() => {
        flashThunder();
    }, 500);

    // Random flashes
    thunderIntervalId = setInterval(() => {
        if (Math.random() > 0.6) {
            flashThunder();
        }
    }, 2000 + Math.random() * 5000);
}

function flashThunder() {
    // First flash
    thunderFlash.style.opacity = '0.8';

    setTimeout(() => {
        thunderFlash.style.opacity = '0';
    }, 80);

    // Second flash (sometimes)
    if (Math.random() > 0.5) {
        setTimeout(() => {
            thunderFlash.style.opacity = '0.5';

            setTimeout(() => {
                thunderFlash.style.opacity = '0';
            }, 40);
        }, 150 + Math.random() * 150);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);