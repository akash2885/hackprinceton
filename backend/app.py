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

# "{
#   "chapel_hill": {
#     "average_salary": 54143,
#     "average_rent": 1946,
#     "average_cost_of_living_with_rent": 2619,
#     "average_home_price": 612672
#   },
#   "cary": {
#     "average_salary": 59370,
#     "average_rent": 1645,
#     "average_cost_of_living_with_rent": 2383,
#     "average_home_price": 623359
#   },
#   "apex": {
#     "average_salary": 42054,
#     "average_rent": 1638,
#     "average_cost_of_living_with_rent": 2383,
#     "average_home_price": 611264
#   },
#   "raleigh": {
#     "average_salary": 70813,
#     "average_rent": 1585,
#     "average_cost_of_living_with_rent": 2307,
#     "average_home_price": 438803
#   },
#   "wake_forest": {
#     "average_salary": 61159,
#     "average_rent": 1635,
#     "average_cost_of_living_with_rent": 2307,
#     "average_home_price": 520908
#   }
# }"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)