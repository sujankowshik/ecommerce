import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
  onAuthStateChangedListener,
  firebaseSignInWithEmail,
  firebaseSignUpWithEmail,
  firebaseSignInWithGoogle,
  firebaseSignOut,
  firebasePasswordReset,
  firebaseSignInWithPhone
} from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }

    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          
          // Send Firebase ID Token to backend to get JWT and role
          const { data } = await api.post('/auth/firebase-login', { idToken });
          
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data));
          setUser(data);
        } catch (error) {
          console.error('Failed to sync user session with backend:', error.message);
        }
      } else {
        // Logged out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Email Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await firebaseSignInWithEmail(email, password);
      const idToken = await result.user.getIdToken();
      
      const { data } = await api.post('/auth/firebase-login', { idToken });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2. Email Register
  const register = async (email, password, name, phoneNumber) => {
    setLoading(true);
    try {
      const result = await firebaseSignUpWithEmail(email, password, name);
      const idToken = await result.user.getIdToken();
      
      const { data } = await api.post('/auth/firebase-login', { idToken, phoneNumber });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3. Google Sign In
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await firebaseSignInWithGoogle();
      const idToken = await result.user.getIdToken();
      
      const { data } = await api.post('/auth/firebase-login', { idToken });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout
  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Password Reset
  const resetPassword = async (email) => {
    return firebasePasswordReset(email);
  };

  // 5.1 Phone OTP Authentication
  const loginWithPhone = async (phoneNumber, appVerifier) => {
    setLoading(true);
    try {
      const confirmationResult = await firebaseSignInWithPhone(phoneNumber, appVerifier);
      
      return {
        confirmOtp: async (otpCode) => {
          const result = await confirmationResult.confirm(otpCode);
          const idToken = await result.user.getIdToken();
          
          const { data } = await api.post('/auth/firebase-login', { idToken });
          
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data));
          setUser(data);
          return data;
        }
      };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 5.2 Custom MERN 6-Digit Email OTP Authentication
  const sendEmailOtp = async (email) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-email-otp', { email });
      return data; // Returns { success, isMock, otp }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async (email, otpCode) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-email-otp', { email, otpCode });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Update Profile
  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      
      // Update local storage user profile keeping the token
      const token = localStorage.getItem('token');
      const updatedUser = { ...data, token };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        loginWithPhone,
        sendEmailOtp,
        verifyEmailOtp,
        logout,
        resetPassword,
        updateProfile,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
