import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { addSubscription, addPayment, updateBooking } from '../../utils/mockData';
import { CreditCard, Smartphone, Building2, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { service, plan, price, bookingId } = location.state || {};
  const isInstantBooking = plan === 'instant';

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
    if (!user || !service || !plan || !price) {
      navigate('/customer/browse-services');
    }
  }, [user, service, plan, price, navigate]);

  const handlePayment = async () => {
    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isInstantBooking && bookingId) {
      // Handle instant booking payment
      updateBooking(bookingId, { status: 'completed' });

      // Record payment with providerId for earnings tracking
      const payment = {
        id: Date.now().toString(),
        userId: user!.id,
        providerId: service.providerId,
        amount: price,
        type: 'instant' as const,
        status: 'success' as const,
        date: new Date().toISOString(),
        bookingId: bookingId
      };

      addPayment(payment);
    } else {
      // Handle subscription payment
      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      if (plan === 'daily') endDate.setDate(endDate.getDate() + 1);
      else if (plan === 'weekly') endDate.setDate(endDate.getDate() + 7);
      else if (plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);

      // Create subscription
      const newSubscription = {
        id: Date.now().toString(),
        customerId: user!.id,
        serviceId: service.id,
        providerId: service.providerId,
        plan,
        price,
        status: 'active' as const,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        serviceName: service.serviceType,
        providerName: service.providerName
      };

      addSubscription(newSubscription);

      // Record payment with providerId for earnings tracking
      const payment = {
        id: Date.now().toString(),
        userId: user!.id,
        providerId: service.providerId,
        amount: price,
        type: 'subscription' as const,
        status: 'success' as const,
        date: new Date().toISOString(),
        subscriptionId: newSubscription.id
      };

      addPayment(payment);
    }

    setProcessing(false);
    setSuccess(true);

    // Redirect after success
    setTimeout(() => {
      navigate('/customer/dashboard');
    }, 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl mb-2 text-gray-900">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            {isInstantBooking ? 'Your instant booking has been paid' : 'Your subscription has been activated'}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service:</span>
                <span className="text-gray-900">{service.serviceType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Provider:</span>
                <span className="text-gray-900">{service.providerName}</span>
              </div>
              {!isInstantBooking && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan:</span>
                  <span className="text-gray-900">{plan}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-gray-900">${price}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Servease Logo */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl text-pink-600 font-bold">Servease</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl text-gray-900">Payment</h1>
          <p className="text-gray-600">
            {isInstantBooking ? 'Complete your instant booking payment' : 'Complete your subscription payment'}
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl mb-6 text-gray-900">Payment Method</h3>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-700">Card</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-700">UPI</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-700">Net Banking</p>
                </button>
              </div>

              {/* Card Payment */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-gray-700">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={19}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-700">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-gray-700">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment */}
              {paymentMethod === 'upi' && (
                <div>
                  <label className="block mb-2 text-gray-700">UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === 'netbanking' && (
                <div>
                  <label className="block mb-2 text-gray-700">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose your bank</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> This is a simulated payment. No real transaction will occur.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-xl mb-4 text-gray-900">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service:</span>
                  <span className="text-gray-900">{service?.serviceType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Provider:</span>
                  <span className="text-gray-900">{service?.providerName}</span>
                </div>
                {!isInstantBooking && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan:</span>
                    <span className="text-gray-900 capitalize">{plan}</span>
                  </div>
                )}
                {isInstantBooking && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">Instant Booking</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-xl text-gray-900">${price}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : `Pay $${price}`}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
