import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.models import User

# Check the user's verification status
user = User.find_by_email('shruteee00@gmail.com')
if user:
    print("User found:")
    print(f"  Email: {user.get('email')}")
    print(f"  Verified: {user.get('verified')}")
    print(f"  OTP: {user.get('otp')}")
    print(f"  OTP Expiry: {user.get('otp_expiry')}")
else:
    print("User not found")
