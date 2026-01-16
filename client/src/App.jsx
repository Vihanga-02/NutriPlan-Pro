import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import HealthScreening from './pages/HealthScreening';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateAdmin from './pages/CreateAdmin';
import UserDashboard from './pages/UserDashboard';
import HealthProfileForm from './pages/HealthProfileForm';
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import FoodManagement from './admin/pages/FoodManagement';
import OrderManagement from './admin/pages/OrderManagement';
import CustomerManagement from './admin/pages/CustomerManagement';
import AdminSettings from './admin/pages/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><Signup /></Layout>} />
          <Route path="/create-admin" element={<Layout><CreateAdmin /></Layout>} />

          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/menu" element={<Layout><Menu /></Layout>} />
          <Route path="/health-screening" element={<Layout><HealthScreening /></Layout>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><UserDashboard /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/health-profile"
            element={
              <ProtectedRoute>
                <Layout><HealthProfileForm /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/foods"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout><FoodManagement /></AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout><OrderManagement /></AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout><CustomerManagement /></AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout><AdminSettings /></AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
