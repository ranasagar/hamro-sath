import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { AtSymbolIcon, LockClosedIcon, UserIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRank, Ward } from '../types';

interface RegisterPageProps {
  wards: Ward[];
  onRegister: (newUser: Omit<UserRank, 'rank' | 'points' | 'stats' | 'activity'>) => void;
  onSwitchToLogin: () => void;
}

const AVATAR_OPTIONS = [
  'https://picsum.photos/id/1005/100/100',
  'https://picsum.photos/id/1011/100/100',
  'https://picsum.photos/id/1025/100/100',
  'https://picsum.photos/id/1027/100/100',
  'https://picsum.photos/id/1040/100/100',
  'https://picsum.photos/id/1043/100/100',
];

const RegisterPage: React.FC<RegisterPageProps> = ({ wards, onRegister, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: AVATAR_OPTIONS[0],
    ward: wards.length > 0 ? wards[0].name : '',
  });
  const [localError, setLocalError] = useState('');
  const { register, loading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setLocalError('Please fill all fields.');
      return;
    }
    setLocalError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    try {
      // Find the ward_id from the ward name
      const selectedWard = wards.find(w => w.name === formData.ward);
      const wardId = selectedWard?.id || 1; // Default to ward 1 if not found

      // Generate username from email (part before @)
      const username = formData.email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      await register({
        email: formData.email.toLowerCase(),
        password: formData.password,
        username: username,
        fullName: formData.name,
        wardId: wardId,
      });

      // Call onRegister for backward compatibility
      onRegister(formData as any);
    } catch (err) {
      setLocalError(error || 'Registration failed. Please try again.');
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
            Join the Movement
          </motion.h1>
          <p className="text-gray-600">Create your account to start cleaning up Nepal.</p>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                onSubmit={handleNextStep}
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {displayError && <p className="text-red-500 text-sm text-center">{displayError}</p>}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AtSymbolIcon className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-green-dark transition-colors duration-300"
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next
                </motion.button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose your Avatar
                  </label>
                  <div className="flex justify-center space-x-2">
                    {AVATAR_OPTIONS.map((avatarUrl, index) => (
                      <motion.img
                        key={avatarUrl}
                        src={avatarUrl}
                        alt="avatar"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: avatarUrl }))}
                        className={`w-12 h-12 rounded-full cursor-pointer border-4 transition-all ${formData.avatar === avatarUrl ? 'border-brand-green' : 'border-transparent hover:border-gray-300'}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                    Select your Ward
                  </label>
                  <select
                    name="ward"
                    id="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900"
                  >
                    {wards.map(ward => (
                      <option key={ward.id} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-green-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{
                      scale: loading ? 1 : 1.02,
                      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                    }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.p
          className="text-center text-gray-600 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Already have an account?{' '}
          <motion.button
            onClick={onSwitchToLogin}
            className="font-semibold text-brand-green hover:underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Log In
          </motion.button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
