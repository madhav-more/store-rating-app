import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, MapPin, Lock, Shield, Store, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

// Validation schema
const userSchema = yup.object({
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
    .when('isEdit', {
      is: false,
      then: (schema) => schema.required('Password is required'),
      otherwise: (schema) => schema.optional()
    }),
  address: yup
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .required('Address is required'),
  role: yup
    .string()
    .oneOf(['admin', 'user', 'storeOwner'], 'Please select a valid role')
    .required('Role is required')
});

const UserFormModal = ({ 
  isOpen, 
  onClose, 
  user = null, 
  onUserSaved 
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      address: user?.address || '',
      role: user?.role || 'user',
      isEdit: isEdit
    }
  });

  // Reset form when user changes
  useEffect(() => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      address: user?.address || '',
      role: user?.role || 'user',
      isEdit: isEdit
    });
  }, [user, reset, isEdit]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Remove password if empty on edit
      const submitData = { ...data };
      delete submitData.isEdit;
      if (isEdit && !submitData.password) {
        delete submitData.password;
      }

      if (isEdit) {
        // Update user
        await axios.put(`/api/users/${user._id}`, submitData);
        toast.success('User updated successfully!');
      } else {
        // Create user
        await axios.post('/api/users', submitData);
        toast.success('User created successfully!');
      }

      if (onUserSaved) {
        onUserSaved();
      }
      
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        `Failed to ${isEdit ? 'update' : 'create'} user`;
      toast.error(errorMessage);
      
      // Show field-specific errors if available
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.message);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedRole = watch('role');

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return {
          icon: Shield,
          color: 'text-neon-purple',
          bg: 'bg-gradient-primary',
          description: 'Full system access, can manage users and stores'
        };
      case 'storeOwner':
        return {
          icon: Store,
          color: 'text-neon-blue',
          bg: 'bg-gradient-secondary',
          description: 'Can manage their store and view ratings'
        };
      case 'user':
        return {
          icon: UserCheck,
          color: 'text-neon-green',
          bg: 'bg-gradient-accent',
          description: 'Can browse stores and submit ratings'
        };
      default:
        return {
          icon: User,
          color: 'text-text-muted',
          bg: 'bg-bg-glass',
          description: ''
        };
    }
  };

  const roleInfo = getRoleInfo(selectedRole);
  const RoleIcon = roleInfo.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-4 card max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {isEdit ? 'Edit User' : 'Create New User'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-glass-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Enter full name (min 10 characters)"
                className={`form-input w-full ${
                  errors.name ? 'border-neon-pink' : ''
                }`}
              />
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
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="Enter email address"
                className={`form-input w-full ${
                  errors.email ? 'border-neon-pink' : ''
                }`}
              />
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

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password {isEdit && <span className="text-xs text-text-muted">(leave blank to keep current)</span>}
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                placeholder={isEdit ? "Leave blank to keep current password" : "Create a secure password"}
                className={`form-input w-full ${
                  errors.password ? 'border-neon-pink' : ''
                }`}
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errors.password.message}
                </motion.p>
              )}
              {!isEdit && (
                <p className="text-xs text-text-muted mt-1">
                  8-16 characters, at least one uppercase letter and one special character
                </p>
              )}
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label htmlFor="address" className="form-label flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <textarea
                {...register('address')}
                id="address"
                rows={3}
                placeholder="Enter address (max 400 characters)"
                className={`form-input w-full resize-none ${
                  errors.address ? 'border-neon-pink' : ''
                }`}
              />
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

            {/* Role Field */}
            <div className="form-group">
              <label htmlFor="role" className="form-label flex items-center gap-2">
                <Shield className="w-4 h-4" />
                User Role
              </label>
              <select
                {...register('role')}
                id="role"
                className={`form-input w-full ${
                  errors.role ? 'border-neon-pink' : ''
                }`}
              >
                <option value="">Select a role</option>
                <option value="user">Normal User</option>
                <option value="storeOwner">Store Owner</option>
                <option value="admin">System Administrator</option>
              </select>
              {errors.role && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errors.role.message}
                </motion.p>
              )}

              {/* Role Info */}
              {selectedRole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 glass rounded-lg border border-border-glass"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${roleInfo.bg}`}>
                      <RoleIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${roleInfo.color}`}>
                        {selectedRole === 'storeOwner' ? 'Store Owner' : 
                         selectedRole === 'admin' ? 'System Administrator' : 'Normal User'}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {roleInfo.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    {isEdit ? 'Update User' : 'Create User'}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserFormModal;
