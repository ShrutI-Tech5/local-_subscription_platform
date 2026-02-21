import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getProviderSubscriptions, getProviderBookings, getProviderPayments, getProviderServices } from '../../utils/mockData';
import { DollarSign, Users, CheckCircle, Clock, LogOut, Bell, Star } from 'lucide-react';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/login');
      return;
    }

    setSubscriptions(getProviderSubscriptions(user.id));
    setBookings(getProviderBookings(user.id));
    setPayments(getProviderPayments(user.id));
    setServices(getProviderServices(user.id));
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalEarnings = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRequests = bookings.filter(b => b.status === 'pending').length;
  const activeCustomers = subscriptions.filter(s => s.status === 'active').length;
  
  // Count completed jobs (from bookings with 'completed' status)
  const completedJobs = bookings.filter(b => b.status === 'completed').length;

  // Get reviews from provider's services
  const allReviews: Array<{ customerName: string; rating: number; comment: string; date: string; serviceType: string }> = [];
  services.forEach(service => {
    if (service.customerReviews) {
      service.customerReviews.forEach((review: any) => {
        allReviews.push({
          customerName: review.customerName,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          serviceType: service.serviceType
        });
      });
    }
  });

  // Sort by date (most recent first) and take top 3
  const recentReviews = allReviews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl text-gray-900">Provider Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6 text-gray-600" />
              {pendingRequests > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingRequests}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.serviceType}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-green-100 mb-4">Manage your services and customers</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/provider/service-requests')}
              className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              View Requests {pendingRequests > 0 && `(${pendingRequests})`}
            </button>
            <button
              onClick={() => navigate('/provider/earnings')}
              className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
            >
              View Earnings
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-2xl text-gray-900">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Customers</p>
                <p className="text-2xl text-gray-900">{activeCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending Requests</p>
                <p className="text-2xl text-gray-900">{pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Completed Jobs</p>
                <p className="text-2xl text-gray-900">{completedJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Info - Clickable to Profile */}
        <div 
          onClick={() => navigate('/provider/profile')}
          className="bg-white rounded-xl shadow-sm p-6 mb-8 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-gray-900">Your Service Profile</h3>
            <span className="text-blue-600 text-sm">Click to view/edit</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Service Type</p>
              <p className="text-gray-900">{user?.serviceType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Service Area</p>
              <p className="text-gray-900">{user?.serviceArea}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Rating</p>
              <p className="text-gray-900 flex items-center gap-1">
                ⭐ {user?.rating || 'N/A'} 
                <span className="text-gray-500 text-sm">({user?.completedJobs || 0} reviews)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Subscriptions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-gray-900">Active Subscriptions</h3>
              <button
                onClick={() => navigate('/provider/service-management')}
                className="text-blue-600 text-sm hover:underline"
              >
                View All
              </button>
            </div>
            {subscriptions.filter(s => s.status === 'active').length > 0 ? (
              <div className="space-y-3">
                {subscriptions
                  .filter(s => s.status === 'active')
                  .slice(0, 3)
                  .map(sub => (
                    <div key={sub.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-900">{sub.serviceName}</p>
                      <p className="text-sm text-gray-600">Plan: {sub.plan} - ${sub.price}</p>
                      <p className="text-xs text-gray-500">
                        Until: {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No active subscriptions</p>
            )}
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-gray-900">Recent Reviews</h3>
            </div>
            {recentReviews.length > 0 ? (
              <div className="space-y-3">
                {recentReviews.map((review, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-gray-900 font-medium">{review.customerName}</p>
                        <p className="text-xs text-gray-500">{review.serviceType}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-900">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-gray-900">Pending Requests</h3>
            <button
              onClick={() => navigate('/provider/service-requests')}
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </button>
          </div>
          {bookings.filter(b => b.status === 'pending').length > 0 ? (
            <div className="space-y-3">
              {bookings
                .filter(b => b.status === 'pending')
                .slice(0, 3)
                .map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-gray-900">{booking.serviceType}</p>
                        <p className="text-sm text-gray-600">{booking.customerName}</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{booking.description}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No pending requests</p>
          )}
        </div>
      </div>
    </div>
  );
}
