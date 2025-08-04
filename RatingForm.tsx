import React, { useState } from 'react';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';

interface RatingFormProps {
  onSubmit: (rating: number, review: string) => void;
  isLoading: boolean;
  userRoleToRate: 'Driver' | 'Shipper';
}

const RatingForm: React.FC<RatingFormProps> = ({ onSubmit, isLoading, userRoleToRate }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, review);
    } else {
      alert("Please select a star rating.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-700 p-6 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-kargo-teal">Rate the {userRoleToRate}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Overall Experience</label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>
      <div>
        <label htmlFor="review" className="block text-sm font-medium text-gray-300 mb-1">
          Add a public review (optional)
        </label>
        <textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          className="block w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-kargo-teal focus:border-kargo-teal sm:text-sm text-gray-100"
          placeholder={`How was your experience with the ${userRoleToRate.toLowerCase()}?`}
        />
      </div>
      <Button type="submit" isLoading={isLoading} disabled={rating === 0}>Submit Review</Button>
    </form>
  );
};

export default RatingForm;
