from flask import Blueprint, request, jsonify
from backend.models import InstantBooking

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/instant-booking', methods=['POST'])
def create_booking():
    """Create a new instant booking"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['customerId', 'customerName', 'serviceType', 'description', 'address', 'phone']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'message': f'{field} is required'}), 400
    
    # Create booking in MongoDB
    booking = InstantBooking.create(data)
    
    return jsonify({
        'success': True,
        'message': 'Booking created successfully',
        'booking': InstantBooking.to_dict(booking)
    }), 201


@bookings_bp.route('/instant-booking/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get a booking by ID"""
    try:
        booking = InstantBooking.find_by_id(booking_id)
        if not booking:
            return jsonify({'success': False, 'message': 'Booking not found'}), 404
        
        return jsonify({
            'success': True,
            'booking': InstantBooking.to_dict(booking)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@bookings_bp.route('/customer/<customer_id>/bookings', methods=['GET'])
def get_customer_bookings(customer_id):
    """Get all bookings for a customer"""
    try:
        bookings = InstantBooking.find_by_customer(customer_id)
        return jsonify({
            'success': True,
            'bookings': [InstantBooking.to_dict(b) for b in bookings]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@bookings_bp.route('/provider/<provider_id>/bookings', methods=['GET'])
def get_provider_bookings(provider_id):
    """Get all bookings for a provider"""
    try:
        bookings = InstantBooking.find_by_provider(provider_id)
        return jsonify({
            'success': True,
            'bookings': [InstantBooking.to_dict(b) for b in bookings]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@bookings_bp.route('/bookings/pending', methods=['GET'])
def get_pending_bookings():
    """Get all pending bookings"""
    try:
        bookings = InstantBooking.find_all_pending()
        return jsonify({
            'success': True,
            'bookings': [InstantBooking.to_dict(b) for b in bookings]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@bookings_bp.route('/instant-booking/<booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Update a booking (accept, reject, complete, add feedback)"""
    try:
        data = request.get_json()
        
        booking = InstantBooking.find_by_id(booking_id)
        if not booking:
            return jsonify({'success': False, 'message': 'Booking not found'}), 404
        
        # Update booking with provided fields
        updates = {}
        if 'status' in data:
            updates['status'] = data['status']
        if 'provider_id' in data:
            updates['provider_id'] = data['provider_id']
        if 'provider_name' in data:
            updates['provider_name'] = data['provider_name']
        if 'price' in data:
            updates['price'] = data['price']
        if 'quote' in data:
            updates['quote'] = data['quote']
        if 'feedback' in data:
            updates['feedback'] = data['feedback']
        if 'feedback_message' in data:
            updates['feedback_message'] = data['feedback_message']
        
        updated_booking = InstantBooking.update(booking_id, updates)
        
        return jsonify({
            'success': True,
            'message': 'Booking updated successfully',
            'booking': InstantBooking.to_dict(updated_booking)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
