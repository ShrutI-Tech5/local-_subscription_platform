from flask import Blueprint, request, jsonify
from backend.models import Subscription

subscriptions_bp = Blueprint('subscriptions', __name__)

@subscriptions_bp.route('/subscription', methods=['POST'])
def create_subscription():
    """Create a new subscription"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['customerId', 'serviceId', 'providerId', 'plan', 'price', 'serviceName', 'providerName']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'message': f'{field} is required'}), 400
    
    # Create subscription in MongoDB
    subscription = Subscription.create(data)
    
    return jsonify({
        'success': True,
        'message': 'Subscription created successfully',
        'subscription': Subscription.to_dict(subscription)
    }), 201


@subscriptions_bp.route('/subscription/<subscription_id>', methods=['GET'])
def get_subscription(subscription_id):
    """Get a subscription by ID"""
    try:
        subscription = Subscription.find_by_id(subscription_id)
        if not subscription:
            return jsonify({'success': False, 'message': 'Subscription not found'}), 404
        
        return jsonify({
            'success': True,
            'subscription': Subscription.to_dict(subscription)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@subscriptions_bp.route('/customer/<customer_id>/subscriptions', methods=['GET'])
def get_customer_subscriptions(customer_id):
    """Get all subscriptions for a customer"""
    try:
        subscriptions = Subscription.find_by_customer(customer_id)
        return jsonify({
            'success': True,
            'subscriptions': [Subscription.to_dict(s) for s in subscriptions]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@subscriptions_bp.route('/provider/<provider_id>/subscriptions', methods=['GET'])
def get_provider_subscriptions(provider_id):
    """Get all subscriptions for a provider"""
    try:
        subscriptions = Subscription.find_by_provider(provider_id)
        return jsonify({
            'success': True,
            'subscriptions': [Subscription.to_dict(s) for s in subscriptions]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@subscriptions_bp.route('/subscriptions/active', methods=['GET'])
def get_active_subscriptions():
    """Get all active subscriptions"""
    try:
        subscriptions = Subscription.find_all_active()
        return jsonify({
            'success': True,
            'subscriptions': [Subscription.to_dict(s) for s in subscriptions]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@subscriptions_bp.route('/subscription/<subscription_id>', methods=['PUT'])
def update_subscription(subscription_id):
    """Update a subscription (renew, cancel, etc.)"""
    try:
        data = request.get_json()
        
        subscription = Subscription.find_by_id(subscription_id)
        if not subscription:
            return jsonify({'success': False, 'message': 'Subscription not found'}), 404
        
        # Update subscription with provided fields
        updates = {}
        if 'status' in data:
            updates['status'] = data['status']
        if 'price' in data:
            updates['price'] = data['price']
        if 'plan' in data:
            updates['plan'] = data['plan']
        
        updated_subscription = Subscription.update(subscription_id, updates)
        
        return jsonify({
            'success': True,
            'message': 'Subscription updated successfully',
            'subscription': Subscription.to_dict(updated_subscription)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
