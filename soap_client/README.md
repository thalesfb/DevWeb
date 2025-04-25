# SOAP Client for Calculator Service

This project provides a Python client for the public Calculator SOAP web service (WSDL: http://www.dneonline.com/calculator.asmx?WSDL). It supports the four basic operations: **Add**, **Subtract**, **Multiply**, and **Divide**, exposed both as a library and as a simple CLI.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Contributing](#contributing)
- [License](#license)

## Features

- Modular code with single‑responsibility components
- SOAP requests handled by **Zeep** (Python SOAP client)
- Environment‑driven configuration via `.env`
- Input validation (e.g. division by zero)
- Command‑line interface for all operations
- Comprehensive unit tests with **pytest**

## Prerequisites

- Python 3.8 or higher
- `pip` for installing dependencies

## Installation

```bash
cd soap_client
python -m venv .venv
# Activate virtual environment
source .venv/Scripts/activate    # on Windows (Git Bash)
# Install dependencies
pip install -r requirements.txt
```

## Configuration

Rename `.env.example` to `.env` and set the `WSDL_URL` if you want to use a different SOAP endpoint. The default is set to the public calculator service.


## Usage

Invoke operations via the CLI:

```bash
python -m src add 5 3      # → Result: 8
python -m src subtract 10 4 # → Result: 6
python -m src multiply 6 7  # → Result: 42
python -m src divide 20 5    # → Result: 4
python -m src divide 10 0    # → Error: Division by zero is not allowed
```

## Testing

Run the pytest suite:

```bash
pytest --maxfail=1 --disable-warnings -q
```

## Project Structure

```bash
soap_client/
├── .env.example                  # Environment variables
├── src/
│   ├── config.py         # Environment loader
│   ├── client.py         # Zeep client wrapper
│   ├── services/
│   │   └── calculator.py # Calculator operations (Add, Subtract, etc.)
│   └── __main__.py       # CLI entry point
├── tests/
│   ├── conftest.py       # pytest fixtures and path setup
│   └── test_calculator.py# Unit tests for service functions
├── requirements.txt      # Runtime & test dependencies
└── README.md             # Project documentation

```

## Architecture Overview

1. **config.py**: Loads `.env` and exposes `WSDL_URL`.
2. **client.py**: Creates a singleton Zeep `Client` with transport settings, logging, timeouts.
3. **services/calculator.py**: Exposes `add()`, `subtract()`, `multiply()`, `divide()` functions, handles SOAP faults and input validation.
4. **__main__.py**: Parses CLI arguments and dispatches to service functions.
5. **tests/**: Uses pytest and monkeypatch to simulate SOAP responses, ensuring both success and error paths are covered.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests for improvements, bug fixes, or new features.

## License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.
