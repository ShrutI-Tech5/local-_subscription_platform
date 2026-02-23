from flask import Blueprint, request, jsonify
from backend.models import Payment

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/payment', methods=['POST'])
def create_payment():
    """Create a new payment record"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['userId', 'providerId', 'amount', 'type']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'message': f'{field} is required'}), 400
    
    # Create payment in MongoDB
    payment = Payment.create(data)
    
    return jsonify({
        'success': True,
        'message': 'Payment recorded successfully',
        'payment': Payment.to_dict(payment)
    }), 201


@payments_bp.route('/payment/<payment_id>', methods=['GET'])
def get_payment(payment_id):
    """Get a payment by ID"""
    try:
        payment = Payment.find_by_id(payment_id)
        if not payment:
            return jsonify({'success': False, 'message': 'Payment not found'}), 404
        
        return jsonify({
            'success': True,
            'payment': Payment.to_dict(payment)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@payments_bp.route('/customer/<customer_id>/payments', methods=['GET'])
def get_customer_payments(customer_id):
    """Get all payments for a customer"""
    try:
        payments = Payment.find_by_user(customer_id)
        return jsonify({
            'success': True,
            'payments': [Payment.to_dict(p) for p in payments]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@payments_bp.route('/provider/<provider_id>/payments', methods=['GET'])
def get_provider_payments(provider_id):
    """Get all payments for a provider"""
    try:
        payments = Payment.find_by_provider(provider_id)
        return jsonify({
            'success': True,
            'payments': [Payment.to_dict(p) for p in payments]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@payments_bp.route('/subscription/<subscription_id>/payment', methods=['GET'])
def get_subscription_payment(subscription_id):
    """Get payment by subscription ID"""
    try:
        payment = Payment.find_by_subscription(subscription_id)
        if not payment:
            return jsonify({'success': False, 'message': 'Payment not found'}), 404
        
        return jsonify({
            'success': True,
            'payment': Payment.to_dict(payment)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@payments_bp.route('/booking/<booking_id>/payment', methods=['GET'])
def get_booking_payment(booking_id):
    """Get payment by booking ID"""
    try:
        payment = Payment.find_by_booking(booking_id)
        if not payment:
            return jsonify({'success': False, 'message': 'Payment not found'}), 404
        
        return jsonify({
            'success': True,
            'payment': Payment.to_dict(payment)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
