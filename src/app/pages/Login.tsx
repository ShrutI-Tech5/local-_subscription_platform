 import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const API_URL = 'http://127.0.0.1:5000/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showVerified, setShowVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.verified) {
      setShowVerified(true);
      setEmail(location.state.email || '');
      setTimeout(() => setShowVerified(false), 3000);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Login successful
        login(data.user);

        // Redirect based on role
        if (data.user.role === 'customer') {
          navigate('/customer/dashboard');
        } else {
          navigate('/provider/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server. Please make sure the backend is running on http://localhost:5000');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {showVerified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-800">Email verified successfully! You can now login.</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl mb-2 text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mb-8">Login to your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-indigo-600 hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
