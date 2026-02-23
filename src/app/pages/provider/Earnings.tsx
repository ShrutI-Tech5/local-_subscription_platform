import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getProviderPayments, getProviderSubscriptions } from '../../utils/mockData';
import { ArrowLeft, DollarSign, TrendingUp, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Earnings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/login');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    // Try to load from MongoDB first
    try {
      const paymentsResponse = await fetch(`${API_BASE_URL}/provider/${user?.id}/payments`);
      const paymentsResult = await paymentsResponse.json();
      if (paymentsResult.success) {
        setPayments(paymentsResult.payments);
      }
      
      const subscriptionsResponse = await fetch(`${API_BASE_URL}/provider/${user?.id}/subscriptions`);
      const subscriptionsResult = await subscriptionsResponse.json();
      if (subscriptionsResult.success) {
        setSubscriptions(subscriptionsResult.subscriptions);
      }
    } catch (error) {
      console.error('Error loading data from MongoDB:', error);
    }

    // Fallback to localStorage
    if (user) {
      const localPayments = getProviderPayments(user.id);
      const localSubscriptions = getProviderSubscriptions(user.id);
      if (payments.length === 0) setPayments(localPayments);
      if (subscriptions.length === 0) setSubscriptions(localSubscriptions);
    }
  };

  const totalEarnings = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  // Platform commission (15%)
  const platformCommission = totalEarnings * 0.15;
  const netEarnings = totalEarnings - platformCommission;

  // Monthly earnings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEarnings = payments
    .filter(p => {
      const paymentDate = new Date(p.date || p.created_at);
      return (
        p.status === 'success' &&
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, p) => sum + p.amount, 0);

  // Group payments by month
  const earningsByMonth: { [key: string]: number } = {};
  payments
    .filter(p => p.status === 'success')
    .forEach(p => {
      const date = new Date(p.date || p.created_at);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      earningsByMonth[monthYear] = (earningsByMonth[monthYear] || 0) + p.amount;
    });

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
          <h1 className="text-3xl text-gray-900">Earnings & Revenue</h1>
          <p className="text-gray-600">Track your income and payment history</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Earnings Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-green-100">Total Earnings</p>
            </div>
            <p className="text-3xl mb-1">₹{totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-green-100">Before commission</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-blue-100">Net Earnings</p>
            </div>
            <p className="text-3xl mb-1">₹{netEarnings.toFixed(2)}</p>
            <p className="text-sm text-blue-100">After 15% commission</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-purple-100">This Month</p>
            </div>
            <p className="text-3xl mb-1">₹{monthlyEarnings.toFixed(2)}</p>
            <p className="text-sm text-purple-100">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl mb-4 text-gray-900">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Gross Revenue</span>
              <span className="text-xl text-gray-900">₹{totalEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Platform Commission (15%)</span>
              <span className="text-xl text-red-600">-₹{platformCommission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-900">Net Revenue</span>
              <span className="text-2xl text-green-600">₹{netEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Monthly Report */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl mb-4 text-gray-900">Monthly Revenue Report</h3>
          {Object.keys(earningsByMonth).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(earningsByMonth)
                .reverse()
                .map(([month, amount]) => {
                  const commission = amount * 0.15;
                  const net = amount - commission;
                  return (
                    <div key={month} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-900">{month}</span>
                        <span className="text-xl text-gray-900">₹{amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>After commission:</span>
                        <span className="text-green-600">₹{net.toFixed(2)}</span>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${totalEarnings > 0 ? (amount / totalEarnings) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No earnings data yet</p>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl mb-4 text-gray-900">Payment History</h3>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-600">Commission</th>
                    <th className="text-left py-3 px-4 text-gray-600">Net Amount</th>
                    <th className="text-left py-3 px-4 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())
                    .map(payment => {
                      const commission = payment.amount * 0.15;
                      const netAmount = payment.amount - commission;
                      return (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 text-sm">
                            {new Date(payment.date || payment.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-700 capitalize">
                            {payment.type}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            ₹{payment.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-red-600">
                            -₹{commission.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-green-600">
                            ₹{netAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              payment.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : payment.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No payment history</p>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-blue-900 mb-2">Commission Structure</h4>
          <p className="text-sm text-blue-800">
            The platform charges a 15% commission on all earnings. This commission helps maintain the platform, 
            provide customer support, and market your services to potential customers. Net earnings are calculated 
            after deducting the platform commission.
          </p>
        </div>
      </div>
    </div>
  );
}
