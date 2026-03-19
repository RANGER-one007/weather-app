// API Configuration
const API_KEY = 'c7def7f0587a48be82c53232260702';
const BASE_URL = 'https://api.weatherapi.com/v1';

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

// Initialize
function initApp() {
    setupEventListeners();
    setupCanvas();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    // Start with Chennai
    getWeatherByCity('Chennai');
}

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
            cityInput.value = '';
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });

    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            loadingOverlay.style.display = 'flex';
            navigator.geolocation.getCurrentPosition(
                position => {
                    getWeatherByCoords(position.coords.latitude, position.coords.longitude);
                },
                error => {
                    alert('Location access denied. Showing Chennai weather.');
                    getWeatherByCity('Chennai');
                }
            );
        } else {
            alert('Geolocation not supported. Showing Chennai weather.');
            getWeatherByCity('Chennai');
        }
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

// Canvas setup
function setupCanvas() {
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        backgroundCanvas.width = window.innerWidth;
        backgroundCanvas.height = window.innerHeight;
        if (currentCondition) drawBackgroundFromCondition(currentCondition);
    });
}

// Update date/time
function updateDateTime() {
    const now = new Date();
    dateTimeElement.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    if (currentTheme === 'auto') {
        const hour = now.getHours();
        document.body.classList.toggle('night-mode', hour < 6 || hour >= 18);
    }
    lastUpdateElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Fetch weather by city name
async function getWeatherByCity(city) {
    try {
        loadingOverlay.style.display = 'flex';
        const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no`;
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            updateUI(data);
        } else {
            alert(data.error ? data.error.message || 'City not found' : 'Error fetching weather');
            // Fallback to Chennai if needed
            if (city.toLowerCase() !== 'chennai') getWeatherByCity('Chennai');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
    }
}

// Fetch weather by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        loadingOverlay.style.display = 'flex';
        const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=no`;
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) updateUI(data);
        else alert('Location error');
    } catch (error) {
        alert('Network error');
    } finally {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
    }
}

// Update UI with real data
function updateUI(data) {
    const current = data.current;
    const location = data.location;
    const forecast = data.forecast.forecastday;

    // Location
    locationElement.textContent = `${location.name}, ${location.country}`;

    // Current weather
    temperatureElement.textContent = Math.round(current.temp_c);
    weatherDescriptionElement.textContent = current.condition.text;
    windElement.textContent = `${current.wind_kph} km/h`;
    humidityElement.textContent = `${current.humidity}%`;
    feelsLikeElement.textContent = `${Math.round(current.feelslike_c)}°C`;
    pressureElement.textContent = `${current.pressure_mb} hPa`;
    visibilityElement.textContent = `${current.vis_km} km`;

    // Sunrise/Sunset (from forecast day 0)
    const astro = forecast[0].astro;
    sunriseElement.textContent = astro.sunrise;
    sunsetElement.textContent = astro.sunset;

    // Weather icon
    const iconCode = current.condition.icon.split('/').pop().split('.')[0]; // e.g., 113
    const isDay = current.is_day ? 'day' : 'night';
    updateWeatherIcon(iconCode, isDay);

    // Effects
    updateEffectsFromCondition(current.condition.text);

    // Draw background
    currentCondition = current.condition.text.toLowerCase();
    drawBackgroundFromCondition(currentCondition);

    // Forecast
    updateForecast(forecast);

    // Apply theme
    applyTheme();
}

// Map icon code to weather-icons class
function updateWeatherIcon(iconCode, isDay) {
    // Mapping for common codes: 113=Sunny, 116=Partly cloudy, 119=Cloudy, etc.
    const iconMap = {
        '113': isDay === 'day' ? 'wi-day-sunny' : 'wi-night-clear',
        '116': isDay === 'day' ? 'wi-day-cloudy' : 'wi-night-alt-cloudy',
        '119': 'wi-cloudy',
        '122': 'wi-cloudy',
        '143': 'wi-fog',
        '176': 'wi-rain',
        '179': 'wi-snow',
        '182': 'wi-sleet',
        '185': 'wi-sleet',
        '200': 'wi-thunderstorm',
        '227': 'wi-snow',
        '230': 'wi-snow',
        '248': 'wi-fog',
        '260': 'wi-fog',
        '263': 'wi-rain',
        '266': 'wi-rain',
        '281': 'wi-rain',
        '284': 'wi-sleet',
        '293': 'wi-rain',
        '296': 'wi-rain',
        '299': 'wi-rain',
        '302': 'wi-rain',
        '305': 'wi-rain',
        '308': 'wi-rain',
        '311': 'wi-rain',
        '314': 'wi-rain',
        '317': 'wi-rain',
        '320': 'wi-snow',
        '323': 'wi-snow',
        '326': 'wi-snow',
        '329': 'wi-snow',
        '332': 'wi-snow',
        '335': 'wi-snow',
        '338': 'wi-snow',
        '350': 'wi-sleet',
        '353': 'wi-rain',
        '356': 'wi-rain',
        '359': 'wi-rain',
        '362': 'wi-rain',
        '365': 'wi-rain',
        '368': 'wi-snow',
        '371': 'wi-snow',
        '374': 'wi-sleet',
        '377': 'wi-sleet',
        '386': 'wi-thunderstorm',
        '389': 'wi-thunderstorm',
        '392': 'wi-snow-thunderstorm',
        '395': 'wi-snow-thunderstorm'
    };
    const iconClass = iconMap[iconCode] || (isDay === 'day' ? 'wi-day-sunny' : 'wi-night-clear');
    weatherIconElement.className = `wi ${iconClass}`;
}

// Update forecast
function updateForecast(forecastDays) {
    forecastContainer.innerHTML = '';
    forecastDays.forEach((day, index) => {
        const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = day.day.condition.icon.split('/').pop().split('.')[0];
        const iconClass = getForecastIcon(iconCode);
        const card = document.createElement('div');
        card.className = 'forecast-day';
        card.innerHTML = `
            <h4>${index === 0 ? 'Today' : date}</h4>
            <i class="wi ${iconClass} forecast-icon"></i>
            <p>${day.day.condition.text}</p>
            <div class="forecast-temp">
                <span>${Math.round(day.day.maxtemp_c)}°</span>
                <span>${Math.round(day.day.mintemp_c)}°</span>
            </div>
        `;
        forecastContainer.appendChild(card);
    });
}

function getForecastIcon(iconCode) {
    const iconMap = {
        '113': 'wi-day-sunny',
        '116': 'wi-day-cloudy',
        '119': 'wi-cloudy',
        '122': 'wi-cloudy',
        '143': 'wi-fog',
        '176': 'wi-rain',
        '179': 'wi-snow',
        '182': 'wi-sleet',
        '185': 'wi-sleet',
        '200': 'wi-thunderstorm',
        '227': 'wi-snow',
        '230': 'wi-snow',
        '248': 'wi-fog',
        '260': 'wi-fog',
        '263': 'wi-rain',
        '266': 'wi-rain',
        '281': 'wi-rain',
        '284': 'wi-sleet',
        '293': 'wi-rain',
        '296': 'wi-rain',
        '299': 'wi-rain',
        '302': 'wi-rain',
        '305': 'wi-rain',
        '308': 'wi-rain',
        '311': 'wi-rain',
        '314': 'wi-rain',
        '317': 'wi-rain',
        '320': 'wi-snow',
        '323': 'wi-snow',
        '326': 'wi-snow',
        '329': 'wi-snow',
        '332': 'wi-snow',
        '335': 'wi-snow',
        '338': 'wi-snow',
        '350': 'wi-sleet',
        '353': 'wi-rain',
        '356': 'wi-rain',
        '359': 'wi-rain',
        '362': 'wi-rain',
        '365': 'wi-rain',
        '368': 'wi-snow',
        '371': 'wi-snow',
        '374': 'wi-sleet',
        '377': 'wi-sleet',
        '386': 'wi-thunderstorm',
        '389': 'wi-thunderstorm',
        '392': 'wi-snow-thunderstorm',
        '395': 'wi-snow-thunderstorm'
    };
    return iconMap[iconCode] || 'wi-day-sunny';
}

// Update effects based on condition text
function updateEffectsFromCondition(conditionText) {
    const cond = conditionText.toLowerCase();
    toggleRainEffect(false);
    toggleSnowEffect(false);
    toggleThunderEffect(false);
    rainToggle.classList.remove('active');
    snowToggle.classList.remove('active');
    thunderToggle.classList.remove('active');
    rainActive = snowActive = thunderActive = false;

    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder')) {
        toggleRainEffect(true);
        rainToggle.classList.add('active');
        rainActive = true;
    }
    if (cond.includes('thunder')) {
        toggleThunderEffect(true);
        thunderToggle.classList.add('active');
        thunderActive = true;
    }
    if (cond.includes('snow') || cond.includes('blizzard') || cond.includes('sleet')) {
        toggleSnowEffect(true);
        snowToggle.classList.add('active');
        snowActive = true;
    }
}

// Background drawing
function drawBackgroundFromCondition(condition) {
    const width = backgroundCanvas.width;
    const height = backgroundCanvas.height;
    const isNight = document.body.classList.contains('night-mode');
    ctx.clearRect(0, 0, width, height);
    let gradient;
    if (condition.includes('rain') || condition.includes('thunder')) {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, isNight ? '#2c3e50' : '#4a6fa5');
        gradient.addColorStop(1, isNight ? '#1a2530' : '#2c3e50');
    } else if (condition.includes('snow')) {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, isNight ? '#6b8bab' : '#a8c0d8');
        gradient.addColorStop(1, isNight ? '#4a6fa5' : '#6b8bab');
    } else if (condition.includes('fog') || condition.includes('mist')) {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, isNight ? '#8a9ba8' : '#b8c6cc');
        gradient.addColorStop(1, isNight ? '#6b7b8a' : '#8a9ba8');
    } else if (condition.includes('clear') || condition.includes('sunny')) {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, isNight ? '#1a2980' : '#6ecbf5');
        gradient.addColorStop(1, isNight ? '#26d0ce' : '#059ee3');
    } else {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, isNight ? '#4a6fa5' : '#7a92a8');
        gradient.addColorStop(1, isNight ? '#2c3e50' : '#4a6fa5');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    if (condition.includes('cloud') && !condition.includes('clear')) {
        drawClouds(isNight, condition);
    }
}

function drawClouds(isNight, condition) {
    const width = backgroundCanvas.width;
    const cloudCount = condition.includes('partly') ? 3 : 5;
    for (let i = 0; i < cloudCount; i++) {
        const x = (width / cloudCount) * i + (Math.random() * 100 - 50);
        const y = 50 + Math.random() * 150;
        const size = 30 + Math.random() * 40;
        const opacity = isNight ? 0.5 : 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        drawCloud(ctx, x, y, size);
    }
}

function drawCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y + size * 0.3, size * 0.8, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

// Apply theme
function applyTheme() {
    if (currentTheme === 'light') document.body.classList.remove('night-mode');
    else if (currentTheme === 'dark') document.body.classList.add('night-mode');
    else {
        const hour = new Date().getHours();
        document.body.classList.toggle('night-mode', hour < 6 || hour >= 18);
    }
    if (currentCondition) drawBackgroundFromCondition(currentCondition);
}

// ---------- ORIGINAL EFFECT FUNCTIONS (Rain, Snow, Thunder) ----------
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
// ---------- END OF ORIGINAL EFFECT FUNCTIONS ----------

// Initialize
document.addEventListener('DOMContentLoaded', initApp);