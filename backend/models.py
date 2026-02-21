from pymongo import MongoClient
from datetime import datetime, timedelta
from bson import ObjectId
import bcrypt

client = MongoClient('mongodb://localhost:27017/')
db = client['local_service_platform']

class User:
    collection = db['users']
    
    @staticmethod
    def create(data):
        """Create a new user with hashed password"""
        password = data.get('password', '')
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user = {
            'name': data.get('name'),
            'email': data.get('email'),
            'password_hash': password_hash,
            'role': data.get('role'),
            'verified': False,
            'otp': None,
            'otp_expiry': None,
            'mobile': data.get('mobile'),
            'address': data.get('address'),
            'service_type': data.get('serviceType'),
            'service_area': data.get('serviceArea'),
            'status': 'pending' if data.get('role') == 'provider' else 'active',
            'created_at': datetime.utcnow()
        }
        
        result = User.collection.insert_one(user)
        user['_id'] = result.inserted_id
        return user
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        return User.collection.find_one({'email': email})
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        return User.collection.find_one({'_id': ObjectId(user_id)})
    
    @staticmethod
    def update_otp(email, otp):
        """Update user OTP and expiry (5 minutes)"""
        otp_expiry = datetime.utcnow() + timedelta(minutes=5)
        User.collection.update_one(
            {'email': email},
            {'$set': {'otp': otp, 'otp_expiry': otp_expiry}}
        )
    
    @staticmethod
    def verify_otp(email, otp):
        """Verify OTP and mark user as verified"""
        user = User.collection.find_one({'email': email, 'otp': otp})
        
        if not user:
            return False, "Invalid OTP"
        
        if user.get('otp_expiry') and user['otp_expiry'] < datetime.utcnow():
            return False, "OTP has expired"
        
        # Mark user as verified and clear OTP
        User.collection.update_one(
            {'email': email},
            {'$set': {'verified': True}, '$unset': {'otp': 1, 'otp_expiry': 1}}
        )
        
        return True, "Email verified successfully"
    
    @staticmethod
    def verify_password(password, password_hash):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash)
    
    @staticmethod
    def to_dict(user):
        """Convert user document to dictionary"""
        if not user:
            return None
        return {
            'id': str(user['_id']),
            'name': user.get('name'),
            'email': user.get('email'),
            'role': user.get('role'),
            'verified': user.get('verified', False),
            'mobile': user.get('mobile'),
            'address': user.get('address'),
            'service_type': user.get('service_type'),
            'service_area': user.get('service_area'),
            'status': user.get('status')
        }
