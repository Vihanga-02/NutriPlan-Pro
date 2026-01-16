import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="hidden lg:block space-y-6">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl p-10 text-black shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-yellow-600 bg-opacity-20 p-4 rounded-2xl">
                  <LogIn className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Welcome Back!</h1>
                  <p className="text-sm opacity-80">Sign in to continue your journey</p>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <div className="flex items-start space-x-4 bg-yellow-600 bg-opacity-10 p-4 rounded-xl">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base">AI-Powered Meal Plans</h3>
                    <p className="text-sm opacity-80">Get personalized 14-day nutrition plans tailored to your goals</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 bg-yellow-600 bg-opacity-10 p-4 rounded-xl">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base">Advanced Health Tracking</h3>
                    <p className="text-sm opacity-80">Monitor BMI, TDEE, body fat percentage, and more</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 bg-yellow-600 bg-opacity-10 p-4 rounded-xl">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base">Smart Restaurant Orders</h3>
                    <p className="text-sm opacity-80">Order healthy meals from our nutrition-focused menu</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 bg-yellow-600 bg-opacity-10 p-4 rounded-xl">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base">AI Doctor Assistant</h3>
                    <p className="text-sm opacity-80">24/7 nutrition advice in English & Sinhala</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
                <h3 className="font-bold text-lg text-gray-900">Secure & Private</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your health data is encrypted and protected with industry-standard security measures. We never share your personal information.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border-4 border-yellow-400">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mb-4 shadow-lg">
                <LogIn className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Welcome back to NutriPlan Pro</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-xl shadow-md text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 transition-all hover:scale-105 mb-5"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold"
                    onClick={() => alert('Please contact support for password reset')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border-2 border-transparent rounded-xl shadow-xl text-lg font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 transition-all hover:scale-105 hover:shadow-2xl"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6 mr-2" />
                    Sign In to Dashboard
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
                  <span className="px-4 bg-white text-gray-500 font-medium">New to NutriPlan Pro?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-yellow-400 text-yellow-600 rounded-xl hover:bg-yellow-50 transition-all font-bold text-base hover:scale-105"
                >
                  <User className="w-5 h-5 mr-2" />
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
