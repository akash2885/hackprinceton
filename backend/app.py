from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions"
PERPLEXITY_API_TOKEN = os.environ.get("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")

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
    # data = request.json  # Retrieve JSON data from the request
    # if not data:
    #     return jsonify({"error": "No data provided"}), 400
    
    # # Extract mainCity and nearbyCities from the received data
    # main_city = data.get("mainCity")
    # nearby_cities = data.get("nearbyCities")
    
    # if not main_city or not nearby_cities:
    #     return jsonify({"error": "Invalid data structure. Expected 'mainCity' and 'nearbyCities' fields."}), 400

    # # Organize the main city and nearby cities in a dictionary
    # organized_data = {
    #     "mainCity": main_city,
    #     "otherCities": nearby_cities
    # }
    data = request.json  # Retrieve JSON data from the request
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Extract mainCity and nearbyCities from the received data
    main_city = data.get("mainCity")
    nearby_cities = data.get("nearbyCities")
    
    if not main_city or not nearby_cities:
        return jsonify({"error": "Invalid data structure. Expected 'mainCity' and 'nearbyCities' fields."}), 400

    # Example processing: return a success response with the cities received
    return jsonify({
        "message": "Cities received successfully",
        "mainCity": main_city,
        "nearbyCities": nearby_cities
    })


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)