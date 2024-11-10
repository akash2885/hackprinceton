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
    other_city_names = [city['name'] for city in nearby_cities]
    
    if not main_city or not nearby_cities:
        return jsonify({"error": "Invalid data structure. Expected 'mainCity' and 'nearbyCities' fields."}), 400

    data = generate_data(other_city_names)

    # Example processing: return a success response with the cities received
    return jsonify({
        "data": data
    })


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)