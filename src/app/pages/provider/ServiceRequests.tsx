import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getProviderBookings, updateBooking, InstantBooking } from '../../utils/mockData';
import { ArrowLeft, Check, X, Image as ImageIcon } from 'lucide-react';

export default function ServiceRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<InstantBooking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all');
  const [selectedBooking, setSelectedBooking] = useState<InstantBooking | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/login');
      return;
    }

    loadBookings();
  }, [user, navigate]);

  const loadBookings = () => {
    if (user) {
      const allBookings = getProviderBookings(user.id);
      setBookings(allBookings);
    }
  };

  const handleAccept = (bookingId: string) => {
    const amount = parseFloat(quoteAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }

    updateBooking(bookingId, {
      status: 'accepted',
      providerId: user!.id,
      providerName: user!.name,
      price: amount,
      quote: amount
    });

    loadBookings();
    setSelectedBooking(null);
    setQuoteAmount('');
  };

  const handleReject = (bookingId: string) => {
    updateBooking(bookingId, {
      status: 'rejected'
    });
    loadBookings();
    setSelectedBooking(null);
  };

  const handleComplete = (bookingId: string) => {
    updateBooking(bookingId, {
      status: 'completed'
    });
    loadBookings();
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl text-gray-900">Service Requests</h1>
          <p className="text-gray-600">Manage instant booking requests from customers</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'pending', 'accepted', 'completed', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white text-green-600 rounded-full text-xs">
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {booking.image && (
                  <img
                    src={booking.image}
                    alt="Problem"
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg text-gray-900">{booking.serviceType}</h3>
                      <p className="text-sm text-gray-600">{booking.customerName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{booking.description}</p>

                  <p className="text-xs text-gray-500 mb-4">
                    Requested: {new Date(booking.createdAt).toLocaleString()}
                  </p>

                  {booking.price && (
                    <p className="text-lg text-gray-900 mb-4">
                      Quote: ${booking.price}
                    </p>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === 'accepted' && booking.providerId === user?.id && (
                    <button
                      onClick={() => handleComplete(booking.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No service requests yet' 
                : `No ${filter} requests`}
            </p>
          </div>
        )}
      </div>

      {/* Accept Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl mb-4 text-gray-900">Accept Request</h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2"><strong>Customer:</strong> {selectedBooking.customerName}</p>
              <p className="text-gray-600 mb-2"><strong>Service:</strong> {selectedBooking.serviceType}</p>
              <p className="text-gray-600 mb-4"><strong>Description:</strong> {selectedBooking.description}</p>
              
              {selectedBooking.image && (
                <img
                  src={selectedBooking.image}
                  alt="Problem"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-gray-700">Your Quote Amount ($) *</label>
              <input
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your price quote"
                min="1"
                step="0.01"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setQuoteAmount('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAccept(selectedBooking.id)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
