import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getProviderSubscriptions, updateUser } from '../../utils/mockData';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';

export default function ServiceManagement() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    serviceArea: user?.serviceArea || '',
    status: user?.status || 'active'
  });

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/login');
      return;
    }

    setSubscriptions(getProviderSubscriptions(user.id));
  }, [user, navigate]);

  const handleSave = () => {
    if (user) {
      updateUser(user.id, editedData);
      // Update context
      login({ ...user, ...editedData });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
      serviceArea: user?.serviceArea || '',
      status: user?.status || 'active'
    });
    setIsEditing(false);
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const completedSubscriptions = subscriptions.filter(s => s.status === 'expired');

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
          <h1 className="text-3xl text-gray-900">Service Management</h1>
          <p className="text-gray-600">Manage your availability and customer subscriptions</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Service Profile */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl text-gray-900">Service Profile</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-gray-700">Provider Name</label>
              <input
                type="text"
                value={user?.name}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">Service Type</label>
              <input
                type="text"
                value={user?.serviceType}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">Service Area</label>
              <input
                type="text"
                value={isEditing ? editedData.serviceArea : user?.serviceArea}
                onChange={(e) => setEditedData({ ...editedData, serviceArea: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' : 'bg-gray-50'
                }`}
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">Availability Status</label>
              <select
                value={isEditing ? editedData.status : user?.status}
                onChange={(e) => setEditedData({ ...editedData, status: e.target.value as any })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' : 'bg-gray-50'
                }`}
              >
                <option value="active">Active (Available for new bookings)</option>
                <option value="pending">Inactive (Not accepting new bookings)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">Mobile</label>
              <input
                type="tel"
                value={user?.mobile}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Rating</p>
              <p className="text-2xl text-gray-900">⭐ {user?.rating || 'N/A'}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Completed Jobs</p>
              <p className="text-2xl text-gray-900">{user?.completedJobs || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Active Customers</p>
              <p className="text-2xl text-gray-900">{activeSubscriptions.length}</p>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl mb-4 text-gray-900">Active Customer Subscriptions</h3>
          {activeSubscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-600">Service</th>
                    <th className="text-left py-3 px-4 text-gray-600">Plan</th>
                    <th className="text-left py-3 px-4 text-gray-600">Price</th>
                    <th className="text-left py-3 px-4 text-gray-600">Start Date</th>
                    <th className="text-left py-3 px-4 text-gray-600">End Date</th>
                    <th className="text-left py-3 px-4 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSubscriptions.map(sub => (
                    <tr key={sub.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{sub.serviceName}</td>
                      <td className="py-3 px-4 text-gray-700 capitalize">{sub.plan}</td>
                      <td className="py-3 px-4 text-gray-900">${sub.price}</td>
                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active subscriptions</p>
          )}
        </div>

        {/* Completed Services */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl mb-4 text-gray-900">Service History</h3>
          {completedSubscriptions.length > 0 ? (
            <div className="space-y-3">
              {completedSubscriptions.map(sub => (
                <div key={sub.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-gray-900">{sub.serviceName}</h4>
                    <p className="text-sm text-gray-600">
                      {sub.plan} - ${sub.price}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    Expired
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No service history</p>
          )}
        </div>
      </div>
    </div>
  );
}
