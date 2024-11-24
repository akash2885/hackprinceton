import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from gen_data import generate_data
from moving_guide import generate_money_cost_calculator

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
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


@app.route("/city-details/<city>")
def get_city_details(city):
    response = generate_money_cost_calculator(city)
    return jsonify(response)


from transformers import pipeline

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def get_wikipedia_page(city_name, state_name):
    """Fetch Wikipedia page information for the city."""
    search_url = f"https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": city_name + ",_" + state_name,
        "utf8": 1,
        "srlimit": 1
    }
    
    response = requests.get(search_url, params=params)
    if response.status_code == 200:
        search_results = response.json()
        if search_results.get("query", {}).get("search"):
            page_title = search_results["query"]["search"][0]["title"]
            page_url = f"https://en.wikipedia.org/wiki/{page_title.replace(' ', '_')}"
            return page_title, page_url
    return None, None




def fetch_wikipedia_content(page_title):
    """Fetch the full content of a Wikipedia page."""
    url = f"https://en.wikipedia.org/w/api.php"
    params = {
        "action": "parse",
        "page": page_title,
        "format": "json",
        "prop": "text",
        "utf8": 1
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return data.get("parse", {}).get("text", {}).get("*", "")
    return ""

def extract_economy_section(html_content):
    """Extract and summarize the 'Economy' section from HTML content."""
    import re
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html_content, "html.parser")
    paragraphs = soup.find_all('p')
    economy_text = ""

    # Find the "Economy" section in the text
    found_economy = False
    for paragraph in paragraphs:
        text = paragraph.get_text()
        if "Economy" in text or "economy" in text or "employers" in text or "companies" in text or "income" in text or "industries" in text and not found_economy:
            found_economy = True
        if found_economy:
            economy_text += text
            # Stop after collecting enough content
            if len(economy_text) > 1000: 
                break

    if economy_text:
        # Summarize the extracted economy text
        summary = summarizer(economy_text, max_length=150, min_length=50, do_sample=False)
        return summary[0]['summary_text']
    return "No specific economy section found."

@app.route('/api/getCitySummary', methods=['GET'])
def get_city_summary():
    city = request.args.get('city')
    state = request.args.get('state')
    if not city:
        return jsonify({"error": "City name is required"}), 400

    # Step 1: Fetch the Wikipedia page URL
    page_title, page_url = get_wikipedia_page(city, state)
    if not page_title:
        return jsonify({"error": "City not found on Wikipedia"}), 404

    # Step 2: Fetch the full content of the Wikipedia page
    full_content = fetch_wikipedia_content(page_title)

    # Step 3: Extract the "Economy" section and summarize it
    economy_summary = extract_economy_section(full_content)

    return jsonify({
        "city": city,
        "wikipedia_url": page_url,
        "summary": economy_summary
    })
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)