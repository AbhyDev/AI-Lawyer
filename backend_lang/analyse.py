# analyse.py

import base64
import os

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from the .env file
load_dotenv()

# More robust check: Verifies the key exists AND has a value.
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Error: GOOGLE_API_KEY environment variable not found or is empty.")
    print("Ensure it is set correctly in your .env file.")
    exit()

def analyse(image_path: str) -> str:
    """
    Extracts text from an image using LangChain with the Gemini 1.5 Flash model.
    """
    try:
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    except FileNotFoundError:
        return f"Error: Image file not found at {image_path}"

    # Initialize the LangChain model with gemini-1.5-flash
    # It will automatically use the GOOGLE_API_KEY from the environment
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

    message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": "Only output the text you see on the image, nothing else.",
            },
            {
                "type": "image_url",
                "image_url": f"data:image/png;base64,{image_b64}"
            },
        ]
    )
    response = llm.invoke([message])
    return response.content

# --- Main execution block for testing ---
if __name__ == "__main__":
    # Ensure the image path is correct relative to where you run the script
    image_file_path = "./image.png"
    extracted_text = analyse(image_file_path)
    print(extracted_text)
