import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath('.')))

from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['local_service_platform']
users = db['users']

# Find the user by email
user_email = "finaltestuser123@gmail.com"
user = users.find_one({'email': user_email})

if user:
    print(f"User: {user.get('name')}")
    print(f"Email: {user.get('email')}")
    print(f"Verified: {user.get('verified')}")
    print(f"OTP: {user.get('otp')}")
    print(f"OTP Expiry: {user.get('otp_expiry')}")
else:
    print("User not found")
