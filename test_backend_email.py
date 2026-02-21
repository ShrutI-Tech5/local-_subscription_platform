import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath('.')))

from backend.utils.mail import send_otp_email

# Test sending OTP email
print("Testing backend send_otp_email function...")
success, message = send_otp_email("shruteee00@gmail.com", "123456")
print(f"Success: {success}, Message: {message}")
