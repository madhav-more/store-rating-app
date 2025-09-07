import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Edit3, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RatingStars from '../components/RatingStars';
import RatingModal from '../components/RatingModal';
import LoadingSpinner from '../components/LoadingSpinner';

const StoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' or 'address'
  const [selectedStore, setSelectedStore] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch stores
  const fetchStores = async (page = 1, search = '', type = 'name') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search.trim()) {
        params.append(type, search.trim());
      }

      const response = await axios.get(`/api/stores?${params}`);
      setStores(response.data.stores);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStores();
  }, []);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStores(1, searchTerm, searchType);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchStores(1);
  };

  // Handle rating modal
  const openRatingModal = (store, existingUserRating = null) => {
    setSelectedStore(store);
    setExistingRating(existingUserRating);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedStore(null);
    setExistingRating(null);
  };

  // Refresh stores after rating submission
  const handleRatingSubmitted = () => {
    fetchStores(currentPage, searchTerm, searchType);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchStores(newPage, searchTerm, searchType);
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
            <h1 className="text-3xl font-bold text-text-primary mb-2">Discover Stores</h1>
            <p className="text-text-secondary">Find and rate amazing stores in your area</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">
              {pagination?.totalCount || 0} store{pagination?.totalCount !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="card"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              {/* Search Type Toggle */}
              <div className="flex bg-bg-glass rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setSearchType('name')}
                  className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                    searchType === 'name'
                      ? 'bg-gradient-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Name
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('address')}
                  className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                    searchType === 'address'
                      ? 'bg-gradient-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Address
                </button>
              </div>

              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search by ${searchType}...`}
                  className="form-input w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>

              {/* Search Buttons */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Search'}
              </button>
              
              {(searchTerm || searchType !== 'name') && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="btn btn-secondary"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Stores Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : stores.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Star className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-medium text-text-primary mb-2">
              {searchTerm ? 'No stores found' : 'No stores available'}
            </h3>
            <p className="text-text-secondary">
              {searchTerm 
                ? `Try searching with different terms or clear your search.`
                : 'Check back later for new stores to discover and rate!'}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {stores.map((store, index) => (
              <motion.div
                key={store._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card glass-hover cursor-pointer group"
              >
                {/* Store Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-neon-blue transition-colors">
                    {store.name}
                  </h3>
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text-secondary line-clamp-2">{store.address}</p>
                  </div>
                </div>

                {/* Store Rating */}
                <div className="mb-4">
                  <RatingStars 
                    rating={store.averageRating} 
                    size="md"
                    showValue={false}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-text-secondary">
                      {store.averageRating > 0 
                        ? `${store.averageRating}/5 (${store.totalRatings} review${store.totalRatings !== 1 ? 's' : ''})`
                        : 'No reviews yet'
                      }
                    </span>
                  </div>
                </div>

                {/* User's Rating */}
                {store.userRating && (
                  <div className="mb-4 p-3 bg-bg-glass rounded-lg border border-border-neon">
                    <p className="text-xs text-neon-blue font-medium mb-1">Your Rating:</p>
                    <RatingStars 
                      rating={store.userRating.rating} 
                      size="sm"
                      showValue={true}
                    />
                    {store.userRating.comment && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        "{store.userRating.comment}"
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {store.userRating ? (
                    <button
                      onClick={() => openRatingModal(store, store.userRating)}
                      className="btn btn-secondary flex-1 text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Update Rating
                    </button>
                  ) : (
                    <button
                      onClick={() => openRatingModal(store)}
                      className="btn btn-primary flex-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Rate Store
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-2"
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="btn btn-secondary"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className={`btn ${
                      currentPage === pageNumber ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="btn btn-secondary"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Rating Modal */}
        <RatingModal
          isOpen={showRatingModal}
          onClose={closeRatingModal}
          store={selectedStore}
          existingRating={existingRating}
          onRatingSubmitted={handleRatingSubmitted}
        />
      </motion.div>
    </div>
  );
};

export default StoreListPage;
