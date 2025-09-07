import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Star, Mail, Lock, User, MapPin, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Validation schema matching backend requirements
const registerSchema = yup.object({
  name: yup
    .string()
    .min(10, 'Name must be at least 10 characters')
    .max(60, 'Name must not exceed 60 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      'Password must include at least one uppercase letter and one special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  address: yup
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .required('Address is required')
});

const RegisterPage = () => {
  const { register: registerUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    await registerUser(userData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4"
          >
            <Star className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create Account</h1>
          <p className="text-text-secondary">Join StoreRate to start rating stores</p>
        </div>

        {/* Registration Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onSubmit={handleSubmit(onSubmit)}
          className="card space-y-6"
        >
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <div className="relative">
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Enter your full name (min 10 characters)"
                className={`form-input w-full pl-10 ${
                  errors.name ? 'border-neon-pink' : ''
                }`}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="form-error"
              >
                {errors.name.message}
              </motion.p>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="Enter your email address"
                className={`form-input w-full pl-10 ${
                  errors.email ? 'border-neon-pink' : ''
                }`}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="form-error"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Address Field */}
          <div className="form-group">
            <label htmlFor="address" className="form-label flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </label>
            <div className="relative">
              <textarea
                {...register('address')}
                id="address"
                rows={3}
                placeholder="Enter your address (max 400 characters)"
                className={`form-input w-full pl-10 resize-none ${
                  errors.address ? 'border-neon-pink' : ''
                }`}
              />
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            </div>
            {errors.address && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="form-error"
              >
                {errors.address.message}
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Create a secure password"
                className={`form-input w-full pl-10 pr-10 ${
                  errors.password ? 'border-neon-pink' : ''
                }`}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="form-error"
              >
                {errors.password.message}
              </motion.p>
            )}
            <p className="text-xs text-text-muted mt-1">
              8-16 characters, at least one uppercase letter and one special character
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Confirm your password"
                className={`form-input w-full pl-10 pr-10 ${
                  errors.confirmPassword ? 'border-neon-pink' : ''
                }`}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="form-error"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-neon-blue hover:text-neon-purple transition-colors font-medium"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
