from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

def get_city_id(city_name):
    """Fetch the city ID for a given city name."""
    url = "http://geodb-free-service.wirefreethought.com/v1/geo/cities"
    params = {
        "namePrefix": city_name,
        "limit": 1,
        "types": "CITY"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json().get("data")
        if data:
            return data[0]["id"]  # Return the first matching city's ID
        else:
            print(f"City '{data}' not found.")
            return None
    else:
        print("Error fetching city details:", response.status_code)
        return None

print(get_city_id("Durham"))