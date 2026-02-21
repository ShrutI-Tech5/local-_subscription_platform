from flask import Blueprint, request, jsonify
import random
from backend.models import User
from backend.utils.mail import send_otp_email

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user with verified=false"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'password', 'role']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'message': f'{field} is required'}), 400
    
    # Check if email already exists
    existing_user = User.find_by_email(data['email'])
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already registered'}), 400
    
    # Create user
    user = User.create(data)
    
    # Generate and send OTP
    otp = str(random.randint(100000, 999999))
    User.update_otp(data['email'], otp)
    
    # Send OTP email
    success, message = send_otp_email(data['email'], otp)
    if not success:
        return jsonify({
            'success': True,
            'message': 'User registered but failed to send OTP email',
            'user': User.to_dict(user)
        }), 201
    
    return jsonify({
        'success': True,
        'message': 'OTP sent to your email. Please verify to login.',
        'user': User.to_dict(user)
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user - only allowed if verified=true"""
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required'}), 400
    
    # Find user by email
    user = User.find_by_email(email)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Check if verified
    if not user.get('verified', False):
        return jsonify({
            'success': False, 
            'message': 'Please verify your email first. OTP sent to your email.'
        }), 401
    
    # Verify password
    if not User.verify_password(password, user['password_hash']):
        return jsonify({'success': False, 'message': 'Invalid password'}), 401
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': User.to_dict(user)
    }), 200

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Generate and send new OTP to email"""
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email required'}), 400
    
    # Check if user exists
    user = User.find_by_email(email)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Check if already verified
    if user.get('verified', False):
        return jsonify({'success': False, 'message': 'Email already verified'}), 400
    
    # Generate new OTP
    otp = str(random.randint(100000, 999999))
    User.update_otp(email, otp)
    
    # Send OTP email
    success, message = send_otp_email(email, otp)
    if not success:
        return jsonify({'success': False, 'message': message}), 500
    
    return jsonify({
        'success': True,
        'message': 'OTP sent successfully'
    }), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP and mark user as verified"""
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({'success': False, 'message': 'Email and OTP required'}), 400
    
    # Verify OTP
    success, message = User.verify_otp(email, otp)
    
    if not success:
        return jsonify({'success': False, 'message': message}), 400
    
    return jsonify({
        'success': True,
        'message': 'Email verified successfully! You can now login.'
    }), 200
