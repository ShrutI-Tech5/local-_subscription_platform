import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getProviderSubscriptions, getProviderBookings, getProviderPayments, getProviderServices, updateUser } from '../../utils/mockData';
import { User, Mail, Phone, MapPin, LogOut, Package, Zap, Star, DollarSign, CheckCircle, Clock, Save, X, Edit2 } from 'lucide-react';

export default function ProviderProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    serviceArea: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/login');
      return;
    }

    setSubscriptions(getProviderSubscriptions(user.id));
    setBookings(getProviderBookings(user.id));
    setPayments(getProviderPayments(user.id));
    setServices(getProviderServices(user.id));
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      serviceArea: user.serviceArea || ''
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
        serviceArea: user.serviceArea || ''
      });
    }
  };

  const handleSave = () => {
    if (user) {
      updateUser(user.id, editForm);
      setIsEditing(false);
      alert('Profile updated successfully!');
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
  const completedJobs = bookings.filter(b => b.status === 'completed').length;
  const pendingRequests = bookings.filter(b => b.status === 'pending').length;
  
  const totalEarnings = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

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

  // Sort by date (most recent first)
  const recentReviews = allReviews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl text-gray-900">Provider Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/provider/dashboard')}
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl mb-2">{user?.name}</h1>
                <p className="text-green-100 mb-2">{user?.serviceType} - {user?.serviceArea}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg">{user?.rating || 'N/A'}</span>
                  <span className="text-green-100">({user?.completedJobs || 0} jobs completed)</span>
                </div>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={editForm.mobile}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Service Area</label>
                    <input
                      type="text"
                      name="serviceArea"
                      value={editForm.serviceArea}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      <p className="text-xs text-gray-500">Service Area</p>
                      <p className="text-gray-900">{user?.serviceArea || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Service Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl mb-4 text-gray-900">Service Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Total Earnings</span>
                  </div>
                  <span className="text-xl text-gray-900">${totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Active Subscriptions</span>
                  </div>
                  <span className="text-xl text-gray-900">{activeSubscriptions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-600">Completed Jobs</span>
                  </div>
                  <span className="text-xl text-gray-900">{completedJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-600">Pending Requests</span>
                  </div>
                  <span className="text-xl text-gray-900">{pendingRequests}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reviews & Subscriptions */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl mb-4 text-gray-900">Customer Reviews</h3>
              {recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.map((review, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-gray-900 font-medium">{review.customerName}</h4>
                          <p className="text-xs text-gray-500">{review.serviceType}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-900">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">{review.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>

            {/* Active Subscriptions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl mb-4 text-gray-900">Active Subscriptions</h3>
              {activeSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  {activeSubscriptions.map(sub => (
                    <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-gray-900 font-medium">{sub.serviceName}</h4>
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
          </div>
        </div>
      </div>
    </div>
  );
}
