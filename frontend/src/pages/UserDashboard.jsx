import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Store, Edit3, Trash2, Plus, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import RatingStars from '../components/RatingStars';
import RatingModal from '../components/RatingModal';
import LoadingSpinner from '../components/LoadingSpinner';

const UserDashboard = () => {
  const { user } = useAuth();
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    favoriteStore: null
  });

  // Fetch user's ratings
  const fetchMyRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ratings/user/my-ratings');
      setMyRatings(response.data.ratings);
      
      // Calculate stats
      const ratings = response.data.ratings;
      if (ratings.length > 0) {
        const totalRatings = ratings.length;
        const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
        
        // Find most highly rated store by user
        const favoriteStore = ratings.reduce((prev, current) => 
          (prev.rating > current.rating) ? prev : current
        );

        setStats({
          totalRatings,
          averageRating: Math.round(averageRating * 10) / 10,
          favoriteStore: favoriteStore.storeId
        });
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load your ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRatings();
  }, []);

  // Handle rating actions
  const openEditModal = (rating) => {
    setSelectedRating({
      id: rating._id,
      rating: rating.rating,
      comment: rating.comment
    });
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedRating(null);
  };

  const handleRatingUpdated = () => {
    fetchMyRatings();
  };

  const deleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      await axios.delete(`/api/ratings/${ratingId}`);
      toast.success('Rating deleted successfully');
      fetchMyRatings();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete rating';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-text-secondary">
              Here's an overview of your store ratings and activity
            </p>
          </div>
          <Link
            to="/stores"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Rate New Store
          </Link>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">{stats.totalRatings}</h3>
            <p className="text-text-secondary">Stores Rated</p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-secondary mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              {stats.averageRating > 0 ? stats.averageRating : '—'}
            </h3>
            <p className="text-text-secondary">Avg. Rating Given</p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-accent mb-4">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">
              {stats.favoriteStore?.name || '—'}
            </h3>
            <p className="text-text-secondary">Favorite Store</p>
          </div>
        </motion.div>

        {/* Recent Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Your Store Ratings</h2>
            <span className="text-sm text-text-muted">
              {myRatings.length} rating{myRatings.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : myRatings.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-medium text-text-primary mb-2">
                No ratings yet
              </h3>
              <p className="text-text-secondary mb-6">
                Start exploring and rating stores to see your activity here!
              </p>
              <Link to="/stores" className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Rate Your First Store
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRatings.map((rating, index) => (
                <motion.div
                  key={rating._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="glass p-4 rounded-lg border border-border-glass hover:border-border-neon transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Store Info */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary mb-1">
                            {rating.storeId.name}
                          </h3>
                          <p className="text-sm text-text-secondary mb-3">
                            {rating.storeId.address}
                          </p>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-4 mb-3">
                            <RatingStars 
                              rating={rating.rating} 
                              size="md"
                              showValue={false}
                            />
                            <span className="text-sm text-text-secondary">
                              {rating.rating}/5 stars
                            </span>
                            <span className="text-xs text-text-muted">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Comment */}
                          {rating.comment && (
                            <p className="text-sm text-text-secondary bg-bg-glass p-3 rounded-lg">
                              "{rating.comment}"
                            </p>
                          )}
                        </div>
                        
                        {/* Store Rating */}
                        <div className="text-right">
                          <p className="text-xs text-text-muted mb-1">Store Rating</p>
                          <RatingStars 
                            rating={rating.storeId.averageRating} 
                            size="sm"
                            showValue={true}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(rating)}
                        className="p-2 rounded-lg hover:bg-bg-glass-hover transition-colors text-neon-blue"
                        title="Edit rating"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRating(rating._id)}
                        className="p-2 rounded-lg hover:bg-bg-glass-hover transition-colors text-neon-pink"
                        title="Delete rating"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rating Modal */}
        {showRatingModal && selectedRating && (
          <RatingModal
            isOpen={showRatingModal}
            onClose={closeRatingModal}
            store={myRatings.find(r => r._id === selectedRating.id)?.storeId}
            existingRating={selectedRating}
            onRatingSubmitted={handleRatingUpdated}
          />
        )}
      </motion.div>
    </div>
  );
};

export default UserDashboard;
