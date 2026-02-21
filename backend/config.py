import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/local_service_platform')

# Email Configuration (Gmail SMTP)
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'shruteee00@gmail.com'
EMAIL_HOST_PASSWORD = 'wiuczofyjyavzazo'

# App Configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
DEBUG = True
