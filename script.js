document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const weatherContainer = document.getElementById('weatherContainer');
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const locationBtn = document.getElementById('locationBtn');
    const currentTemp = document.getElementById('currentTemp');
    const cityName = document.getElementById('cityName');
    const weatherDesc = document.getElementById('weatherDesc');
    const windSpeed = document.getElementById('windSpeed');
    const humidity = document.getElementById('humidity');
    const pressure = document.getElementById('pressure');
    const weatherIcon = document.getElementById('weatherIcon');
    const forecastDays = document.getElementById('forecastDays');
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    // API Key - Replace with your actual OpenWeatherMap API key
    const API_KEY = '9ca0b1230abd6528bad9efa3075e75f5';
    let currentTheme = 'light';
    
    // Make container draggable
    let isDragging = false;
    let offsetX, offsetY;
    
    weatherContainer.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'I') {
            return;
        }
        isDragging = true;
        offsetX = e.clientX - weatherContainer.getBoundingClientRect().left;
        offsetY = e.clientY - weatherContainer.getBoundingClientRect().top;
        weatherContainer.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        weatherContainer.style.left = `${x}px`;
        weatherContainer.style.top = `${y}px`;
        weatherContainer.style.position = 'absolute';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        weatherContainer.style.cursor = 'grab';
    });
    
    // Theme switcher
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            currentTheme = theme;
            
            // Update active button
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Weather icon mapping
    const weatherIcons = {
        '01d': 'fas fa-sun',          // clear sky (day)
        '01n': 'fas fa-moon',         // clear sky (night)
        '02d': 'fas fa-cloud-sun',    // few clouds (day)
        '02n': 'fas fa-cloud-moon',   // few clouds (night)
        '03d': 'fas fa-cloud',        // scattered clouds
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',        // broken clouds
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',   // shower rain
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain', // rain (day)
        '10n': 'fas fa-cloud-moon-rain', // rain (night)
        '11d': 'fas fa-bolt',         // thunderstorm
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',    // snow
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',        // mist
        '50n': 'fas fa-smog'
    };
    
    // Fetch weather data
    async function fetchWeather(city) {
        try {
            // Current weather
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            );
            const currentData = await currentResponse.json();
            
            if (currentData.cod !== 200) {
                throw new Error(currentData.message);
            }
            
            // Forecast
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
            );
            const forecastData = await forecastResponse.json();
            
            displayWeather(currentData, forecastData);
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error('Error fetching weather data:', error);
        }
    }
    
    // Fetch weather by geolocation
    function fetchWeatherByLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Current weather
                        const currentResponse = await fetch(
                            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                        );
                        const currentData = await currentResponse.json();
                        
                        // Forecast
                        const forecastResponse = await fetch(
                            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                        );
                        const forecastData = await forecastResponse.json();
                        
                        displayWeather(currentData, forecastData);
                    } catch (error) {
                        alert(`Error: ${error.message}`);
                        console.error('Error fetching weather data:', error);
                    }
                },
                (error) => {
                    alert(`Geolocation error: ${error.message}`);
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    }
    
    // Display weather data
    function displayWeather(currentData, forecastData) {
        // Current weather
        cityName.textContent = `${currentData.name}, ${currentData.sys.country}`;
        currentTemp.textContent = Math.round(currentData.main.temp);
        weatherDesc.textContent = currentData.weather[0].description;
        windSpeed.textContent = `${Math.round(currentData.wind.speed * 3.6)} km/h`;
        humidity.textContent = `${currentData.main.humidity}%`;
        pressure.textContent = `${currentData.main.pressure} hPa`;
        
        // Weather icon
        const iconCode = currentData.weather[0].icon;
        weatherIcon.innerHTML = `<i class="${weatherIcons[iconCode] || 'fas fa-question'}"></i>`;
        
        // Change background based on weather condition
        changeBackgroundColor(currentData.weather[0].main);
        
        // Forecast
        forecastDays.innerHTML = '';
        
        // Group forecast by day
        const dailyForecast = {};
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            if (!dailyForecast[day]) {
                dailyForecast[day] = {
                    temps: [],
                    icons: [],
                    descriptions: []
                };
            }
            
            dailyForecast[day].temps.push(item.main.temp);
            dailyForecast[day].icons.push(item.weather[0].icon);
            dailyForecast[day].descriptions.push(item.weather[0].description);
        });
        
        // Display 5-day forecast
        Object.keys(dailyForecast).slice(0, 5).forEach(day => {
            const dayData = dailyForecast[day];
            const maxTemp = Math.round(Math.max(...dayData.temps));
            const minTemp = Math.round(Math.min(...dayData.temps));
            
            // Get most frequent icon
            const iconCounts = {};
            dayData.icons.forEach(icon => {
                iconCounts[icon] = (iconCounts[icon] || 0) + 1;
            });
            const mostFrequentIcon = Object.keys(iconCounts).reduce((a, b) => 
                iconCounts[a] > iconCounts[b] ? a : b
            );
            
            const forecastDayElement = document.createElement('div');
            forecastDayElement.className = 'forecast-day';
            forecastDayElement.innerHTML = `
                <h3>${day}</h3>
                <div class="forecast-icon"><i class="${weatherIcons[mostFrequentIcon] || 'fas fa-question'}"></i></div>
                <div class="forecast-temp">
                    <span class="temp-high">${maxTemp}°</span>
                    <span class="temp-low">${minTemp}°</span>
                </div>
            `;
            
            forecastDays.appendChild(forecastDayElement);
        });
        
        // Animate appearance
        document.querySelector('.current-weather').style.animation = 'fadeIn 1s ease';
        document.querySelector('.forecast-container').style.animation = 'fadeIn 1.2s ease';
    }
    
    // Function to change background color based on weather condition
    function changeBackgroundColor(weatherCondition) {
        const body = document.body;
        
        const backgrounds = {
            'Clear': '#87CEFA',  // Light blue for clear weather
            'Clouds': '#D3D3D3',  // Light gray for cloudy weather
            'Rain': '#1E90FF',  // Blue for rain
            'Thunderstorm': '#A9A9A9',  // Dark gray for thunderstorms
            'Snow': '#F0F8FF',  // Light snow color
            'Mist': '#C0C0C0',  // Light mist color
            'Drizzle': '#00BFFF',  // Light drizzle color
            'Haze': '#F4A300'  // Orange haze
        };
        
        // Set background color based on weather
        body.style.backgroundColor = backgrounds[weatherCondition] || '#f0f0f0'; // Default color if no match
    }
    
    // Event listeners
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        } else {
            alert('Please enter a city name');
        }
    });
    
    locationBtn.addEventListener('click', fetchWeatherByLocation);
    
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeather(city);
            }
        }
    });
    
    // Initialize with default city
    //fetchWeather('London');
});