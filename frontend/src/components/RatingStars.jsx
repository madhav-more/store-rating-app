import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange = null,
  showValue = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="rating-stars">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          
          return (
            <motion.button
              key={index}
              type="button"
              className={`rating-star ${sizeClasses[size]} ${
                isFilled ? 'filled' : ''
              } ${interactive ? 'interactive' : ''}`}
              onClick={() => handleStarClick(starValue)}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
              disabled={!interactive}
            >
              <Star 
                className={`${sizeClasses[size]} ${
                  isFilled 
                    ? 'fill-current text-accent' 
                    : 'text-text-muted'
                } transition-colors duration-200`}
              />
            </motion.button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="ml-2 text-sm text-text-secondary">
          {rating > 0 ? `${rating}/5` : 'No ratings'}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
