import sys
import os

# Add project root to sys.path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from flask_cors import CORS
from backend.routes.auth import auth_bp
from backend.routes.bookings import bookings_bp
from backend.routes.subscriptions import subscriptions_bp
from backend.routes.payments import payments_bp
from backend.config import DEBUG

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(bookings_bp, url_prefix='/api')
app.register_blueprint(subscriptions_bp, url_prefix='/api')
app.register_blueprint(payments_bp, url_prefix='/api')

@app.route('/')
def index():
    return {'message': 'Local Service Platform API', 'status': 'running'}

@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(debug=DEBUG, port=5000, host='0.0.0.0')
