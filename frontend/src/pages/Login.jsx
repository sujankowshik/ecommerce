import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isMockAuthentication } from '../firebase';
import { toast } from 'react-hot-toast';
import { LogIn, Key, Mail, ShieldAlert, MessageSquare } from 'lucide-react';

const Login = () => {
  const { user, login, loginWithGoogle, resetPassword, sendEmailOtp, verifyEmailOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication Mode
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'email-otp'

  // Email States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email OTP States
  const [emailOtpAddress, setEmailOtpAddress] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpMock, setEmailOtpMock] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Target path recovery
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Handle standard Email Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all fields.');
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in! Welcome back.');
    } catch (error) {
      toast.error(error.message || 'Failed to authenticate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Successfully authenticated via Google!');
    } catch (error) {
      toast.error(error.message || 'Google Login failed.');
    }
  };

  // Handle sending Email OTP
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtpAddress.trim()) {
      return toast.error('Please enter your email address.');
    }

    setIsSubmitting(true);
    try {
      const data = await sendEmailOtp(emailOtpAddress);
      setEmailOtpSent(true);
      toast.success('Email OTP verification code sent!');
      
      // If we are in simulated developer mode, the backend returns the OTP code
      // directly in the response so we can toast it for high developer comfort!
      if (data.isMock && data.otp) {
        setEmailOtpMock(data.otp);
        toast(`[Simulator] Code: ${data.otp}`, {
          icon: '🔑',
          duration: 6000
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send Email OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle verifying Email OTP
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtpCode.trim() || emailOtpCode.length !== 6) {
      return toast.error('Please enter a valid 6-digit verification code.');
    }

    setIsSubmitting(true);
    try {
      await verifyEmailOtp(emailOtpAddress, emailOtpCode);
      toast.success('Successfully verified OTP and authenticated!');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      return toast.error('Please enter your email.');
    }

    setIsSendingReset(true);
    try {
      await resetPassword(forgotEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-md w-full glass-panel border border-slate-200/50 dark:border-slate-800/50 p-8 sm:p-10 rounded-3xl shadow-xl fade-in">
        
        {/* Header */}
        <div className="text-center mb-6">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-4 shadow-md shadow-primary-500/20">
            A
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white font-display">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Or{' '}
            <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
              create a free account
            </Link>
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-6 text-xs font-bold select-none space-x-1">
          <button
            onClick={() => { setLoginMode('email'); setEmailOtpSent(false); }}
            className={`flex-1 py-2 rounded-xl text-center transition-all ${
              loginMode === 'email'
                ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => { setLoginMode('email-otp'); }}
            className={`flex-1 py-2 rounded-xl text-center transition-all ${
              loginMode === 'email-otp'
                ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Email OTP
          </button>
        </div>

        {/* Environment Alert Hint */}
        {isMockAuthentication && (
          <div className="mb-6 p-4 rounded-2xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 text-xs text-primary-700 dark:text-primary-300 flex items-start space-x-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold mb-0.5">Developer Simulator Active</p>
              {loginMode === 'email' && (
                <p>Sign in with any credentials. Type <span className="font-bold underline">admin</span> to log in as Administrator!</p>
              )}
              {loginMode === 'email-otp' && (
                <p>Enter any email. The server will print the 6-digit OTP code in the backend console logs and show it in a popup toast!</p>
              )}
            </div>
          </div>
        )}

        {/* 1. EMAIL FORM */}
        {loginMode === 'email' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              
              {/* Email Field */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary-400 dark:focus:border-primary-500/50 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none transition-all"
                  />
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary-400 dark:focus:border-primary-500/50 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none transition-all"
                  />
                  <Key className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3 rounded-2xl"
            >
              <LogIn className="w-5 h-5" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        )}



        {/* 3. EMAIL OTP FORM */}
        {loginMode === 'email-otp' && (
          <div className="space-y-6">
            {!emailOtpSent ? (
              <form onSubmit={handleSendEmailOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={emailOtpAddress}
                      onChange={(e) => setEmailOtpAddress(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary-400 dark:focus:border-primary-500/50 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none transition-all"
                    />
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-3 rounded-2xl font-bold"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>{isSubmitting ? 'Sending code...' : 'Send Email OTP Code'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOtp} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Verification OTP Code</label>
                    <button
                      type="button"
                      onClick={() => setEmailOtpSent(false)}
                      className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={emailOtpCode}
                      onChange={(e) => setEmailOtpCode(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary-400 dark:focus:border-primary-500/50 rounded-2xl py-3 pl-12 pr-4 text-center tracking-widest text-lg font-black outline-none transition-all"
                    />
                    <Key className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                  {emailOtpMock && (
                    <p className="text-center text-xs text-primary-500 font-semibold animate-pulse mt-1">
                      Developer Bypass Code: <span className="underline font-bold">{emailOtpMock}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-3 rounded-2xl font-bold"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{isSubmitting ? 'Verifying...' : 'Verify & Log In'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Separator */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full btn-outline flex items-center justify-center space-x-3 py-3 rounded-2xl hover:scale-[1.01]"
        >
          {/* Google Color Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.433-2.878-6.433-6.433 0-3.556 2.878-6.433 6.433-6.433 1.54 0 2.943.543 4.04 1.439l3.053-3.053C17.26 1.348 14.885.5 12.24.5 5.866.5.6 5.766.6 12.14s5.266 11.64 11.64 11.64c6.3 0 11.45-5.147 11.45-11.64 0-.804-.078-1.577-.21-2.316H12.24z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

      </div>

      {/* Forgot Password Modal Popover */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white mb-2">Reset Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Enter your email address and we'll dispatch a secure password reset link to your inbox.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary-400 dark:focus:border-primary-500/50 rounded-2xl py-3 px-4 text-sm outline-none"
              />
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 btn-secondary py-2.5 rounded-2xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="flex-1 btn-primary py-2.5 rounded-2xl text-sm"
                >
                  {isSendingReset ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
