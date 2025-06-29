from dotenv import load_dotenv
import os, requests

load_dotenv()
API_KEY = os.getenv('API_KEY')

def get_current_weather(city=None, lat=None, lon=None, units='metric'):
    if city:
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units={units}'
    elif lat and lon:
        url = f'http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units={units}'
    else:
        return None
    return requests.get(url).json()

def get_forecast(city=None, lat=None, lon=None, units='metric'):
    if city:
        url = f'http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units={units}'
    elif lat and lon:
        url = f'http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units={units}'
    else:
        return None
    return requests.get(url).json()
