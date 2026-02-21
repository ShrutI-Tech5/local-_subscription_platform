import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getCustomerSubscriptions, getCustomerBookings, updateUser } from '../../utils/mockData';
import { User, Mail, Phone, MapPin, LogOut, Package, Zap, CreditCard, Save, X, Edit2 } from 'lucide-react';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    address: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login');
      return;
    }

    setSubscriptions(getCustomerSubscriptions(user.id));
    setBookings(getCustomerBookings(user.id));
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      address: user.address || ''
    });
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        address: user.address || ''
      });
    }
  };

  const handleSave = () => {
    if (user) {
      updateUser(user.id, editForm);
      // Update the user context would require a reload or context update
      // For now, we'll just show success
      setIsEditing(false);
      alert('Profile updated successfully!');
      // Force a reload to get updated user data
      window.location.reload();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const completedBookings = bookings.filter(b => b.status === 'completed');

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
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900 mb-2">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl mb-4 text-gray-900">Personal Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={editForm.mobile}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editForm.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-900">{user?.mobile || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-gray-900">{user?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl mb-4 text-gray-900">Activity Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Active Subscriptions</span>
                  </div>
                  <span className="text-xl text-gray-900">{activeSubscriptions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Instant Bookings</span>
                  </div>
                  <span className="text-xl text-gray-900">{bookings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-600">Completed Jobs</span>
                  </div>
                  <span className="text-xl text-gray-900">{completedBookings.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Subscriptions & Bookings */}
          <div className="md:col-span-2 space-y-6">
            {/* Active Subscriptions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl mb-4 text-gray-900">My Subscriptions</h3>
              {activeSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  {activeSubscriptions.map(sub => (
                    <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-gray-900 font-medium">{sub.serviceName}</h4>
                          <p className="text-sm text-gray-600">Provider: {sub.providerName}</p>
                          <p className="text-sm text-gray-600">Plan: {sub.plan} - ${sub.price}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Valid until: {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No active subscriptions</p>
              )}
            </div>

            {/* Instant Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl mb-4 text-gray-900">My Instant Bookings</h3>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map(booking => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-gray-900 font-medium">{booking.serviceType}</h4>
                          <p className="text-sm text-gray-600">{booking.description}</p>
                          {booking.providerName && (
                            <p className="text-sm text-gray-600">Provider: {booking.providerName}</p>
                          )}
                          {booking.quote && (
                            <p className="text-sm font-medium text-gray-900">Quote: ${booking.quote}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No instant bookings</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
