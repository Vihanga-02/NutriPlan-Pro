import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, TrendingUp, Calendar, Activity, X, Plus, Edit, Save, ShoppingCart, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const UserDashboard = () => {
  const { user, getToken, firebaseUser, isGoogleUser, updatePassword, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [healthProfile, setHealthProfile] = useState(null);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [creatingMealPlan, setCreatingMealPlan] = useState(false);
  const [viewingMealPlan, setViewingMealPlan] = useState(null);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [orderingMealPlan, setOrderingMealPlan] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    contact_number: '',
    delivery_address: ''
  });
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    delivery_address: user?.delivery_address || '',
    contact_number: user?.contact_number || '',
    password: '',
    new_password: '',
    confirm_password: ''
  });
  const [mealPlanForm, setMealPlanForm] = useState({
    goal_type: 'lose',
    target_weight_change: '1.0',
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user && location.pathname === '/dashboard') {
      fetchUserData();
    }
  }, [user, location.pathname]); // Refetch when location changes (e.g., returning from profile form)

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Fetch user data with delivery_address
      const userData = await api.get('/auth/me', token);
      if (userData.user) {
        setProfileForm(prev => ({
          ...prev,
          full_name: userData.user.full_name || '',
          delivery_address: userData.user.delivery_address || '',
          contact_number: userData.user.contact_number || ''
        }));
      }

      const profile = await api.get('/health/profile', token);
      const plans = await api.get('/meal-plans/my-plans', token);

      setHealthProfile(profile);
      setMealPlans(plans || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.message.includes('404') || error.message.includes('not found')) {
        setHealthProfile(null);
      }
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMealPlan = async (e) => {
    e.preventDefault();
    setCreatingMealPlan(true);
    
    try {
      const token = await getToken();
      const mealPlanData = {
        goal_type: mealPlanForm.goal_type,
        target_weight_change: parseFloat(mealPlanForm.target_weight_change),
        start_date: mealPlanForm.start_date
      };

      await api.post('/meal-plans', mealPlanData, token);
      
      // Refresh meal plans
      await fetchUserData();
      setShowMealPlanModal(false);
      setMealPlanForm({
        goal_type: 'lose',
        target_weight_change: '1.0',
        start_date: new Date().toISOString().split('T')[0]
      });
      alert('Meal plan created successfully!');
    } catch (error) {
      console.error('Error creating meal plan:', error);
      alert(error.message || 'Failed to create meal plan. Please try again.');
    } finally {
      setCreatingMealPlan(false);
    }
  };

  const handleViewMealPlan = async (planId) => {
    setLoadingMealPlan(true);
    try {
      const token = await getToken();
      const plan = await api.get(`/meal-plans/${planId}`, token);
      setViewingMealPlan(plan);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      alert(error.message || 'Failed to load meal plan details.');
    } finally {
      setLoadingMealPlan(false);
    }
  };

  const getMealTypeLabel = (mealType) => {
    const labels = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      teatime: 'Tea Time',
      dinner: 'Dinner'
    };
    return labels[mealType] || mealType;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const updateData = {
        full_name: profileForm.full_name,
        delivery_address: profileForm.delivery_address,
        contact_number: profileForm.contact_number
      };

      // Handle password change for email/password users
      if (profileForm.new_password) {
        if (profileForm.new_password !== profileForm.confirm_password) {
          alert('New passwords do not match');
          return;
        }
        if (profileForm.new_password.length < 6) {
          alert('Password must be at least 6 characters long');
          return;
        }

        // Check if user is Google user
        if (isGoogleUser()) {
          alert('You are logged in with Google. Password changes must be done from your Google account settings.');
          return;
        }

        // Validate current password is provided
        if (!profileForm.password) {
          alert('Please enter your current password to change it');
          return;
        }

        // Update password in Firebase
        try {
          await updatePassword(profileForm.password, profileForm.new_password);
        } catch (firebaseError) {
          console.error('Firebase password update error:', firebaseError);
          let errorMessage = 'Failed to update password';
          if (firebaseError.code === 'auth/wrong-password') {
            errorMessage = 'Current password is incorrect';
          } else if (firebaseError.code === 'auth/weak-password') {
            errorMessage = 'New password is too weak';
          } else if (firebaseError.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid credential. Please re-enter your current password and try again.';
          } else if (firebaseError.code === 'auth/requires-recent-login') {
            errorMessage = 'Please sign in again and try to change your password.';
          } else if (firebaseError.message) {
            errorMessage = firebaseError.message;
          }
          alert(errorMessage);
          return;
        }
      }

      // Update profile in backend
      const response = await api.put('/auth/profile', updateData, token);

      // Refresh auth user in context (so UI shows updated phone immediately)
      try {
        await refreshUser();
      } catch (err) {
        console.error('Error refreshing user after profile update:', err);
      }

      // Refresh other user-related data (health profile, meal plans)
      await fetchUserData();

      setEditingProfile(false);
      setProfileForm(prev => ({
        ...prev,
        password: '',
        new_password: '',
        confirm_password: ''
      }));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile');
    }
  };

  const handleOrderMealPlan = async (e) => {
    e.preventDefault();
    // Use profile data if form fields are empty
    const contactNumber = orderForm.contact_number || profileForm.contact_number || user?.contact_number || '';
    const deliveryAddress = orderForm.delivery_address || profileForm.delivery_address || user?.delivery_address || '';

    if (!contactNumber || !deliveryAddress) {
      alert('Please fill in contact number and delivery address. You can update these in your profile.');
      return;
    }

    setOrderingMealPlan(true);
    try {
      const token = await getToken();
      await api.post(`/meal-plans/${viewingMealPlan.id}/order`, {
        contact_number: contactNumber,
        delivery_address: deliveryAddress
      }, token);

      alert('Diet plan order placed successfully!');
      setShowOrderModal(false);
      setOrderForm({ contact_number: '', delivery_address: '' });
      setViewingMealPlan(null);
    } catch (error) {
      console.error('Error ordering meal plan:', error);
      alert(error.message || 'Failed to place order');
    } finally {
      setOrderingMealPlan(false);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Welcome, {user?.full_name}</h1>
          <p className="text-gray-600 mt-2">Your personalized health dashboard</p>
        </div>

        {!healthProfile ? (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-2">Complete Your Health Profile</h2>
            <p className="text-gray-700 mb-4">
              Set up your health profile to unlock personalized meal plans and tracking.
            </p>
            <button 
              onClick={() => navigate('/health-profile')}
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 font-semibold transition"
            >
              Complete Profile
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <User className="w-8 h-8 text-yellow-400 mb-2" />
                <div className="text-sm text-gray-600">BMI</div>
                <div className="text-2xl font-bold">
                  {healthProfile.bmi != null ? Number(healthProfile.bmi).toFixed(1) : 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <Activity className="w-8 h-8 text-blue-500 mb-2" />
                <div className="text-sm text-gray-600">BMR</div>
                <div className="text-2xl font-bold">
                  {healthProfile.bmr != null ? Number(healthProfile.bmr).toFixed(0) : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">cal/day</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                <div className="text-sm text-gray-600">TDEE</div>
                <div className="text-2xl font-bold">
                  {healthProfile.tdee != null ? Number(healthProfile.tdee).toFixed(0) : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">cal/day</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <Activity className="w-8 h-8 text-purple-500 mb-2" />
                <div className="text-sm text-gray-600">Body Fat</div>
                <div className="text-2xl font-bold">
                  {healthProfile.body_fat_pct ? `${healthProfile.body_fat_pct}%` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Meal Plans</h2>
                <button
                  onClick={() => setShowMealPlanModal(true)}
                  className="flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Plan</span>
                </button>
              </div>
              {mealPlans.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No meal plans yet</p>
                  <button
                    onClick={() => setShowMealPlanModal(true)}
                    className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 font-bold"
                  >
                    Create 14-Day Meal Plan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mealPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg capitalize">
                            {plan.goal_type} {plan.target_weight_change}kg
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {new Date(plan.start_date).toLocaleDateString()} -{' '}
                            {new Date(plan.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Daily Target: {plan.daily_calorie_target} calories
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewMealPlan(plan.id)}
                          className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold"
                        >
                          View Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Profile Information</h2>
                <button
                  onClick={() => {
                    setEditingProfile(!editingProfile);
                    if (!editingProfile) {
                      // Load current user data
                      fetchUserData();
                    }
                  }}
                  className="flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold transition"
                >
                  <Edit className="w-5 h-5" />
                  <span>{editingProfile ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              {editingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      value={profileForm.delivery_address}
                      onChange={(e) => setProfileForm({ ...profileForm, delivery_address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      rows="3"
                      required
                      placeholder="Enter your delivery address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.contact_number}
                      onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="e.g., +1 555 555 5555"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold mb-4">Change Password</h3>
                    {isGoogleUser() ? (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-blue-900">Google Account</p>
                            <p className="text-sm text-blue-700 mt-1">
                              You are logged in with Google. Password changes must be done from your Google account settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Password *
                          </label>
                          <input
                            type="password"
                            value={profileForm.password}
                            onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                            placeholder="Enter current password"
                            required={!!profileForm.new_password}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={profileForm.new_password}
                            onChange={(e) => setProfileForm({ ...profileForm, new_password: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                            placeholder="Leave blank to keep current password"
                            minLength={6}
                          />
                          <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>
                        {profileForm.new_password && (
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Confirm New Password *
                            </label>
                            <input
                              type="password"
                              value={profileForm.confirm_password}
                              onChange={(e) => setProfileForm({ ...profileForm, confirm_password: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                              placeholder="Confirm new password"
                              minLength={6}
                              required
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileForm({
                          full_name: user?.full_name || '',
                          delivery_address: user?.delivery_address || '',
                          contact_number: user?.contact_number || '',
                          password: '',
                          new_password: '',
                          confirm_password: ''
                        });
                      }}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 font-bold flex items-center justify-center space-x-2"
                    >
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Full Name</div>
                    <div className="font-bold text-lg">{user?.full_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="font-bold text-lg">{user?.email || 'N/A'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Delivery Address</div>
                    <div className="font-bold">{user?.delivery_address || 'Not set'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Contact Number</div>
                    <div className="font-bold">{user?.contact_number || 'Not set'}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Health Profile</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Age</div>
                  <div className="font-bold">{healthProfile.age}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Gender</div>
                  <div className="font-bold capitalize">{healthProfile.gender}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Height</div>
                  <div className="font-bold">{healthProfile.height_cm} cm</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Weight</div>
                  <div className="font-bold">{healthProfile.weight_kg} kg</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Activity</div>
                  <div className="font-bold capitalize">{healthProfile.activity_level}</div>
                </div>
                {healthProfile.neck_cm && (
                  <div>
                    <div className="text-sm text-gray-600">Neck</div>
                    <div className="font-bold">{healthProfile.neck_cm} cm</div>
                  </div>
                )}
                {healthProfile.waist_cm && (
                  <div>
                    <div className="text-sm text-gray-600">Waist</div>
                    <div className="font-bold">{healthProfile.waist_cm} cm</div>
                  </div>
                )}
                {healthProfile.hip_cm && (
                  <div>
                    <div className="text-sm text-gray-600">Hip</div>
                    <div className="font-bold">{healthProfile.hip_cm} cm</div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/health-profile')}
                  className="text-yellow-600 hover:text-yellow-700 font-semibold"
                >
                  Update Health Profile →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Meal Plan Creation Modal */}
      {showMealPlanModal && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 zoom-in relative z-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create 14-Day Meal Plan</h2>
              <button
                onClick={() => setShowMealPlanModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateMealPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Goal Type *
                </label>
                <select
                  value={mealPlanForm.goal_type}
                  onChange={(e) => setMealPlanForm({ ...mealPlanForm, goal_type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                >
                  <option value="lose">Lose Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Weight Change (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  value={mealPlanForm.target_weight_change}
                  onChange={(e) => setMealPlanForm({ ...mealPlanForm, target_weight_change: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="1.0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be between 0.5 and 2.0 kg</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={mealPlanForm.start_date}
                  onChange={(e) => setMealPlanForm({ ...mealPlanForm, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMealPlanModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingMealPlan}
                  className="flex-1 px-4 py-3 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 font-bold disabled:opacity-50"
                >
                  {creatingMealPlan ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meal Plan View Modal */}
      {viewingMealPlan && (
        <div className="modal-backdrop flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8 zoom-in relative z-50">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold">
                  {viewingMealPlan.goal_type === 'lose' ? 'Lose' : 'Gain'} {viewingMealPlan.target_weight_change}kg - 14 Day Meal Plan
                </h2>
                <p className="text-sm opacity-80">
                  {new Date(viewingMealPlan.start_date).toLocaleDateString()} - {new Date(viewingMealPlan.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // Pre-fill with user profile data
                    setOrderForm({
                      contact_number: profileForm.contact_number || user?.contact_number || '',
                      delivery_address: profileForm.delivery_address || user?.delivery_address || ''
                    });
                    setShowOrderModal(true);
                  }}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold transition"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Order This Plan</span>
                </button>
                <button
                  onClick={() => setViewingMealPlan(null)}
                  className="text-black hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingMealPlan ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6 p-4 bg-yellow-50 rounded-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Daily Calorie Target</p>
                        <p className="text-xl font-bold">{viewingMealPlan.daily_calorie_target} cal</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Goal Type</p>
                        <p className="text-xl font-bold capitalize">{viewingMealPlan.goal_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Target Change</p>
                        <p className="text-xl font-bold">{viewingMealPlan.target_weight_change} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-xl font-bold">14 Days</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {viewingMealPlan.meal_plan_days && viewingMealPlan.meal_plan_days.length > 0 ? (
                      viewingMealPlan.meal_plan_days.map((day, dayIndex) => {
                        const dayMeals = day.meals || [];
                        const mealsByType = {
                          breakfast: dayMeals.filter(m => m.meal_type === 'breakfast'),
                          lunch: dayMeals.filter(m => m.meal_type === 'lunch'),
                          teatime: dayMeals.filter(m => m.meal_type === 'teatime'),
                          dinner: dayMeals.filter(m => m.meal_type === 'dinner')
                        };

                        const dayTotal = dayMeals.reduce((sum, meal) => ({
                          calories: sum.calories + (parseFloat(meal.calories) || 0),
                          protein: sum.protein + (parseFloat(meal.protein_g) || 0),
                          carbs: sum.carbs + (parseFloat(meal.carbs_g) || 0),
                          fat: sum.fat + (parseFloat(meal.fat_g) || 0)
                        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

                        return (
                          <div key={day.id} className="border-2 border-gray-200 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-xl font-bold">
                                Day {dayIndex + 1} - {new Date(day.plan_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                              </h3>
                              <div className="text-sm text-gray-600">
                                Total: {dayTotal.calories.toFixed(0)} cal
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {['breakfast', 'lunch', 'teatime', 'dinner'].map(mealType => {
                                const meals = mealsByType[mealType] || [];
                                if (meals.length === 0) return null;

                                return (
                                  <div key={mealType} className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-bold text-lg mb-3 text-yellow-600">
                                      {getMealTypeLabel(mealType)}
                                    </h4>
                                    <div className="space-y-3">
                                      {meals.map((meal, idx) => (
                                        <div key={meal.id || idx} className="flex items-start space-x-3">
                                          {meal.image_url && (
                                            <img
                                              src={meal.image_url}
                                              alt={meal.food_name}
                                              className="w-16 h-16 object-cover rounded-lg"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <p className="font-semibold">{meal.food_name}</p>
                                            <p className="text-xs text-gray-600">
                                              Portion: {parseFloat(meal.portion_size || 1).toFixed(1)}x
                                            </p>
                                            <div className="flex space-x-3 text-xs mt-1">
                                              <span className="text-gray-600">
                                                {parseFloat(meal.calories || 0).toFixed(0)} cal
                                              </span>
                                              <span className="text-blue-600">
                                                P: {parseFloat(meal.protein_g || 0).toFixed(1)}g
                                              </span>
                                              <span className="text-green-600">
                                                C: {parseFloat(meal.carbs_g || 0).toFixed(1)}g
                                              </span>
                                              <span className="text-orange-600">
                                                F: {parseFloat(meal.fat_g || 0).toFixed(1)}g
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between text-sm">
                                <span className="font-semibold">Day Totals:</span>
                                <div className="flex space-x-4">
                                  <span>Calories: <strong>{dayTotal.calories.toFixed(0)}</strong></span>
                                  <span>Protein: <strong>{dayTotal.protein.toFixed(1)}g</strong></span>
                                  <span>Carbs: <strong>{dayTotal.carbs.toFixed(1)}g</strong></span>
                                  <span>Fat: <strong>{dayTotal.fat.toFixed(1)}g</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No meal details available for this plan.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Meal Plan Modal */}
      {showOrderModal && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 zoom-in relative z-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Order Diet Plan</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleOrderMealPlan} className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your contact number and delivery address from your profile are pre-filled. You can update them here or edit your profile for future orders.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={orderForm.contact_number}
                  onChange={(e) => setOrderForm({ ...orderForm, contact_number: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder={profileForm.contact_number || user?.contact_number || "+1234567890"}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={orderForm.delivery_address}
                  onChange={(e) => setOrderForm({ ...orderForm, delivery_address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  rows="3"
                  required
                  placeholder={profileForm.delivery_address || user?.delivery_address || "Enter delivery address"}
                />
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will create a diet plan order in the admin dashboard. The admin will process and deliver your 14-day meal plan.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderingMealPlan}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{orderingMealPlan ? 'Placing Order...' : 'Place Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
