#!/usr/bin/env python3
import argparse
from .services.calculator import add, subtract, multiply, divide

def main():
    parser = argparse.ArgumentParser(
        description="CLI for SOAP Calculator service operations"
    )
    parser.add_argument(
        'operation', choices=['add', 'subtract', 'multiply', 'divide'],
        help='Operation to perform'
    )
    parser.add_argument('a', type=int, help='First operand')
    parser.add_argument('b', type=int, help='Second operand')
    
    args = parser.parse_args()

    operations = {
        'add': add,
        'subtract': subtract,
        'multiply': multiply,
        'divide': divide,
    }

    try:
        result = operations[args.operation](args.a, args.b)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

if __name__ == '__main__':
    main()