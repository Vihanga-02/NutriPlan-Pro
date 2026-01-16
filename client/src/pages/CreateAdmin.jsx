import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, AlertCircle, CheckCircle, Shield, ArrowLeft } from 'lucide-react';

const CreateAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/auth/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin account');
      }

      setSuccess(`Admin account created successfully! Email: ${data.user.email}`);
      
      // Clear form
      setEmail('');
      setPassword('');
      setFullName('');
      
      // Optionally redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border-4 border-yellow-400">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Create Admin Account</h2>
            <p className="text-gray-600">Set up an administrator account for NutriPlan Pro</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm font-medium">{success}</span>
                <p className="text-xs mt-1 opacity-80">Redirecting to login page...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  placeholder="admin@nutriplanpro.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex justify-center items-center py-4 px-4 border-2 border-transparent rounded-xl shadow-xl text-lg font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 transition-all hover:scale-105 hover:shadow-2xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Admin Account...
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6 mr-2" />
                  Create Admin Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-yellow-400 text-yellow-600 rounded-xl hover:bg-yellow-50 transition-all font-bold text-base hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Link>
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-base hover:scale-105"
              >
                Go to Home
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Security Notice:</p>
                <p className="text-xs">
                  This page is for initial admin account setup. In production, consider restricting access to this endpoint or adding additional security measures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;

