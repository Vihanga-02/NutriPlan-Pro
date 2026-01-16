import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Menu = () => {
  const { user, getToken } = useAuth();
  const [foods, setFoods] = useState([]);
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    customer_name: user?.full_name || '',
    contact_number: '',
    delivery_address: '',
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, [category]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const endpoint = category !== 'all' ? `/foods?category=${category}` : '/foods';
      const data = await api.get(endpoint);
      
      // Transform meal_types array to match expected format
      const transformedFoods = data.map(food => ({
        ...food,
        meal_types: food.meal_types || []
      }));
      
      setFoods(transformedFoods);
    } catch (error) {
      console.error('Error fetching foods:', error);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (food) => {
    const existing = cart.find((item) => item.id === food.id);
    if (existing) {
      setCart(cart.map((item) => (item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...food, quantity: 1 }]);
    }
  };

  const removeFromCart = (foodId) => {
    const existing = cart.find((item) => item.id === foodId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map((item) => (item.id === foodId ? { ...item, quantity: item.quantity - 1 } : item)));
    } else {
      setCart(cart.filter((item) => item.id !== foodId));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!checkoutData.customer_name || !checkoutData.contact_number || !checkoutData.delivery_address) {
      alert('Please fill in all required fields');
      return;
    }

    setCheckoutLoading(true);
    try {
      const token = await getToken().catch(() => null); // Allow guest checkout
      const items = cart.map(item => ({
        food_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const orderData = {
        customer_name: checkoutData.customer_name,
        contact_number: checkoutData.contact_number,
        delivery_address: checkoutData.delivery_address,
        items,
        total_amount: parseFloat(getTotalPrice())
      };

      await api.post('/orders', orderData, token);
      alert('Order placed successfully!');
      setCart([]);
      setShowCheckout(false);
      setCheckoutData({
        customer_name: user?.full_name || '',
        contact_number: '',
        delivery_address: '',
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Our Menu</h1>
          <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>{cart.length} items - Rs. {getTotalPrice()}</span>
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setCategory('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              category === 'all' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCategory('restaurant')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              category === 'restaurant' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Restaurant
          </button>
          <button
            onClick={() => setCategory('bakery')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              category === 'bakery' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Bakery
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => {
              const cartItem = cart.find((item) => item.id === food.id);
              return (
                <div key={food.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={food.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={food.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{food.name}</h3>
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                        Rs. {food.price}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{food.calories}</div>
                        <div className="text-gray-500">Cal</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{food.protein_g}g</div>
                        <div className="text-gray-500">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{food.carbs_g}g</div>
                        <div className="text-gray-500">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{food.fat_g}g</div>
                        <div className="text-gray-500">Fat</div>
                      </div>
                    </div>
                    {cartItem ? (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => removeFromCart(food.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg">{cartItem.quantity}</span>
                        <button
                          onClick={() => addToCart(food)}
                          className="bg-yellow-400 text-black p-2 rounded-lg hover:bg-yellow-500"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(food)}
                        className="w-full bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 font-semibold"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cart.length > 0 && (
          <div className="fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl p-6 w-80">
            <h3 className="text-xl font-bold mb-4">Cart Summary</h3>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-sm">{item.name} x{item.quantity}</span>
                  <span className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-bold text-yellow-400">Rs. {getTotalPrice()}</span>
              </div>
              <button 
                onClick={() => setShowCheckout(true)}
                className="w-full bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 font-bold"
              >
                Checkout
              </button>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={checkoutData.customer_name}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customer_name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={checkoutData.contact_number}
                    onChange={(e) => setCheckoutData({ ...checkoutData, contact_number: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={checkoutData.delivery_address}
                    onChange={(e) => setCheckoutData({ ...checkoutData, delivery_address: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    rows="3"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="text-2xl font-bold text-yellow-400">Rs. {getTotalPrice()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="flex-1 px-4 py-3 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 font-bold disabled:opacity-50"
                >
                  {checkoutLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
