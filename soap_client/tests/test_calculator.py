import pytest
from zeep.exceptions import Fault
import src.services.calculator as calc

class DummyService:
    def __init__(self, result=None, fault=None):
        self._result = result
        self._fault = fault

    def Add(self, intA, intB):
        if self._fault: raise Fault(self._fault)
        return intA + intB

    def Subtract(self, intA, intB):
        if self._fault: raise Fault(self._fault)
        return intA - intB

    def Multiply(self, intA, intB):
        if self._fault: raise Fault(self._fault)
        return intA * intB

    def Divide(self, intA, intB):
        if self._fault: raise Fault(self._fault)
        return intA // intB

@pytest.fixture(autouse=True)
def patch_client(monkeypatch: pytest.MonkeyPatch) -> DummyService:
    """
    Automatically replace calc.client.service with a DummyService so we can control its behavior.

    Parameters
    ----------
    monkeypatch : pytest.MonkeyPatch
        The pytest monkeypatch fixture to modify the client.

    Returns
    -------
    DummyService
        The dummy service instance used for testing.
    """
    dummy = DummyService()
    # monkey‑patch both the client and its internal service attribute
    monkeypatch.setattr(calc, 'client', type('C', (), {'service': dummy}))
    return dummy

@pytest.mark.parametrize("a,b,expected", [
    (3, 5, 8),
    (10, -2, 8),
    (0, 0, 0),
])
def test_add_success(patch_client: DummyService, a: int, b: int, expected: int) -> None:
    """
    Validate that the add function returns the expected result.

    Parameters
    ----------
    patch_client : DummyService
        The patched SOAP client service.
    a : int
        First operand.
    b : int
        Second operand.
    expected : int
        Expected result of addition.
    
    Returns
    -------
    None
    """
    patch_client._fault = None
    patch_client._result = a + b
    assert calc.add(a, b) == expected

@pytest.mark.parametrize("a,b,expected", [
    (10, 4, 6),
    (5, 10, -5),
])
def test_subtract_success(patch_client: DummyService, a: int, b: int, expected: int) -> None:
    """
    Validate that the subtract function returns the expected result.

    Parameters
    ----------
    patch_client : DummyService
        The patched SOAP client service.
    a : int
        First operand.
    b : int
        Second operand.
    expected : int
        Expected result of subtraction.

    Returns
    -------
    None
    """
    patch_client._fault = None
    patch_client._result = a - b
    assert calc.subtract(a, b) == expected

def test_multiply_success(patch_client: DummyService) -> None:
    """
    Validate that the multiply function returns the expected result.

    Parameters
    ----------
    patch_client : DummyService
        The patched SOAP client service.

    Returns
    -------
    None
    """
    patch_client._fault = None
    assert calc.multiply(3, 7) == 21

def test_divide_success(patch_client: DummyService) -> None:
    """
    Validate that the divide function returns the expected result.

    Parameters
    ----------
    patch_client : DummyService
        The patched SOAP client service.

    Returns
    -------
    None
    """
    patch_client._fault = None
    assert calc.divide(20, 5) == 4

@pytest.mark.parametrize("op, a, b, func", [
    ("add", 1, 2, calc.add),
    ("subtract", 1, 2, calc.subtract),
    ("multiply", 1, 2, calc.multiply),
    ("divide", 1, 2, calc.divide),
])
def test_soap_fault_wrapped(op: str, patch_client: DummyService, a: int, b: int, func: callable) -> None:
    """
    Validate that SOAP faults are raised as RuntimeError with a message.

    Parameters
    ----------
    op : str
        The operation being tested (add, subtract, multiply, divide).
    patch_client : DummyService
        The patched SOAP client service.
    a : int
        First operand.
    b : int
        Second operand.
    func : callable
        The function to call for the operation.

    Returns
    -------
    None

    """
    patch_client._fault = "Some SOAP Error"
    with pytest.raises(RuntimeError) as exc:
        func(a, b)
    assert "SOAP Fault" in str(exc.value)

def test_divide_by_zero(patch_client: DummyService) -> None:
    """
    Validate that dividing by zero raises ValueError before SOAP call.
    
    Parameters
    ----------
    patch_client : DummyService
        The patched SOAP client service.
    
    Returns
    -------
    None
    """
    with pytest.raises(ValueError) as exc:
        calc.divide(10, 0)
    assert "Division by zero" in str(exc.value)