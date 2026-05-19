import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Mail, Lock, User, Briefcase, ArrowLeft, Shield, AlertTriangle, Clock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'motion/react';
import { event } from '../utils/analytics';

type AuthMode = 'selection' | 'user' | 'dealer';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('selection');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [showAdminIdField, setShowAdminIdField] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup, loginWithGoogle, lockoutUntil, recordFailedAttempt, failedAttempts, findUserByEmail, isPendingSecurityVerification, confirmSecurityKey } = useAuth();
  const { masterAdminEmail, masterAdminPass, miniAdmins } = useAdmin();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('supreme_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  React.useEffect(() => {
    if (lockoutUntil) {
      const interval = setInterval(() => {
        const diff = new Date(lockoutUntil).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft(null);
          clearInterval(interval);
        } else {
          setTimeLeft(Math.ceil(diff / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (lockoutUntil && new Date(lockoutUntil) > new Date()) {
      setError(`Too many failed attempts. Try again in ${Math.floor((timeLeft || 0) / 60)}m ${(timeLeft || 0) % 60}s`);
      setIsLoading(false);
      return;
    }

    if (!isLogin && !showAdminIdField) {
      const nameWords = name.trim().split(/\s+/);
      if (nameWords.length < 2) {
        setError('Full name must consist of at least two words (First and Last name).');
        setIsLoading(false);
        return;
      }
    }

    // Check for Master Admin
    if (email === masterAdminEmail && password === masterAdminPass) {
      try {
        await login(email, password);
        const firestoreUser = await findUserByEmail(email);
        if (firestoreUser) {
          if (firestoreUser.isSecurityKeyEnabled) {
            setIsLoading(false);
            return;
          }
        }
        event({ action: 'login', category: 'Auth', label: 'admin' });
        navigate('/admin');
        return;
      } catch (err: any) {
        // If user doesn't exist in Firebase Auth yet, we can try to signup them
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            await signup(email, password, 'Master Admin', 'admin');
            event({ action: 'signup', category: 'Auth', label: 'admin' });
            navigate('/admin');
            return;
          } catch (signupErr: any) {
            if (signupErr.code === 'auth/email-already-in-use') {
              setError('Admin account exists but password is incorrect. Please use the correct password.');
            } else {
              setError(signupErr.message || 'Admin login/signup failed.');
            }
            setIsLoading(false);
            return;
          }
        }
        let errorMessage = err.message || 'Admin login failed.';
        if (err.code === 'auth/invalid-credential') {
          errorMessage = 'Invalid admin credentials. Please check your password.';
        }
        setError(errorMessage);
        setIsLoading(false);
        return;
      }
    }

    // Check for Mini Admin
    const miniAdmin = miniAdmins.find(a => a.email === email);
    if (miniAdmin) {
      if (!showAdminIdField) {
        setShowAdminIdField(true);
        setIsLoading(false);
        return; // Wait for them to enter Admin ID
      }
      
      if (adminId === miniAdmin.adminId) {
        try {
          await login(email, password);
          const firestoreUser = await findUserByEmail(email);
          if (firestoreUser) {
            if (firestoreUser.isSecurityKeyEnabled) {
              setIsLoading(false);
              return;
            }
          }
          event({ action: 'login', category: 'Auth', label: 'mini-admin' });
          navigate('/admin');
          return;
        } catch (err: any) {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            try {
              await signup(email, password, miniAdmin.name, 'mini-admin');
              event({ action: 'signup', category: 'Auth', label: 'mini-admin' });
              navigate('/admin');
              return;
            } catch (signupErr: any) {
              if (signupErr.code === 'auth/email-already-in-use') {
                setError('Mini Admin account exists but password is incorrect.');
              } else {
                setError(signupErr.message || 'Mini Admin login/signup failed.');
              }
              setIsLoading(false);
              return;
            }
          }
          setError(err.message || 'Mini Admin login failed.');
          setIsLoading(false);
          return;
        }
      } else {
        recordFailedAttempt();
        setError('Invalid Admin ID');
        setIsLoading(false);
        return;
      }
    }

    // Regular User/Dealer Login/Signup (Real logic)
    try {
      if (isLogin) {
        try {
          await login(email, password);
          const firestoreUser = await findUserByEmail(email);
          if (firestoreUser) {
            if (firestoreUser.isSecurityKeyEnabled) {
              setIsLoading(false);
              return;
            }
            event({ action: 'login', category: 'Auth', label: firestoreUser.role });
            navigate(firestoreUser.role === 'admin' || firestoreUser.role === 'mini-admin' ? '/admin' : '/');
          } else {
            // This case should ideally not happen if auth succeeded but firestore doc is missing
            navigate('/');
          }
        } catch (loginErr: any) {
          // If login fails because user doesn't exist, try to sign them up automatically
          if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
            const role = mode === 'dealer' ? 'dealer' : 'user';
            await signup(email, password, name || (role === 'dealer' ? 'Supreme Dealer' : 'Supreme User'), role as any);
            event({ action: 'signup', category: 'Auth', label: role });
            navigate('/');
            return;
          }
          throw loginErr;
        }
      } else {
        const role = mode === 'dealer' ? 'dealer' : 'user';
        await signup(email, password, name || (role === 'dealer' ? 'Supreme Dealer' : 'Supreme User'), role as any);
        event({ action: 'signup', category: 'Auth', label: role });
        navigate('/');
      }

      if (rememberMe) {
        localStorage.setItem('supreme_remembered_email', email);
      } else {
        localStorage.removeItem('supreme_remembered_email');
      }
    } catch (err: any) {
      recordFailedAttempt();
      let errorMessage = err.message || 'Authentication failed. Please try again.';
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. If you had an account previously, please sign up again as this is a new Firebase project.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please sign up to create a new account.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      event({ action: 'login_google', category: 'Auth', label: 'user' });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
      setIsLoading(false);
    }
  };

  const generateStrongPassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(retVal);
    setShowPassword(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      // Simulate API call for now as Firebase reset password is not explicitly implemented in AuthContext yet
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetEmailSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setIsLogin(true);
    setIsForgotPassword(false);
    setResetEmailSent(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {mode === 'selection' ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl glass-panel p-8 md:p-12 rounded-3xl border border-gray-200 shadow-xl bg-white/90 text-center"
          >
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] flex items-center justify-center shadow-lg shadow-[var(--color-supreme-gold)]/20">
                <Crown className="text-white w-10 h-10" />
              </div>
            </div>
            
            <h1 className="text-4xl font-display font-bold text-[var(--color-supreme-text)] mb-4">
              Welcome to Supreme
            </h1>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
              Choose your path to access the exclusive network.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <button
                onClick={() => { setMode('user'); resetForm(); }}
                className="group relative overflow-hidden p-8 rounded-2xl border-2 border-gray-100 hover:border-[var(--color-supreme-gold)] transition-all duration-300 bg-white hover:shadow-xl text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-supreme-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <User className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">User Access</h3>
                  <p className="text-gray-500">
                    Join as a member to explore the market, connect with others, and enjoy premium content.
                  </p>
                </div>
              </button>

              <button
                onClick={() => { setMode('dealer'); resetForm(); }}
                className="group relative overflow-hidden p-8 rounded-2xl border-2 border-gray-100 hover:border-[var(--color-supreme-gold)] transition-all duration-300 bg-white hover:shadow-xl text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-supreme-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Dealer Portal</h3>
                  <p className="text-gray-500">
                    Register as a verified dealer to list products, manage ads, and grow your business.
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="auth-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md glass-panel p-8 rounded-3xl border border-gray-200 shadow-xl bg-white/90 relative"
          >
            <button 
              onClick={() => setMode('selection')}
              className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${mode === 'dealer' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {mode === 'dealer' ? <Briefcase className="w-8 h-8" /> : <User className="w-8 h-8" />}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-[var(--color-supreme-text)] mb-2">
              {isForgotPassword ? 'Reset Password' : (mode === 'dealer' ? 'Dealer Portal' : 'User Access')}
            </h2>
            <p className="text-center text-gray-500 mb-8">
              {isForgotPassword 
                ? 'Enter your email to receive a reset link' 
                : (isLogin ? 'Sign in to your account' : 'Create your account')}
            </p>

            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {resetEmailSent ? (
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center border border-green-100">
                    <p className="font-bold mb-2">Reset Link Sent!</p>
                    <p className="text-sm">Please check your email for instructions to reset your password.</p>
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="mt-4 text-[var(--color-supreme-gold)] font-bold hover:underline"
                    >
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-md mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : 'Send Reset Link'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                  {timeLeft !== null && timeLeft > 0 && (
                    <div className="flex items-center gap-2 text-xs font-mono bg-red-100 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>Lockout: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>
                  )}
                </div>
              )}
              
              {!isLogin && !showAdminIdField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {mode === 'dealer' ? 'Business Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      placeholder={mode === 'dealer' ? "Supreme Motors Ltd." : "John Doe"}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {!showAdminIdField && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      {!isLogin && (
                        <button
                          type="button"
                          onClick={generateStrongPassword}
                          className="text-xs text-[var(--color-supreme-gold)] hover:underline font-medium"
                        >
                          Suggest Strong Password
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-5 h-5 border-2 border-gray-200 rounded-md bg-white peer-checked:bg-[var(--color-supreme-gold)] peer-checked:border-[var(--color-supreme-gold)] transition-all"></div>
                          <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                      </label>
                      <button 
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm text-[var(--color-supreme-gold)] font-bold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </>
              )}

              {showAdminIdField && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Admin ID</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-supreme-gold)]" />
                    <input 
                      type="text" 
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-supreme-gold)] focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-white shadow-sm font-mono uppercase"
                      placeholder="ADM-XXXXXXXXX"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Please enter your Special Admin ID to continue.
                  </p>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-md mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  showAdminIdField ? 'Verify Admin ID' : (isLogin ? 'Sign In' : 'Create Account')
                )}
              </button>
            </form>
          )}

            {mode === 'user' && (
              <>
                <div className="mt-6 flex items-center justify-between">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="px-4 text-sm text-gray-500">OR</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full mt-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Clock className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </button>
              </>
            )}

            <p className="mt-8 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[var(--color-supreme-gold)] font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
