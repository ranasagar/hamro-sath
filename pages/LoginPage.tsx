import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { AtSymbolIcon, LockClosedIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onLogin: (email: string) => boolean;
  onSwitchToRegister: () => void;
}

const DemoAccountsInfo: React.FC<{ onDemoLogin: (email: string, password: string) => void }> = ({
  onDemoLogin,
}) => {
  const demoUsers = [
    { name: 'Sita Rai', email: 'sitarai@safa.com', password: 'password123' },
    { name: 'Aarav Sharma', email: 'aaravsharma@safa.com', password: 'password123' },
    { name: 'Rajesh Hamal', email: 'rajeshhamal@safa.com', password: 'password123' },
  ];

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or one-click demo login</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {demoUsers.map((user, index) => (
          <motion.button
            key={user.email}
            onClick={() => onDemoLogin(user.email, user.password)}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            {user.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    try {
      await login({ email: email.toLowerCase(), password });
      // Call onLogin for backward compatibility with existing app logic
      onLogin(email.toLowerCase());
    } catch (err) {
      // Error is already set in auth context, but set local error as fallback
      setLocalError(error || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLocalError('');
    try {
      await login({ email: demoEmail, password: demoPassword });
      onLogin(demoEmail);
    } catch (err) {
      setLocalError(error || 'Demo login failed. Please try again.');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col justify-center items-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.h1
            className="text-3xl font-bold text-brand-green-dark mb-2"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Welcome Back!
          </motion.h1>
          <p className="text-gray-600">Log in to continue making a difference.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {displayError && <p className="text-red-500 text-sm text-center">{displayError}</p>}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSymbolIcon className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green text-gray-900 transition-all duration-200"
                placeholder="you@example.com"
                required
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green text-gray-900 transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </motion.div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-green-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{
              scale: loading ? 1 : 1.02,
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <DemoAccountsInfo onDemoLogin={handleDemoLogin} />
        </motion.div>

        <motion.p
          className="text-center text-gray-600 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Don't have an account?{' '}
          <motion.button
            onClick={onSwitchToRegister}
            className="font-semibold text-brand-green hover:underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
