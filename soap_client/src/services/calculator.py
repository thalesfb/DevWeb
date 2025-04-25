# Calculator service functions using the SOAP client
from ..client import get_zeep_client
from zeep.exceptions import Fault

client = get_zeep_client()

def add(a: int, b: int) -> int:
    """
    Perform addition via SOAP Add operation.

    Parameters:
    ----------
    a : int
        First operand.
    b : int
        Second operand.

    Returns:
    -------
    int
        Result of addition.
    """
    try:
        return client.service.Add(intA=a, intB=b)
    except Fault as e:
        raise RuntimeError(f"SOAP Fault on Add: {e}")


def subtract(a: int, b: int) -> int:
    """
    Perform subtraction via SOAP Subtract operation.

    Parameters:
    ----------
    a : int
        First operand.
    b : int
        Second operand.

    Returns:
    -------
    int
        Result of subtraction.
    """
    try:
        return client.service.Subtract(intA=a, intB=b)
    except Fault as e:
        raise RuntimeError(f"SOAP Fault on Subtract: {e}")


def multiply(a: int, b: int) -> int:
    """
    Perform multiplication via SOAP Multiply operation.

    Parameters:
    ----------
    a : int
        First operand.
    b : int
        Second operand.

    Returns:
    -------
    int
        Result of multiplication.
    """
    try:
        return client.service.Multiply(intA=a, intB=b)
    except Fault as e:
        raise RuntimeError(f"SOAP Fault on Multiply: {e}")


def divide(a: int, b: int) -> int:
    """
    Perform division via SOAP Divide operation. Integer division.

    Parameters:
    ----------
    a : int
        First operand.
    b : int
        Second operand.

    Returns:
    -------
    int
        Result of division.
    """
    # Pre-validate to avoid calling SOAP for predictable errors
    if b == 0:
        raise ValueError("Division by zero is not allowed")
    try:
        return client.service.Divide(intA=a, intB=b)
    except Fault as e:
        raise RuntimeError(f"SOAP Fault on Divide: {e}")