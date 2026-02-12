import { useState, useEffect } from 'react';
import { Save, Shield, UserPlus, Globe, AlertCircle, CheckCircle, Loader2, Trash2, Users } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const AdminSettings = () => {
  const { getToken, user } = useAuth();
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    delivery_radius: '',
    min_order_amount: '',
  });

  const [adminForm, setAdminForm] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingRestaurant, setSavingRestaurant] = useState(false);

  // Admin profile update form
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Admin management
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [deletingAdminId, setDeletingAdminId] = useState(null);

  // Fetch site settings and admins on component mount
  useEffect(() => {
    fetchSiteSettings();
    fetchAdmins();
    // Initialize profile form with current user data
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        full_name: user.full_name || ''
      }));
    }
  }, [user]);

  const fetchSiteSettings = async () => {
    try {
      setLoadingSettings(true);
      setSettingsError('');
      const settings = await api.get('/site-settings');
      
      setRestaurantSettings({
        name: settings.name || '',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        delivery_radius: settings.delivery_radius?.toString() || '',
        min_order_amount: settings.min_order_amount?.toString() || '',
      });
    } catch (error) {
      console.error('Error fetching site settings:', error);
      setSettingsError('Failed to load settings. Please refresh the page.');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setRestaurantSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setSavingRestaurant(true);

    try {
      const token = await getToken();
      if (!token) {
        setSettingsError('You must be logged in as an admin to save settings');
        setSavingRestaurant(false);
        return;
      }

      const response = await api.put('/site-settings/restaurant', {
        name: restaurantSettings.name,
        email: restaurantSettings.email,
        phone: restaurantSettings.phone,
        address: restaurantSettings.address,
        delivery_radius: parseFloat(restaurantSettings.delivery_radius) || 10,
        min_order_amount: parseFloat(restaurantSettings.min_order_amount) || 15.00,
      }, token);

      setSettingsSuccess('Restaurant settings saved successfully!');
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving restaurant settings:', error);
      setSettingsError(error.message || 'Failed to save restaurant settings');
    } finally {
      setSavingRestaurant(false);
    }
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (adminError) setAdminError('');
    if (adminSuccess) setAdminSuccess('');
  };

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const token = await getToken();
      if (!token) {
        setLoadingAdmins(false);
        return;
      }
      const adminsList = await api.get('/auth/admins', token);
      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    setCreatingAdmin(true);

    try {
      // Validate form
      if (!adminForm.full_name || !adminForm.email || !adminForm.password) {
        setAdminError('All fields are required');
        setCreatingAdmin(false);
        return;
      }

      if (adminForm.password.length < 6) {
        setAdminError('Password must be at least 6 characters long');
        setCreatingAdmin(false);
        return;
      }

      // Call API to create admin (admin-only endpoint)
      const token = await getToken();
      if (!token) {
        setAdminError('You must be logged in as an admin to create new admins');
        setCreatingAdmin(false);
        return;
      }

      const response = await api.post('/auth/create-admin-secure', {
        email: adminForm.email,
        password: adminForm.password,
        full_name: adminForm.full_name
      }, token);

      setAdminSuccess(`Admin account created successfully! Email: ${response.user.email}`);
      setAdminForm({
        full_name: '',
        email: '',
        password: ''
      });
      // Refresh admins list
      await fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      setAdminError(error.message || 'Failed to create admin account');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (profileError) setProfileError('');
    if (profileSuccess) setProfileSuccess('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdatingProfile(true);

    try {
      const token = await getToken();
      if (!token) {
        setProfileError('You must be logged in as an admin');
        setUpdatingProfile(false);
        return;
      }

      // Validate name
      if (!profileForm.full_name || profileForm.full_name.trim() === '') {
        setProfileError('Full name is required');
        setUpdatingProfile(false);
        return;
      }

      // If password fields are filled, validate password
      const isPasswordChange = profileForm.newPassword || profileForm.confirmPassword;
      if (isPasswordChange) {
        if (!profileForm.newPassword || !profileForm.confirmPassword) {
          setProfileError('Both password fields are required to change password');
          setUpdatingProfile(false);
          return;
        }

        if (profileForm.newPassword.length < 6) {
          setProfileError('Password must be at least 6 characters long');
          setUpdatingProfile(false);
          return;
        }

        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setProfileError('Passwords do not match');
          setUpdatingProfile(false);
          return;
        }
      }

      // Update name
      await api.put('/auth/admin/profile', {
        full_name: profileForm.full_name.trim()
      }, token);

      // Update password if provided
      if (isPasswordChange) {
        await api.put('/auth/admin/password', {
          newPassword: profileForm.newPassword
        }, token);
      }

      setProfileSuccess('Profile updated successfully!');
      
      // Refresh user data and admins list
      const updatedUser = await api.get('/auth/me', token);
      setProfileForm(prev => ({
        ...prev,
        full_name: updatedUser.user.full_name,
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Refresh admins list to show updated name
      await fetchAdmins();

      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin account? This action cannot be undone.')) {
      return;
    }

    setDeletingAdminId(adminId);
    setAdminError('');
    setAdminSuccess('');

    try {
      const token = await getToken();
      if (!token) {
        setAdminError('You must be logged in as an admin');
        setDeletingAdminId(null);
        return;
      }

      await api.delete(`/auth/admins/${adminId}`, token);
      setAdminSuccess('Admin account deleted successfully!');
      setTimeout(() => setAdminSuccess(''), 3000);
      // Refresh admins list
      await fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      setAdminError(error.message || 'Failed to delete admin account');
    } finally {
      setDeletingAdminId(null);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
      </div>

      {(settingsError || settingsSuccess) && (
        <div className={`mb-6 p-4 rounded-xl flex items-start space-x-2 ${
          settingsError ? 'bg-red-50 border-2 border-red-400 text-red-700' : 'bg-green-50 border-2 border-green-400 text-green-700'
        }`}>
          {settingsError ? (
            <>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{settingsError}</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{settingsSuccess}</span>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Restaurant Information</h2>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={restaurantSettings.name}
                  onChange={handleRestaurantChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={restaurantSettings.email}
                    onChange={handleRestaurantChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={restaurantSettings.phone}
                    onChange={handleRestaurantChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={restaurantSettings.address}
                  onChange={handleRestaurantChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    name="delivery_radius"
                    step="0.1"
                    value={restaurantSettings.delivery_radius}
                    onChange={handleRestaurantChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Order Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    name="min_order_amount"
                    step="0.01"
                    value={restaurantSettings.min_order_amount}
                    onChange={handleRestaurantChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingRestaurant}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingRestaurant ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Restaurant Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Admin Management Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Manage Admins</h2>
            </div>

            {loadingAdmins ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              </div>
            ) : admins.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No admins found</p>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      admin.id === user?.id
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {admin.full_name}
                        {admin.id === user?.id && (
                          <span className="ml-2 text-xs text-yellow-600 font-normal">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {admin.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        disabled={deletingAdminId === admin.id}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete admin"
                      >
                        {deletingAdminId === admin.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Admin Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <UserPlus className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
            </div>

            {adminError && (
              <div className="mb-4 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{adminError}</span>
              </div>
            )}

            {adminSuccess && (
              <div className="mb-4 bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{adminSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={adminForm.full_name}
                  onChange={handleAdminFormChange}
                  placeholder="Admin Name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={adminForm.email}
                  onChange={handleAdminFormChange}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminFormChange}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={creatingAdmin}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingAdmin ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Add Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {/* Update Profile Section */}
          {user && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-full">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Update Profile</h2>
              </div>

              {profileError && (
                <div className="mb-4 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="mb-4 bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileForm.full_name}
                    onChange={handleProfileFormChange}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Change Password (Optional)</p>
                  <p className="text-xs text-gray-500 mb-4">Leave password fields empty if you don't want to change your password</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={profileForm.newPassword}
                        onChange={handleProfileFormChange}
                        placeholder="••••••••"
                        minLength={6}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      />
                      <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={profileForm.confirmPassword}
                        onChange={handleProfileFormChange}
                        placeholder="••••••••"
                        minLength={6}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security Tips Section */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg p-6 text-black">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8" />
              <h3 className="text-xl font-bold">Security Tips</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Use strong passwords with special characters</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Change passwords regularly</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Never share admin credentials</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Log out when leaving the system</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
