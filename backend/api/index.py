import sys
import os

# Add the parent directory (backend) to sys.path so 'main' can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from main import app
