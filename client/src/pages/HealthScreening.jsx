import { useState } from 'react';
import { Calculator, TrendingUp, Activity, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const HealthScreening = () => {
  const { user, getToken } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    neck_cm: '',
    waist_cm: '',
    hip_cm: '',
    activity_level: 'moderate',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestedFoods, setSuggestedFoods] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    customer_name: user?.full_name || '',
    contact_number: '',
    delivery_address: '',
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateMetrics = () => {
    setLoading(true);

    const weight = parseFloat(formData.weight_kg);
    const height = parseFloat(formData.height_cm);
    const age = parseInt(formData.age);

    const bmi = weight / Math.pow(height / 100, 2);

    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (formData.gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 78;
    }

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };
    const tdee = bmr * multipliers[formData.activity_level];

    let bodyFatPct = null;
    if (showAdvanced && formData.neck_cm && formData.waist_cm) {
      const h_in = height / 2.54;
      const w_in = parseFloat(formData.waist_cm) / 2.54;
      const n_in = parseFloat(formData.neck_cm) / 2.54;

      if (formData.gender === 'male') {
        const x = w_in - n_in;
        if (x > 0 && h_in > 0) {
          bodyFatPct = 86.010 * Math.log10(x) - 70.041 * Math.log10(h_in) + 36.76;
        }
      } else if (formData.gender === 'female' && formData.hip_cm) {
        const hip_in = parseFloat(formData.hip_cm) / 2.54;
        const x = w_in + hip_in - n_in;
        if (x > 0 && h_in > 0) {
          bodyFatPct = 163.205 * Math.log10(x) - 97.684 * Math.log10(h_in) - 78.387;
        }
      }
    }

    setTimeout(async () => {
      const calculatedResults = {
        bmi: bmi.toFixed(2),
        bmr: bmr.toFixed(2),
        tdee: tdee.toFixed(2),
        bodyFatPct: bodyFatPct ? bodyFatPct.toFixed(2) : null,
      };
      setResults(calculatedResults);
      setLoading(false);

      // Fetch suggested foods based on health metrics
      await fetchSuggestedFoods(parseFloat(bmi), parseFloat(tdee), bodyFatPct);
    }, 500);
  };

  const getCurrentMealType = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Breakfast: 6-11 AM
    if (hour >= 6 && hour < 11) {
      return 'breakfast';
    }
    // Lunch: 11 AM - 3 PM
    if (hour >= 11 && hour < 15) {
      return 'lunch';
    }
    // Tea time: 3-6 PM
    if (hour >= 15 && hour < 18) {
      return 'teatime';
    }
    // Dinner: 6-11 PM
    if (hour >= 18 && hour < 23) {
      return 'dinner';
    }
    // After 11 PM to 6 AM: no suggestions
    return null;
  };

  const fetchSuggestedFoods = async (bmi, tdee, bodyFatPct) => {
    try {
      setLoadingSuggestions(true);
      // Determine meal type on client side using local time
      const mealType = getCurrentMealType();
      
      if (!mealType) {
        setSuggestedFoods([]);
        setLoadingSuggestions(false);
        return;
      }

      const response = await api.get(
        `/foods/suggest?bmi=${bmi}&tdee=${tdee}&meal_type=${mealType}${bodyFatPct ? `&body_fat_pct=${bodyFatPct}` : ''}`
      );
      setSuggestedFoods(response.foods || []);
    } catch (error) {
      console.error('Error fetching suggested foods:', error);
      setSuggestedFoods([]);
    } finally {
      setLoadingSuggestions(false);
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

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Calculator className="mx-auto h-16 w-16 text-yellow-400" />
          <h1 className="text-4xl font-bold mt-4">Health Screening</h1>
          <p className="text-gray-600 mt-2">
            Calculate your BMI, BMR, TDEE, and Body Fat Percentage
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="170"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="70"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level
              </label>
              <select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                <option value="active">Active (exercise 6-7 days/week)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-yellow-400 font-semibold hover:underline mb-4"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Mode (Body Fat Calculation)
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-yellow-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Neck (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="neck_cm"
                  value={formData.neck_cm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="35"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waist (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="waist_cm"
                  value={formData.waist_cm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hip (cm) {formData.gender === 'female' && '(Required)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="hip_cm"
                  value={formData.hip_cm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="95"
                />
              </div>
            </div>
          )}

          <button
            onClick={calculateMetrics}
            disabled={loading || !formData.age || !formData.height_cm || !formData.weight_kg}
            className="w-full bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 font-bold transition disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Health Metrics'}
          </button>
        </div>

        {results && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Your Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6">
                <TrendingUp className="w-8 h-8 text-yellow-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">BMI</div>
                <div className="text-3xl font-bold">{results.bmi}</div>
                <div className={`text-sm font-semibold mt-1 ${getBMICategory(parseFloat(results.bmi)).color}`}>
                  {getBMICategory(parseFloat(results.bmi)).text}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6">
                <Activity className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">BMR</div>
                <div className="text-3xl font-bold">{results.bmr}</div>
                <div className="text-sm text-gray-600">cal/day</div>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6">
                <Activity className="w-8 h-8 text-green-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">TDEE</div>
                <div className="text-3xl font-bold">{results.tdee}</div>
                <div className="text-sm text-gray-600">cal/day</div>
              </div>

              {results.bodyFatPct && (
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6">
                  <Activity className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Body Fat</div>
                  <div className="text-3xl font-bold">{results.bodyFatPct}%</div>
                  <div className="text-sm text-gray-600">U.S. Navy Method</div>
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-xl">
              <h3 className="font-bold text-lg mb-2">What's Next?</h3>
              <p className="text-gray-700 mb-4">
                Based on your TDEE of {results.tdee} calories/day, you can maintain your weight by consuming this amount. To lose weight, reduce by 300-500 calories. To gain weight, increase by 300-500 calories.
              </p>
              <p className="text-gray-700">
                For personalized 14-day meal plans and progress tracking, create a free account!
              </p>
            </div>
          </div>
        )}

        {/* Suggested Foods Section */}
        {results && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Suggested Foods for You</h2>
            {loadingSuggestions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : suggestedFoods.length > 0 ? (
              <>
                <p className="text-gray-600 mb-4">
                  Based on your health metrics and current time, here are some recommended meal options:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {suggestedFoods.map((food) => {
                    const cartItem = cart.find((item) => item.id === food.id);
                    return (
                      <div key={food.id} className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-yellow-400 transition">
                        <img
                          src={food.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={food.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold">{food.name}</h3>
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
                {cart.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="font-bold">{cart.length} item(s) in cart</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-400">Rs. {getTotalPrice()}</span>
                    </div>
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 font-bold"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">
                  {getCurrentMealType() === null 
                    ? 'No meal suggestions available at this time. Please check back during meal hours (6 AM - 11 PM).'
                    : 'No suitable food suggestions found for your current meal time.'}
                </p>
                {getCurrentMealType() !== null && (
                  <p className="text-sm text-gray-400">
                    {getCurrentMealType() === 'teatime' 
                      ? 'Please ensure bakery items are available in the menu.'
                      : 'Please ensure restaurant items are available in the menu.'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-10">
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

export default HealthScreening;
