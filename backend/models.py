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


class InstantBooking:
    collection = db['instant_bookings']
    
    @staticmethod
    def create(data):
        """Create a new instant booking"""
        booking = {
            'customer_id': data.get('customerId'),
            'customer_name': data.get('customerName'),
            'service_type': data.get('serviceType'),
            'description': data.get('description'),
            'image': data.get('image'),
            'voice_note': data.get('voiceNote'),
            'address': data.get('address'),
            'phone': data.get('phone'),
            'status': 'pending',
            'provider_id': data.get('providerId'),
            'provider_name': data.get('providerName'),
            'price': data.get('price'),
            'quote': data.get('quote'),
            'feedback': data.get('feedback'),
            'feedback_message': data.get('feedbackMessage'),
            'created_at': datetime.utcnow()
        }
        
        result = InstantBooking.collection.insert_one(booking)
        booking['_id'] = result.inserted_id
        return booking
    
    @staticmethod
    def find_by_id(booking_id):
        """Find booking by ID"""
        return InstantBooking.collection.find_one({'_id': ObjectId(booking_id)})
    
    @staticmethod
    def find_by_customer(customer_id):
        """Find all bookings for a customer"""
        return list(InstantBooking.collection.find({'customer_id': customer_id}).sort('created_at', -1))
    
    @staticmethod
    def find_by_provider(provider_id):
        """Find all bookings for a provider"""
        return list(InstantBooking.collection.find(
            {'$or': [{'provider_id': provider_id}, {'status': 'pending'}]}
        ).sort('created_at', -1))
    
    @staticmethod
    def find_all_pending():
        """Find all pending bookings"""
        return list(InstantBooking.collection.find({'status': 'pending'}).sort('created_at', -1))
    
    @staticmethod
    def update(booking_id, updates):
        """Update a booking"""
        updates['updated_at'] = datetime.utcnow()
        InstantBooking.collection.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': updates}
        )
        return InstantBooking.find_by_id(booking_id)
    
    @staticmethod
    def to_dict(booking):
        """Convert booking document to dictionary"""
        if not booking:
            return None
        return {
            'id': str(booking['_id']),
            'customer_id': booking.get('customer_id'),
            'customer_name': booking.get('customer_name'),
            'service_type': booking.get('service_type'),
            'description': booking.get('description'),
            'image': booking.get('image'),
            'voice_note': booking.get('voice_note'),
            'address': booking.get('address'),
            'phone': booking.get('phone'),
            'status': booking.get('status'),
            'provider_id': booking.get('provider_id'),
            'provider_name': booking.get('provider_name'),
            'price': booking.get('price'),
            'quote': booking.get('quote'),
            'feedback': booking.get('feedback'),
            'feedback_message': booking.get('feedback_message'),
            'created_at': booking.get('created_at').isoformat() if booking.get('created_at') else None
        }


class Subscription:
    collection = db['subscriptions']
    
    @staticmethod
    def create(data):
        """Create a new subscription"""
        # Calculate duration in days based on plan
        plan = data.get('plan', 'monthly')
        duration_days = 1  # default for daily
        if plan == 'weekly':
            duration_days = 7
        elif plan == 'monthly':
            duration_days = 30
        elif plan == 'quarterly':
            duration_days = 90
        elif plan == 'annual':
            duration_days = 365
        
        subscription = {
            'customer_id': data.get('customerId'),
            'service_id': data.get('serviceId'),
            'provider_id': data.get('providerId'),
            'plan': data.get('plan'),
            'price': data.get('price'),
            'status': 'active',
            'start_date': datetime.utcnow(),
            'end_date': datetime.utcnow() + timedelta(days=duration_days),
            'service_name': data.get('serviceName'),
            'provider_name': data.get('providerName'),
            'service_type': data.get('serviceType'),
            'location': data.get('location'),
            'created_at': datetime.utcnow()
        }
        
        result = Subscription.collection.insert_one(subscription)
        subscription['_id'] = result.inserted_id
        return subscription
    
    @staticmethod
    def find_by_id(subscription_id):
        """Find subscription by ID"""
        return Subscription.collection.find_one({'_id': ObjectId(subscription_id)})
    
    @staticmethod
    def find_by_customer(customer_id):
        """Find all subscriptions for a customer"""
        return list(Subscription.collection.find({'customer_id': customer_id}).sort('created_at', -1))
    
    @staticmethod
    def find_by_provider(provider_id):
        """Find all subscriptions for a provider"""
        return list(Subscription.collection.find({'provider_id': provider_id}).sort('created_at', -1))
    
    @staticmethod
    def find_all_active():
        """Find all active subscriptions"""
        return list(Subscription.collection.find({'status': 'active'}).sort('created_at', -1))
    
    @staticmethod
    def update(subscription_id, updates):
        """Update a subscription"""
        updates['updated_at'] = datetime.utcnow()
        Subscription.collection.update_one(
            {'_id': ObjectId(subscription_id)},
            {'$set': updates}
        )
        return Subscription.find_by_id(subscription_id)
    
    @staticmethod
    def to_dict(subscription):
        """Convert subscription document to dictionary"""
        if not subscription:
            return None
        return {
            'id': str(subscription['_id']),
            'customer_id': subscription.get('customer_id'),
            'service_id': subscription.get('service_id'),
            'provider_id': subscription.get('provider_id'),
            'plan': subscription.get('plan'),
            'price': subscription.get('price'),
            'status': subscription.get('status'),
            'start_date': subscription.get('start_date').isoformat() if subscription.get('start_date') else None,
            'end_date': subscription.get('end_date').isoformat() if subscription.get('end_date') else None,
            'service_name': subscription.get('service_name'),
            'provider_name': subscription.get('provider_name'),
            'service_type': subscription.get('service_type'),
            'location': subscription.get('location'),
            'created_at': subscription.get('created_at').isoformat() if subscription.get('created_at') else None
        }


class Payment:
    collection = db['payments']
    
    @staticmethod
    def create(data):
        """Create a new payment record"""
        payment = {
            'user_id': data.get('userId'),
            'provider_id': data.get('providerId'),
            'customer_id': data.get('customerId'),
            'amount': data.get('amount'),
            'type': data.get('type'),  # 'subscription' or 'instant'
            'status': data.get('status', 'success'),
            'subscription_id': data.get('subscriptionId'),
            'booking_id': data.get('bookingId'),
            'plan': data.get('plan'),
            'created_at': datetime.utcnow()
        }
        
        result = Payment.collection.insert_one(payment)
        payment['_id'] = result.inserted_id
        return payment
    
    @staticmethod
    def find_by_id(payment_id):
        """Find payment by ID"""
        return Payment.collection.find_one({'_id': ObjectId(payment_id)})
    
    @staticmethod
    def find_by_user(user_id):
        """Find all payments for a user (customer)"""
        return list(Payment.collection.find({'user_id': user_id}).sort('created_at', -1))
    
    @staticmethod
    def find_by_provider(provider_id):
        """Find all payments for a provider"""
        return list(Payment.collection.find({'provider_id': provider_id}).sort('created_at', -1))
    
    @staticmethod
    def find_by_subscription(subscription_id):
        """Find payment by subscription ID"""
        return Payment.collection.find_one({'subscription_id': subscription_id})
    
    @staticmethod
    def find_by_booking(booking_id):
        """Find payment by booking ID"""
        return Payment.collection.find_one({'booking_id': booking_id})
    
    @staticmethod
    def to_dict(payment):
        """Convert payment document to dictionary"""
        if not payment:
            return None
        return {
            'id': str(payment['_id']),
            'user_id': payment.get('user_id'),
            'provider_id': payment.get('provider_id'),
            'customer_id': payment.get('customer_id'),
            'amount': payment.get('amount'),
            'type': payment.get('type'),
            'status': payment.get('status'),
            'subscription_id': payment.get('subscription_id'),
            'booking_id': payment.get('booking_id'),
            'plan': payment.get('plan'),
            'created_at': payment.get('created_at').isoformat() if payment.get('created_at') else None
        }
