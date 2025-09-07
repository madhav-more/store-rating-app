import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Mail, MapPin, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

// Validation schema
const storeSchema = yup.object({
  name: yup
    .string()
    .min(10, 'Store name must be at least 10 characters')
    .max(60, 'Store name must not exceed 60 characters')
    .required('Store name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  address: yup
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .required('Address is required'),
  ownerId: yup
    .string()
    .required('Store owner is required')
});

const StoreFormModal = ({ 
  isOpen, 
  onClose, 
  store = null, 
  onStoreSaved 
}) => {
  const [loading, setLoading] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const isEdit = Boolean(store);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(storeSchema),
    defaultValues: {
      name: store?.name || '',
      email: store?.email || '',
      address: store?.address || '',
      ownerId: store?.ownerId?._id || ''
    }
  });

  // Fetch available store owners (users with role 'storeOwner' who don't have a store yet)
  const fetchStoreOwners = async () => {
    try {
      setLoadingOwners(true);
      const response = await axios.get('/api/users?role=storeOwner&limit=100');
      
      // Filter out store owners who already have stores (except current store owner if editing)
      const availableOwners = response.data.users.filter(owner => 
        !owner.storeId || (isEdit && owner._id === store?.ownerId?._id)
      );
      
      setStoreOwners(availableOwners);
    } catch (error) {
      console.error('Error fetching store owners:', error);
      toast.error('Failed to load store owners');
    } finally {
      setLoadingOwners(false);
    }
  };

  // Reset form when store changes
  useEffect(() => {
    reset({
      name: store?.name || '',
      email: store?.email || '',
      address: store?.address || '',
      ownerId: store?.ownerId?._id || ''
    });
  }, [store, reset]);

  // Load store owners when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStoreOwners();
    }
  }, [isOpen]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (isEdit) {
        // Update store
        await axios.put(`/api/stores/${store._id}`, {
          name: data.name,
          email: data.email,
          address: data.address
        });
        toast.success('Store updated successfully!');
      } else {
        // Create store
        await axios.post('/api/stores', data);
        toast.success('Store created successfully!');
      }

      if (onStoreSaved) {
        onStoreSaved();
      }
      
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        `Failed to ${isEdit ? 'update' : 'create'} store`;
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
              {isEdit ? 'Edit Store' : 'Create New Store'}
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
            {/* Store Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label flex items-center gap-2">
                <Store className="w-4 h-4" />
                Store Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Enter store name (min 10 characters)"
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
                Store Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="Enter store email address"
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

            {/* Address Field */}
            <div className="form-group">
              <label htmlFor="address" className="form-label flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Store Address
              </label>
              <textarea
                {...register('address')}
                id="address"
                rows={3}
                placeholder="Enter store address (max 400 characters)"
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

            {/* Store Owner Field (only for creating new stores) */}
            {!isEdit && (
              <div className="form-group">
                <label htmlFor="ownerId" className="form-label flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Store Owner
                </label>
                <select
                  {...register('ownerId')}
                  id="ownerId"
                  disabled={loadingOwners}
                  className={`form-input w-full ${
                    errors.ownerId ? 'border-neon-pink' : ''
                  }`}
                >
                  <option value="">
                    {loadingOwners ? 'Loading...' : 'Select a store owner'}
                  </option>
                  {storeOwners.map((owner) => (
                    <option key={owner._id} value={owner._id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                {errors.ownerId && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-error"
                  >
                    {errors.ownerId.message}
                  </motion.p>
                )}
                {!loadingOwners && storeOwners.length === 0 && (
                  <p className="text-xs text-text-muted mt-1">
                    No available store owners found. Create a user with the 'Store Owner' role first.
                  </p>
                )}
              </div>
            )}

            {/* Current Owner (for editing) */}
            {isEdit && store?.ownerId && (
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Current Owner
                </label>
                <div className="p-3 glass rounded-lg border border-border-glass">
                  <p className="font-medium text-text-primary">{store.ownerId.name}</p>
                  <p className="text-sm text-text-secondary">{store.ownerId.email}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Store owner cannot be changed after creation
                  </p>
                </div>
              </div>
            )}

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
                disabled={loading || (!isEdit && storeOwners.length === 0)}
                className="btn btn-primary flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    {isEdit ? 'Update Store' : 'Create Store'}
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

export default StoreFormModal;
