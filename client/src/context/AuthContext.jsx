import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const userData = await api.get('/auth/me', token);
          setUser(userData.user);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, fullName, healthData = null, contactNumber = null, deliveryAddress = null) => {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Create user in backend
      const payload = {
        email,
        password,
        full_name: fullName,
        firebaseToken: token,
        ...healthData
      };

      if (contactNumber) payload.contact_number = contactNumber;
      if (deliveryAddress) payload.delivery_address = deliveryAddress;

      const response = await api.post('/auth/signup', payload, token);

      setUser(response.user);
      return { user: response.user };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signIn = async (email, password) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Get user from backend
      const response = await api.post('/auth/login', {
        firebaseToken: token
      });

      setUser(response.user);
      return { user: response.user };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      // Get or create user in backend
      const response = await api.post('/auth/login', {
        firebaseToken: token
      });

      setUser(response.user);
      return { user: response.user };
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const getToken = async () => {
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  };

  // Refresh the user data from the backend and update context
  const refreshUser = async () => {
    if (!firebaseUser) return null;
    try {
      const token = await firebaseUser.getIdToken();
      const response = await api.get('/auth/me', token);
      if (response && response.user) {
        setUser(response.user);
        return response.user;
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
    return null;
  };

  // Check if user is Google user
  const isGoogleUser = () => {
    if (!firebaseUser) return false;
    const providers = firebaseUser.providerData || [];
    return providers.some(provider => provider.providerId === 'google.com');
  };

  // Update password for email/password users
  const updatePassword = async (currentPassword, newPassword) => {
    // Prefer the latest user from Firebase auth to avoid stale user objects
    const currentUser = auth.currentUser || firebaseUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if user is Google user
    if (isGoogleUser()) {
      throw new Error('Google users cannot change password through this app');
    }

    // Re-authenticate user before password change (Firebase requirement)
    if (!currentUser.email) {
      throw new Error('User email not found');
    }

    // Ensure the account supports password-based authentication
    const hasPasswordProvider = (currentUser.providerData || []).some(p => p.providerId === 'password');
    if (!hasPasswordProvider) {
      throw new Error('This account does not support password changes (use your provider settings)');
    }

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    try {
      await reauthenticateWithCredential(currentUser, credential);
    } catch (err) {
      console.error('Reauthentication failed:', err);
      // rethrow to let caller show a user-facing message
      throw err;
    }
    
    // Update password
    await firebaseUpdatePassword(currentUser, newPassword);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    getToken,
    isGoogleUser,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
