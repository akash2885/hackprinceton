import os
import requests
import yaml

PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions"
PERPLEXITY_API_TOKEN = os.environ.get("PERPLEXITY_API_TOKEN")

def cost_of_living(example_city: str):

    payload = {
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": [
            {
                "role": "system",
                "content": f"""Please help me find the average cost of living for {example_city}. Format your response as valid YAML with the following rules:
- Do not use colons within value strings
- Use '-' for list items
- Use key_names_with_underscores
- Structure data hierarchically
- Start response with three backticks and yaml
- End response with three backticks"""
            },
            {
                "role": "user",
                "content": """Provide cost of living information in this YAML structure:

```yaml
city_name:
  housing:
    rent_1bed: value
    rent_2bed: value
    home_price: value
  daily_costs:
    meal_out: value
    coffee: value
    transport: value
  monthly_costs:
    utilities: value
    internet: value
    groceries: value
  salary:
    average_salary: value""",
            }
        ],
        "temperature": 0.2,
        "top_p": 0.9,
        "return_citations": True,
        "search_domain_filter": ["perplexity.ai"],
        "return_images": False,
        "return_related_questions": False,
        "search_recency_filter": "month",
        "top_k": 0,
        "stream": False,
        "presence_penalty": 0,
        "frequency_penalty": 1
    }

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.request("POST", PERPLEXITY_URL, json=payload, headers=headers)
    response_data = response.json()
    # print(response_data)
    # print(response_data['choices'][0]['message']['content'])
    content = response_data['choices'][0]['message']['content']
    interview_prep_data_parsed = clean_yaml_response(content)
    return interview_prep_data_parsed


def clean_yaml_response(content):
    content = content.replace("```yaml", "").replace("```", "").strip()
    interview_prep_data_parsed = yaml.safe_load(content)
    return interview_prep_data_parsed

example_city = "Durham"
print(cost_of_living(example_city))