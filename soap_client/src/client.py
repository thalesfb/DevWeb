# SOAP client wrapper using Zeep
import logging
from zeep import Client, Settings
from zeep.transports import Transport
from requests import Session
from .config import WSDL_URL

# Configure logging for debugging SOAP requests/responses
target_logger = logging.getLogger('zeep')
target_logger.setLevel(logging.DEBUG)
logging.basicConfig(level=logging.INFO)

def get_zeep_client() -> Client:
    """
    Create and return a Zeep SOAP client configured with transport settings.

    Returns
    -------
    Client
        A Zeep Client instance configured with the WSDL URL and transport settings.
    """
    session = Session()
    transport = Transport(session=session, timeout=10)
    settings = Settings(strict=False, xml_huge_tree=True)
    client = Client(wsdl=WSDL_URL, transport=transport, settings=settings)
    return client
