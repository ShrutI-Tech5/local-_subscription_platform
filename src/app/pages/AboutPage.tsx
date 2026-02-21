import { useNavigate } from 'react-router';
import { ArrowRight, CheckCircle, Users, Wrench, Shield } from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-indigo-700">SERVEASE</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to SERVEASE
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your trusted local service subscription platform connecting customers with 
            reliable service providers in your community.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white 
                       text-lg font-semibold rounded-lg hover:bg-indigo-700 
                       transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-3 text-gray-900">For Customers</h3>
            <p className="text-gray-600">
              Browse and subscribe to local services easily. Find trusted providers 
              for all your needs.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-3 text-gray-900">For Providers</h3>
            <p className="text-gray-600">
              Offer your services to a wider audience. Manage bookings and grow 
              your business effortlessly.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure & Reliable</h3>
            <p className="text-gray-600">
              Verified providers, secure payments, and reliable service 
              subscriptions you can trust.
            </p>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Choose SERVEASE?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Easy service discovery and subscription",
              "Verified and trusted service providers",
              "Flexible subscription plans",
              "Secure online payments",
              "Instant booking options",
              "Dedicated customer support"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Ready to experience the best local service platform?
          </p>
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white 
                       text-lg font-semibold rounded-lg hover:bg-indigo-700 
                       transition-colors shadow-lg"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm">
            © 2024 SERVEASE. All rights reserved. Connecting communities with quality services.
          </p>
        </div>
      </footer>
    </div>
  );
}
