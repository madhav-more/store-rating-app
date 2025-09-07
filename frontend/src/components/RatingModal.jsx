import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import RatingStars from './RatingStars';
import LoadingSpinner from './LoadingSpinner';

// Validation schema
const ratingSchema = yup.object({
  rating: yup
    .number()
    .min(1, 'Please select a rating')
    .max(5, 'Rating cannot exceed 5')
    .required('Rating is required'),
  comment: yup
    .string()
    .max(500, 'Comment must not exceed 500 characters')
});

const RatingModal = ({ 
  isOpen, 
  onClose, 
  store, 
  existingRating = null, 
  onRatingSubmitted 
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(existingRating?.rating || 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm({
    resolver: yupResolver(ratingSchema),
    defaultValues: {
      rating: existingRating?.rating || 0,
      comment: existingRating?.comment || ''
    }
  });

  // Update form when existing rating changes
  useEffect(() => {
    if (existingRating) {
      setSelectedRating(existingRating.rating);
      setValue('rating', existingRating.rating);
      setValue('comment', existingRating.comment || '');
    } else {
      setSelectedRating(0);
      reset();
    }
  }, [existingRating, setValue, reset]);

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (existingRating) {
        // Update existing rating
        await axios.put(`/api/ratings/${existingRating.id}`, data);
        toast.success('Rating updated successfully!');
      } else {
        // Submit new rating
        await axios.post('/api/ratings', {
          ...data,
          storeId: store.id
        });
        toast.success('Rating submitted successfully!');
      }

      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        `Failed to ${existingRating ? 'update' : 'submit'} rating`;
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
          className="relative w-full max-w-md mx-4 card"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {existingRating ? 'Update Rating' : 'Rate Store'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-glass-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store Info */}
          <div className="mb-6 p-4 glass rounded-lg">
            <h3 className="font-medium text-text-primary">{store?.name}</h3>
            <p className="text-sm text-text-secondary mt-1">{store?.address}</p>
            {store?.averageRating > 0 && (
              <div className="mt-2">
                <RatingStars 
                  rating={store.averageRating} 
                  size="sm" 
                  showValue={true}
                />
                <span className="text-xs text-text-muted ml-2">
                  ({store.totalRatings} review{store.totalRatings !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>

          {/* Rating Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Selection */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Star className="w-4 h-4" />
                Your Rating
              </label>
              <div className="flex items-center justify-center py-4">
                <RatingStars
                  rating={selectedRating}
                  size="lg"
                  interactive={true}
                  onRatingChange={handleRatingChange}
                  showValue={false}
                />
              </div>
              <div className="text-center">
                <span className="text-lg font-medium text-accent">
                  {selectedRating > 0 ? `${selectedRating} out of 5 stars` : 'Select a rating'}
                </span>
              </div>
              {errors.rating && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error text-center"
                >
                  {errors.rating.message}
                </motion.p>
              )}
            </div>

            {/* Comment */}
            <div className="form-group">
              <label htmlFor="comment" className="form-label">
                Comment (Optional)
              </label>
              <textarea
                {...register('comment')}
                id="comment"
                rows={4}
                placeholder="Share your experience with this store..."
                className={`form-input w-full resize-none ${
                  errors.comment ? 'border-neon-pink' : ''
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.comment ? (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-error"
                  >
                    {errors.comment.message}
                  </motion.p>
                ) : (
                  <span className="text-xs text-text-muted">Optional</span>
                )}
                <span className="text-xs text-text-muted">
                  {watch('comment')?.length || 0}/500
                </span>
              </div>
            </div>

            {/* Submit Button */}
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
                disabled={loading || selectedRating === 0}
                className="btn btn-primary flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {existingRating ? 'Update Rating' : 'Submit Rating'}
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

export default RatingModal;
