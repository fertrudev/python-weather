const form = document.getElementById('form'),
  cityEl = document.getElementById('city'),
  alertEl = document.getElementById('alert'),
  resEl = document.getElementById('result'),
  unitsEl = document.getElementById('windUnit'),
  cityName = document.getElementById('cityName'),
  icon = document.getElementById('icon'),
  desc = document.getElementById('desc'),
  temp = document.getElementById('temp'),
  feels = document.getElementById('feels'),
  hum = document.getElementById('hum'),
  wind = document.getElementById('wind'),
  toggleUnitsBtn = document.getElementById('toggleUnits'), 
  celsiusOption = document.querySelector('.toggle-option[data-unit="metric"]'),
  fahrenheitOption = document.querySelector('.toggle-option[data-unit="imperial"]'); 

let currentUnits = localStorage.getItem('units') || 'metric',
  chart,
  lastCity = '';


function updateToggleVisuals() {
  if (currentUnits === 'imperial') {
    toggleUnitsBtn.setAttribute('aria-pressed', 'true');
    celsiusOption.classList.remove('active');
    fahrenheitOption.classList.add('active');
  } else {
    toggleUnitsBtn.setAttribute('aria-pressed', 'false');
    fahrenheitOption.classList.remove('active');
    celsiusOption.classList.add('active');
  }
}


updateToggleVisuals();

form.onsubmit = (e) => {
  e.preventDefault();
  const city = cityEl.value.trim();
  if (!city) return;
  fetchWeather(city);
};

toggleUnitsBtn.onclick = () => {
  if (currentUnits === 'metric') {
    currentUnits = 'imperial';
  } else {
    currentUnits = 'metric';
  }
  localStorage.setItem('units', currentUnits);
  updateToggleVisuals(); 

  if (lastCity) {
    fetchWeather(lastCity);
  }
};

async function fetchWeather(city) {
  alertEl.innerHTML = `<span class="spinner" aria-hidden="true"></span>`;
  alertEl.style.display = 'block';
  resEl.style.display = 'none';

  try {
    const res = await fetch(`/api/weather?city=${city}&units=${currentUnits}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showWeather(data);
    lastCity = city;
  } catch (e) {
    alertEl.textContent = e.message || "An error occurred. Please try again.";
    alertEl.style.display = 'block';
    cityEl.focus();
  }
}

function showWeather(data) {
  const c = data.current;
  cityName.textContent = c.city;
  desc.textContent = c.desc;
  temp.textContent = c.temp.toFixed(1);
  feels.textContent = c.feels_like.toFixed(1);
  hum.textContent = c.humidity;
  wind.textContent = c.wind_speed.toFixed(1);
  unitsEl.textContent = currentUnits === 'metric' ? 'm/s' : 'mph';
  icon.src = `https://openweathermap.org/img/wn/${c.icon}@4x.png`;
  icon.alt = `Weather icon showing ${c.desc}`;

  const labels = data.forecast.map((f) => f.dt.split(' ')[1].slice(0, 5)),
    temps = data.forecast.map((f) => f.temp);

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('chart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Forecast (${currentUnits === 'metric' ? '°C' : '°F'})`,
        data: temps,
        borderColor: '#9b59b6',
        backgroundColor: 'rgba(155,89,182,0.3)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#eee', font: { weight: '600' } }
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#9b59b6',
          titleFont: { weight: '600' },
          bodyFont: { weight: '400' }
        }
      },
      scales: {
        x: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        y: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } }
      }
    }
  });

  alertEl.style.display = 'none';
  resEl.style.display = 'flex';
}

// Geolocation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    alertEl.innerHTML = `<span class="spinner" aria-hidden="true"></span>`;
    alertEl.style.display = 'block';
    resEl.style.display = 'none';

    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}&units=${currentUnits}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showWeather(data);
      lastCity = data.current.city;
      updateToggleVisuals(); 
    } catch {
      alertEl.textContent = "Unable to retrieve weather for your location.";
      alertEl.style.display = 'block';
      resEl.style.display = 'none';
    }
  }, () => {
    alertEl.textContent = "To view the weather, please enter a city.";
    alertEl.style.display = 'block';
    resEl.style.display = 'none';
  });
} else {
  alertEl.textContent = "Geolocation is not supported. Please enter a city.";
  alertEl.style.display = 'block';
  resEl.style.display = 'none';
}
