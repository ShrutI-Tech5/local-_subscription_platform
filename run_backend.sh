#!/bin/bash

echo "Starting Flask Backend..."
echo "Make sure MongoDB is running first!"
echo ""

# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py
