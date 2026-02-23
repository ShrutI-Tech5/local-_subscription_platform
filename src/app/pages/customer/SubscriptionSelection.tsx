import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getServiceById } from '../../utils/mockData';
import { ArrowLeft, Star, MapPin, Check } from 'lucide-react';

export default function SubscriptionSelection() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (!user || !serviceId) {
      navigate('/customer/browse-services');
      return;
    }

    const foundService = getServiceById(serviceId);
    if (foundService) {
      setService(foundService);
    } else {
      navigate('/customer/browse-services');
    }
  }, [user, serviceId, navigate]);

  if (!service) return null;

  // Fixed prices for daily, weekly, monthly plans
  const plans = [
    {
      id: 'daily',
      name: 'Daily',
      price: 200,
      period: '1 day',
      savings: null,
      popular: false
    },
    {
      id: 'weekly',
      name: 'Weekly',
      price: 500,
      period: '1 week',
      savings: null,
      popular: false
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: 799,
      period: '1 month',
      savings: null,
      popular: true
    }
  ];

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  const handleProceedToPayment = () => {
    navigate('/customer/payment', {
      state: {
        service,
        plan: selectedPlan,
        price: selectedPlanDetails?.price
      }
    });
  };

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
            onClick={() => navigate('/customer/browse-services')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Services
          </button>
          <h1 className="text-3xl text-gray-900">Subscribe to Service</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Service Details */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src={service.image}
                alt={service.serviceType}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {service.serviceType}
              </span>
              <h2 className="text-2xl mt-3 mb-2 text-gray-900">{service.providerName}</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-700">{service.rating}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{service.reviews} reviews</span>
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                {service.location}
              </div>
              <p className="text-gray-600">{service.description}</p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section - Dynamic Reviews from Mock Data */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h3 className="text-2xl mb-6 text-gray-900">Customer Reviews</h3>
          {service.customerReviews && service.customerReviews.length > 0 ? (
            <div className="space-y-6">
              {service.customerReviews.map((review: any, index: number) => (
                <div key={index} className={`${index < service.customerReviews.length - 1 ? 'border-b border-gray-100 pb-6' : 'pb-0'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        {review.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.customerName}</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews yet. Be the first to review this service!</p>
            </div>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h3 className="text-2xl mb-6 text-gray-900">Choose Your Plan</h3>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as any)}
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                      Most Popular
                    </span>
                  </div>
                )}

                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <h4 className="text-xl mb-2 text-gray-900">{plan.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-600 text-sm">/{plan.period}</span>
                </div>

                {plan.savings && (
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      Save {plan.savings}%
                    </span>
                  </div>
                )}

                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>24/7 Support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Priority Scheduling</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Quality Guarantee</span>
                  </li>
                  {plan.id !== 'monthly' && (
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Free Maintenance</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Summary and Action */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-xl mb-4 text-gray-900">Subscription Summary</h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Service Provider:</span>
              <span className="text-gray-900">{service.providerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Type:</span>
              <span className="text-gray-900">{service.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="text-gray-900">{selectedPlanDetails?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="text-gray-900">{selectedPlanDetails?.period}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-xl text-gray-900">Total:</span>
              <span className="text-2xl text-gray-900">₹{selectedPlanDetails?.price}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToPayment}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
