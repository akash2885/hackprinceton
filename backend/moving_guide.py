from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv
import os
import yaml

load_dotenv()

openai_api_key = os.environ.get("OPENAI_API_KEY")


def generate_money_cost_calculator(city):
    # Format the prompt with the city parameter
    prompt = f"""

    I am creating a Money Cost Calculator for people looking to move to {city} for better opportunities. Please provide a detailed explanation for the following categories:

    - Opportunities:

    - Moving Cost Estimation:

    - Saving Goals And Timeline:

    - Relocation Guide:

    Describe all aspects of these categories we should consider when relocating.
    Structure the information to be informative, concise, and actionable.
    Each of the 4 Categories should have one block of content with all the information in a single string.
    This is supposed to help the user understand financially what he needs to move, so include financial estimations with values.
    So, in these categories 4, the content (large string of code) should try to answer questions such as: an estimated breakdown of typical moving expenses, Suggest a total savings goal for the move, Step-by-step checklist for moving, including tasks to be done before, during, and after the move, etc.

    Format the content with clear and attractive text, using well-organized text and numbers, in a way that is easy for the user to understand, if possible separate by new lines.
    Also, format the categories in Title Case.
    Provide information in a clean YAML format with no additional symbols, such as asterisks, hyphens or parentheses. Each section should contain only the content without extra formatting or emphasis symbols. 
    Don't return anything else than the YAML content
    
    """

    # Offer advice on finding affordable housing and managing finances in {city}.
    # Suggest ways to integrate into a new community, such as joining local groups, finding local resources, and learning about the area.

    # Initialize the chat model
    chat = ChatOpenAI(openai_api_key=openai_api_key)

    # Invoke the model
    response = chat(
        [
            SystemMessage(content="You are an assistant that provides detailed relocation advice."),
            HumanMessage(content=prompt)
        ]
    )
    # Return the response
    content = response.content.replace("```yaml", "").replace("```", "").strip()
    data_dict = yaml.safe_load(content)

    return data_dict

