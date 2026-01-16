import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, DollarSign, Plus } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { getToken } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalFoods: 0,
    totalUsers: 0,
  });
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const [statsData, ordersData, foodsData, usersData] = await Promise.all([
        api.get('/orders/stats', token),
        api.get('/orders', token),
        api.get('/foods', token),
        api.get('/auth/users', token).catch(() => ({ users: [] })), // Fallback if endpoint doesn't exist
      ]);

      setOrders(ordersData || []);
      setFoods(foodsData || []);

      setStats({
        totalOrders: statsData.totalOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
        totalFoods: foodsData?.length || 0,
        totalUsers: Array.isArray(usersData) ? usersData.length : (usersData?.users?.length || 0),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = await getToken();
      await api.put(`/orders/${orderId}/status`, { status: newStatus }, token);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Orders</div>
                <div className="text-3xl font-bold">{stats.totalOrders}</div>
              </div>
              <ShoppingCart className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-3xl font-bold">Rs. {(Number(stats.totalRevenue) || 0).toFixed(2)}</div>
              </div>
              <DollarSign className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Foods</div>
                <div className="text-3xl font-bold">{stats.totalFoods}</div>
              </div>
              <Package className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </div>
              <Users className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b">
            <div className="flex space-x-4 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-4 font-semibold border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-600'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('foods')}
                className={`py-4 px-4 font-semibold border-b-2 transition ${
                  activeTab === 'foods'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-600'
                }`}
              >
                Food Items
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Contact</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-3 px-4">#{order.id}</td>
                          <td className="py-3 px-4">{order.customer_name}</td>
                          <td className="py-3 px-4">{order.contact_number}</td>
                          <td className="py-3 px-4 font-bold">Rs. {order.total_amount}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                order.order_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.order_status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.order_status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={order.order_status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'foods' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Food Inventory</h2>
                  <button className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 font-semibold flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Food</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {foods.map((food) => (
                    <div key={food.id} className="border rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{food.name}</h3>
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                          Rs. {food.price}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2 capitalize">
                        {food.category}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <div className="font-bold">{food.calories}</div>
                          <div className="text-gray-500">Cal</div>
                        </div>
                        <div>
                          <div className="font-bold">{food.protein_g}g</div>
                          <div className="text-gray-500">Protein</div>
                        </div>
                        <div>
                          <div className="font-bold">{food.carbs_g}g</div>
                          <div className="text-gray-500">Carbs</div>
                        </div>
                        <div>
                          <div className="font-bold">{food.fat_g}g</div>
                          <div className="text-gray-500">Fat</div>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 bg-blue-500 text-white py-1 rounded text-sm hover:bg-blue-600">
                          Edit
                        </button>
                        <button className="flex-1 bg-red-500 text-white py-1 rounded text-sm hover:bg-red-600">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
