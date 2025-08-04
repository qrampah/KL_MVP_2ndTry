import React, { useState } from 'react';

interface StarRatingProps {
  count?: number;
  rating: number;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
  size?: number;
}

const Star: React.FC<{
  filled: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  size: number;
  isInteractive: boolean;
}> = ({ filled, onClick, onMouseEnter, onMouseLeave, size, isInteractive }) => {
  const starStyle = {
    fontSize: `${size}px`,
    color: filled ? '#FBBF24' : '#6B7280', // amber-400 : gray-500
    cursor: isInteractive ? 'pointer' : 'default',
    transition: 'color 150ms',
  };
  return (
    <span
      style={starStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      ★
    </span>
  );
};


const StarRating: React.FC<StarRatingProps> = ({
  count = 5,
  rating = 0,
  onRatingChange,
  disabled = false,
  size = 24,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    if (disabled) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (disabled) return;
    if (onRatingChange) {
      onRatingChange(index);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <div className="flex items-center" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: count }, (_, i) => i + 1).map((index) => (
        <Star
          key={index}
          filled={index <= currentRating}
          onClick={() => handleClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          size={size}
          isInteractive={!disabled}
        />
      ))}
    </div>
  );
};

export default StarRating;
