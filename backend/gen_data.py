from dotenv import load_dotenv
from langchain_core.tools import Tool
from langchain_google_community import GoogleSearchAPIWrapper
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import yaml
import os
import json

load_dotenv()

# environment variables
openai_api_key = os.environ.get("OPENAI_API_KEY")
os.environ.get("GOOGLE_CSE_ID")
os.environ.get("GOOGLE_API_KEY")

# initialize GoogleSearchAPI and OpenAIAPI
search = GoogleSearchAPIWrapper()
tool = Tool(
    name="google_search",
    description="Search Google and return the best results",
    func=search.run,
)
chat_model = ChatOpenAI(openai_api_key=openai_api_key)


def get_google_prompts(cities):
    search_results = {}
    
    # Define the query templates
    queries = {
        "cost_of_living": "Average Monthly Cost of Living {city}",
        "average_home_price": "Average Home Price in {city}",
        "average_salary": "Average Yearly Salary in {city}",
        "average_rent": "Average Monthly Rent in {city}"
    }
    
    # Loop through each city in the cities list
    for city in cities:
        city_results = {}
        
        # Perform each search type for the current city
        for key, query_template in queries.items():
            query = query_template.format(city=city)  # Format the query
            search_result = tool.run(query)         # Execute the search
            
            # Store the result under the specific key (cost_of_living, etc.)
            city_results[key] = search_result
        
        # Store all results for this city
        search_results[city] = city_results

    return search_results



def generate_data(cities):
    search_results = get_google_prompts(cities)
    messages = []
    messages.append(HumanMessage(content=f"Analyze the Google Results Below: \n{search_results}"))
    messages.append(HumanMessage(content="""
    Based on the information provided, answer these 4 questions for each city:
        Average Salary (yearly):
        Average Rent (monthly):
        Average Cost of Living With Rent (monthly):
        Average Home Price:

                                
    Return only the numbers, no additional text or formatting.
    Provide information in a clean YAML format with no additional symbols, such as asterisks, hyphens or parentheses. Each section should contain only the content without extra formatting or emphasis symbols.
                          
    this is just an example of the format:

    New York:
      name: New York
      average_salary: ...
      average_rent: ...
      cost_of_living: ...
      home_price: ...
    San Francisco:
      name: San Francisco
      average_salary: ...
      average_rent: ...
      cost_of_living: ...
      home_price: ...
    Chicago:
      name: Chicago
      average_salary: ...
      average_rent: ...
      cost_of_living: ...
      home_price: ...
    Austin:
      name: Austin
      average_salary: ...
      average_rent: ...
      cost_of_living: ...
      home_price: ...                             
    """))

    response = chat_model.invoke(messages)

    # Parse the YAML string into a Python dictionary
    data_dict = yaml.safe_load(response.content)

    # # Convert the dictionary to a JSON string
    # json_data = json.dumps(data_dict, indent=2)
    # print(json_data)
    return data_dict