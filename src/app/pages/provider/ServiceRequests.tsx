import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getProviderBookings, updateBooking, InstantBooking } from '../../utils/mockData';
import { ArrowLeft, Check, X, Image as ImageIcon, Mic, Volume2, AlertTriangle, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ServiceRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<InstantBooking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected' | 'feedback_received'>('all');
  const [selectedBooking, setSelectedBooking] = useState<InstantBooking | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/login');
      return;
    }

    loadBookings();
  }, [user, navigate]);

  const loadBookings = async () => {
    // Try to load from MongoDB first
    try {
      const response = await fetch(`${API_BASE_URL}/provider/${user?.id}/bookings`);
      const result = await response.json();
      if (result.success && result.bookings.length > 0) {
        setBookings(result.bookings);
        return;
      }
    } catch (error) {
      console.error('Error loading bookings from MongoDB:', error);
    }
    
    // Fallback to localStorage
    if (user) {
      const allBookings = getProviderBookings(user.id);
      setBookings(allBookings);
    }
  };

  const handleAccept = async (bookingId: string) => {
    const amount = parseFloat(quoteAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }

    // Update in MongoDB
    try {
      await fetch(`${API_BASE_URL}/instant-booking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          providerId: user!.id,
          providerName: user!.name,
          price: amount,
          quote: amount
        })
      });
    } catch (error) {
      console.error('Error updating booking in MongoDB:', error);
    }

    // Also update in localStorage
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

  const handleReject = async (bookingId: string) => {
    // Update in MongoDB
    try {
      await fetch(`${API_BASE_URL}/instant-booking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
    } catch (error) {
      console.error('Error updating booking in MongoDB:', error);
    }

    // Also update in localStorage - clear feedback when rejecting
    updateBooking(bookingId, { status: 'rejected', feedback: undefined, feedbackMessage: undefined });
    loadBookings();
    setSelectedBooking(null);
  };

  // Handle changing quote after customer feedback
  const handleChangeQuote = async (bookingId: string) => {
    const amount = parseFloat(quoteAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }

    // Update in MongoDB
    try {
      await fetch(`${API_BASE_URL}/instant-booking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          providerId: user!.id,
          providerName: user!.name,
          price: amount,
          quote: amount,
          feedback: null,
          feedbackMessage: null
        })
      });
    } catch (error) {
      console.error('Error updating booking in MongoDB:', error);
    }

    // Also update in localStorage - clear feedback when changing quote
    updateBooking(bookingId, {
      status: 'accepted',
      providerId: user!.id,
      providerName: user!.name,
      price: amount,
      quote: amount,
      feedback: undefined,
      feedbackMessage: undefined
    });

    loadBookings();
    setSelectedBooking(null);
    setQuoteAmount('');
  };

  const handleComplete = async (bookingId: string) => {
    // Update in MongoDB
    try {
      await fetch(`${API_BASE_URL}/instant-booking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
    } catch (error) {
      console.error('Error updating booking in MongoDB:', error);
    }

    // Also update in localStorage
    updateBooking(bookingId, { status: 'completed' });
    loadBookings();
  };

  // Helper to convert base64 to audio URL
  const getAudioUrl = (voiceNote: string | undefined): string => {
    if (!voiceNote) return '';
    return `data:audio/webm;base64,${voiceNote}`;
  };

  // Get bookings with customer feedback (thumbs down)
  const bookingsWithFeedback = bookings.filter(b => b.status === 'accepted' && b.feedback === 'thumbs_down');
  
  // Filter bookings based on current filter
  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    if (filter === 'feedback_received') return bookingsWithFeedback;
    return bookings.filter(b => b.status === filter);
  };

  const filteredBookings = getFilteredBookings();

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
            {(['all', 'pending', 'accepted', 'completed', 'rejected', 'feedback_received'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'feedback_received' ? 'Feedback' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white text-green-600 rounded-full text-xs">
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                )}
                {status === 'feedback_received' && bookingsWithFeedback.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                    {bookingsWithFeedback.length}
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

                  {/* Voice Note Section */}
                  {(booking as any).voiceNote && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-700 mb-2">
                        <Mic className="w-4 h-4" />
                        <span className="text-sm font-medium">Voice Note</span>
                      </div>
                      <audio 
                        controls 
                        src={getAudioUrl((booking as any).voiceNote)} 
                        className="w-full h-10"
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mb-4">
                    Requested: {new Date(booking.createdAt).toLocaleString()}
                  </p>

                  {booking.price && (
                    <p className="text-lg text-gray-900 mb-4">
                      Quote: ${booking.price}
                    </p>
                  )}

                  {/* Show customer feedback if available */}
                  {booking.feedback === 'thumbs_down' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Customer Feedback: Rate Too High</span>
                      </div>
                      {booking.feedbackMessage && (
                        <p className="text-sm text-gray-600">"{booking.feedbackMessage}"</p>
                      )}
                    </div>
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
                    <div className="space-y-2">
                      {/* Show option to change quote if customer gave feedback */}
                      {booking.feedback === 'thumbs_down' ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setQuoteAmount(booking.price?.toString() || '');
                            }}
                            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Change Quote
                          </button>
                          <button
                            onClick={() => handleReject(booking.id)}
                            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Reject Booking
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleComplete(booking.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
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

      {/* Accept Modal / Change Quote Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl mb-4 text-gray-900">
              {selectedBooking.feedback === 'thumbs_down' ? 'Change Your Quote' : 'Accept Request'}
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2"><strong>Customer:</strong> {selectedBooking.customerName}</p>
              <p className="text-gray-600 mb-2"><strong>Service:</strong> {selectedBooking.serviceType}</p>
              <p className="text-gray-600 mb-4"><strong>Description:</strong> {selectedBooking.description}</p>
              
              {/* Show customer feedback in modal if available */}
              {selectedBooking.feedback === 'thumbs_down' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Customer said rate is too high</span>
                  </div>
                  {selectedBooking.feedbackMessage && (
                    <p className="text-sm text-gray-600">Reason: "{selectedBooking.feedbackMessage}"</p>
                  )}
                </div>
              )}
              
              {/* Voice Note in Modal */}
              {(selectedBooking as any).voiceNote && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <Mic className="w-4 h-4" />
                    <span className="text-sm font-medium">Voice Note</span>
                  </div>
                  <audio 
                    controls 
                    src={getAudioUrl((selectedBooking as any).voiceNote)} 
                    className="w-full h-10"
                  />
                </div>
              )}
              
              {selectedBooking.image && (
                <img
                  src={selectedBooking.image}
                  alt="Problem"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-gray-700">
                {selectedBooking.feedback === 'thumbs_down' ? 'New Quote Amount ($) *' : 'Your Quote Amount ($) *'}
              </label>
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
                onClick={() => {
                  if (selectedBooking.feedback === 'thumbs_down') {
                    handleChangeQuote(selectedBooking.id);
                  } else {
                    handleAccept(selectedBooking.id);
                  }
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                {selectedBooking.feedback === 'thumbs_down' ? 'Submit New Quote' : 'Send Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
