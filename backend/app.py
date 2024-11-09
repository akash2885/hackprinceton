import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# def get_city_id(city_name):
#     """Fetch the city ID for a given city name."""
#     url = "http://geodb-free-service.wirefreethought.com/v1/geo/cities"
#     params = {
#         "namePrefix": city_name,
#         "limit": 1,
#         "types": "CITY"
#     }
#     response = requests.get(url, params=params)
#     if response.status_code == 200:
#         data = response.json().get("data")
#         if data:
#             return data[0]["id"]  # Return the first matching city's ID
#         else:
#             print(f"City '{data}' not found.")
#             return None
#     else:
#         print("Error fetching city details:", response.status_code)
#         return None

# @app.route("/nearby-cities/<city_name>", methods=["GET"])
# def get_nearby_cities(city_name):
#     location_id = get_city_id(city_name)
#     print(location_id)
#     url = f"http://geodb-free-service.wirefreethought.com/v1/geo/places/{location_id}/nearbyPlaces"
    
#     if not location_id:
#         return
#     params = {
#         "limit": 5,
#         "offset": 0,
#         "minPopulation": 25000,
#         "radius": 100000
#     }
    
#     response = requests.get(url, params=params)
#     if response.status_code == 200:
#         data = response.json().get("data")
#         return jsonify(data)
#     else:
#         return jsonify({"error": "Error fetching nearby cities"}), response.status_code

@app.route("/nearby-cities", methods=["POST"])
def get_nearby_cities():
    data = request.json  # Retrieve JSON data from the request
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Access specific fields from JSON if needed, e.g., "cities"
    cities = data.get("cities")
    if not cities:
        return jsonify({"error": "No cities data provided"}), 400

    # Process the cities data as needed
    # Example: return a success response with the cities received
    return jsonify({"message": "Cities received successfully", "cities": cities})
