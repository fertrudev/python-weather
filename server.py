from flask import Flask, render_template, request, jsonify
from weather import get_current_weather, get_forecast
from waitress import serve

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/weather')
def api_weather():
    units = request.args.get('units', 'metric')
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if lat and lon:
        current = get_current_weather(lat=lat, lon=lon, units=units)
        forecast = get_forecast(lat=lat, lon=lon, units=units)
    elif city:
        current = get_current_weather(city=city, units=units)
        forecast = get_forecast(city=city, units=units)
    else:
        return jsonify({'error': 'Faltan parámetros de ubicación'}), 400

    if not current or current.get("cod") != 200:
        return jsonify({'error': 'City is not found'}), 404

    data = {
        'current': {
            'city': current['name'],
            'temp': current['main']['temp'],
            'feels_like': current['main']['feels_like'],
            'humidity': current['main']['humidity'],
            'wind_speed': current['wind']['speed'],
            'desc': current['weather'][0]['description'],
            'icon': current['weather'][0]['icon'],
            'lat': current['coord']['lat'],
            'lon': current['coord']['lon'],
        },
        'forecast': []
    }

    if forecast and forecast.get('cod') == '200':
        for item in forecast['list'][:16]:
            data['forecast'].append({
                'dt': item['dt_txt'],
                'temp': item['main']['temp'],
                'icon': item['weather'][0]['icon']
            })

    return jsonify(data)

@app.route('/weather')
def weather_page():
    return render_template('index.html')

if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8000)

