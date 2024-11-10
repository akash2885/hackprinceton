import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from gen_data import generate_data

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route("/nearby-cities", methods=["POST"])
def get_nearby_cities():
    data = request.json  # Retrieve JSON data from the request
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Extract mainCity and nearbyCities from the received data
    main_city = data.get("mainCity")
    nearby_cities = data.get("nearbyCities")
    city_names = [main_city]
    city_names.extend(city['name'] for city in nearby_cities)

    data = generate_data(city_names)

    main_city_data = data.get(main_city)
    other_cities_dict = {city_name: city_data for city_name, city_data in data.items() if city_name != main_city}

    # Construct the response data
    response_data = {
        "currentCity": {
            "name": main_city,
            **(main_city_data or {})  # Use an empty dict if main_city_data is not found
        },
        "otherCities": other_cities_dict
    }

    # Example processing: return a success response with the cities received
    return jsonify(response_data)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)