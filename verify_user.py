import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.models import User
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['local_service_platform']

# Manually verify the user's email
email = 'shruteee00@gmail.com'

# Update the user to verified
result = db.users.update_one(
    {'email': email},
    {'$set': {'verified': True}, '$unset': {'otp': 1, 'otp_expiry': 1}}
)

if result.modified_count > 0:
    print(f"User {email} has been verified successfully!")
else:
    print(f"Could not verify user {email}")

# Check the user's status
user = User.find_by_email(email)
if user:
    print(f"\nUser status:")
    print(f"  Email: {user.get('email')}")
    print(f"  Verified: {user.get('verified')}")
    print(f"  OTP: {user.get('otp')}")
    print(f"  OTP Expiry: {user.get('otp_expiry')}")
else:
    print("User not found")
