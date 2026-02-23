import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getCustomerSubscriptions, getCustomerBookings, updateBooking, InstantBooking } from '../../utils/mockData';
import { Package, Zap, User, LogOut, Bell, ThumbsUp, ThumbsDown, CreditCard, Send, UserCircle, Trash2, EyeOff } from 'lucide-react';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<InstantBooking[]>([]);
  const [feedbackStates, setFeedbackStates] = useState<Record<string, { showMessage: boolean; message: string }>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [hiddenBookings, setHiddenBookings] = useState<string[]>([]);

  // Load hidden bookings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hiddenBookings');
    if (saved) {
      setHiddenBookings(JSON.parse(saved));
    }
  }, []);

  // Save hidden bookings to localStorage
  const saveHiddenBookings = (hidden: string[]) => {
    setHiddenBookings(hidden);
    localStorage.setItem('hiddenBookings', JSON.stringify(hidden));
  };

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login');
      return;
    }

    setSubscriptions(getCustomerSubscriptions(user.id));
    setBookings(getCustomerBookings(user.id));
  }, [user, navigate, refreshKey]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHideBooking = (bookingId: string) => {
    const newHidden = [...hiddenBookings, bookingId];
    saveHiddenBookings(newHidden);
  };

  const handleShowAllBookings = () => {
    saveHiddenBookings([]);
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      // Get all bookings and remove the deleted one
      const allBookings = getCustomerBookings(user!.id);
      const updatedBookings = allBookings.filter((b: InstantBooking) => b.id !== bookingId);
      localStorage.setItem('instantBookings', JSON.stringify(updatedBookings));
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleFeedback = (bookingId: string, feedback: 'thumbs_up' | 'thumbs_down') => {
    if (feedback === 'thumbs_down') {
      setFeedbackStates(prev => ({
        ...prev,
        [bookingId]: { showMessage: true, message: '' }
      }));
    } else {
      updateBooking(bookingId, { feedback, feedbackMessage: '' });
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSubmitFeedback = (bookingId: string) => {
    const feedbackData = feedbackStates[bookingId];
    if (feedbackData) {
      updateBooking(bookingId, { feedback: 'thumbs_down', feedbackMessage: feedbackData.message });
      setRefreshKey(prev => prev + 1);
      setFeedbackStates(prev => ({
        ...prev,
        [bookingId]: { ...prev[bookingId], showMessage: false }
      }));
    }
  };

  const handleFeedbackMessageChange = (bookingId: string, message: string) => {
    setFeedbackStates(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], message }
    }));
  };

  const handlePayNow = (booking: any) => {
    navigate('/customer/payment', {
      state: {
        service: {
          id: booking.providerId,
          serviceType: booking.serviceType,
          providerName: booking.providerName,
          providerId: booking.providerId
        },
        plan: 'instant',
        price: booking.quote || booking.price,
        bookingId: booking.id
      }
    });
  };

  // Filter visible bookings (exclude hidden ones)
  const visibleBookings = bookings.filter(b => !hiddenBookings.includes(b.id));

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Servease Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl text-pink-600 font-bold">Servease</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-blue-100 mb-6">Manage your subscriptions and services</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/customer/browse-services')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Browse Services
            </button>
            <button
              onClick={() => navigate('/customer/instant-booking')}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Instant Booking
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Subscriptions</p>
                <p className="text-2xl text-gray-900">{subscriptions.filter(s => s.status === 'active').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Instant Bookings</p>
                <p className="text-2xl text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/customer/profile')}
            className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Profile Status</p>
                <p className="text-2xl text-gray-900">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl mb-4 text-gray-900">Active Subscriptions</h3>
          {subscriptions.filter(s => s.status === 'active').length > 0 ? (
            <div className="space-y-4">
              {subscriptions
                .filter(s => s.status === 'active')
                .map(sub => (
                  <div key={sub.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-gray-900">{sub.serviceName}</h4>
                      <p className="text-sm text-gray-600">Provider: {sub.providerName}</p>
                      <p className="text-sm text-gray-600">Plan: {sub.plan} - ${sub.price}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Valid until: {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Active
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No active subscriptions</p>
              <button
                onClick={() => navigate('/customer/browse-services')}
                className="mt-4 text-blue-600 hover:underline"
              >
                Browse services to subscribe
              </button>
            </div>
          )}
        </div>

        {/* Recent Instant Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-gray-900">Recent Instant Bookings</h3>
            {hiddenBookings.length > 0 && (
              <button
                onClick={handleShowAllBookings}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <EyeOff className="w-4 h-4" />
                Show Hidden ({hiddenBookings.length})
              </button>
            )}
          </div>
          
          {visibleBookings.length > 0 ? (
            <div className="space-y-4">
              {visibleBookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-gray-900">{booking.serviceType}</h4>
                      <p className="text-sm text-gray-600">{booking.description}</p>
                      {booking.providerName && (
                        <p className="text-sm text-gray-600">Provider: {booking.providerName}</p>
                      )}
                      {booking.quote && (
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          Quote: ${booking.quote}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                      
                      {/* Hide/Delete options for completed bookings */}
                      {booking.status === 'completed' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleHideBooking(booking.id)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            title="Hide from dashboard"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {/* Payment option for accepted bookings */}
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => handlePayNow(booking)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Thumbs up/down for accepted bookings with quote */}
                  {booking.status === 'accepted' && booking.quote && !booking.feedback && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Rate this quote:</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleFeedback(booking.id, 'thumbs_up')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleFeedback(booking.id, 'thumbs_down')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Too High
                        </button>
                      </div>
                      
                      {/* Feedback message textarea for thumbs down */}
                      {feedbackStates[booking.id]?.showMessage && (
                        <div className="mt-3">
                          <label className="block text-sm text-gray-600 mb-2">
                            Why is the quote too high?
                          </label>
                          <textarea
                            value={feedbackStates[booking.id]?.message || ''}
                            onChange={(e) => handleFeedbackMessageChange(booking.id, e.target.value)}
                            placeholder="Explain why you think the quote is too much..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <button
                            onClick={() => handleSubmitFeedback(booking.id)}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            <Send className="w-4 h-4" />
                            Submit Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Show feedback status if already submitted */}
                  {booking.feedback && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {booking.feedback === 'thumbs_up' ? (
                        <div className="flex items-center gap-2 text-green-700">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">You accepted this quote</span>
                        </div>
                      ) : (
                        <div className="text-red-700">
                          <div className="flex items-center gap-2 mb-1">
                            <ThumbsDown className="w-4 h-4" />
                            <span className="text-sm">You marked this quote as too high</span>
                          </div>
                          {booking.feedbackMessage && (
                            <p className="text-sm text-gray-600 mt-1">Reason: {booking.feedbackMessage}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No instant bookings yet</p>
              <button
                onClick={() => navigate('/customer/instant-booking')}
                className="mt-4 text-blue-600 hover:underline"
              >
                Create your first booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
