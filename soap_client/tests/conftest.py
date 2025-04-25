# Automatically add src directory to sys.path so tests can import src package
import sys
import os

# Determine the absolute path to the src directory
tests_dir = os.path.dirname(__file__)

# Also add project root to sys.path so tests can import 'src' package
project_root = os.path.abspath(os.path.join(tests_dir, '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
