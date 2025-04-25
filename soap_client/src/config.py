# Load environment variables from .env
from dotenv import load_dotenv
import os

load_dotenv()

# SOAP service WSDL endpoint, default loaded from .env
WSDL_URL = os.getenv("WSDL_URL")