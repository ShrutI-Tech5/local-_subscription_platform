import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserCircle, Wrench } from 'lucide-react';

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'provider' | null>(null);
  const navigate = useNavigate();

  const handleRegister = () => {
    if (selectedRole === 'customer') {
      navigate('/register/customer');
    } else if (selectedRole === 'provider') {
      navigate('/register/provider');
    }
  };

  const handleLogin = () => {
    navigate('/login', { state: { role: selectedRole } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 text-gray-900">Local Service Subscription Platform</h1>
          <p className="text-xl text-gray-600">Connect with trusted service providers in your area</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-2xl mb-8 text-center text-gray-800">Select Your Role</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setSelectedRole('customer')}
              className={`p-8 rounded-xl border-2 transition-all ${
                selectedRole === 'customer'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <UserCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl mb-2">Customer</h3>
              <p className="text-gray-600">Find and subscribe to local services</p>
            </button>

            <button
              onClick={() => setSelectedRole('provider')}
              className={`p-8 rounded-xl border-2 transition-all ${
                selectedRole === 'provider'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Wrench className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl mb-2">Service Provider</h3>
              <p className="text-gray-600">Offer your services to customers</p>
            </button>
          </div>

          {selectedRole && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleLogin}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className={`px-8 py-3 text-white rounded-lg transition-colors ${
                  selectedRole === 'customer'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
