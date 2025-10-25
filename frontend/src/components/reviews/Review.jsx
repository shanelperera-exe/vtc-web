import React from 'react';
import StarReview from '../ui/StarReview';

export default function Review({ review, timeLabel, isLast = false }) {
  const name = review?.name || 'Anonymous';
  const isDeleted = typeof name === 'string' && name.trim().toLowerCase() === 'deleted user';
  const avatarSrc = isDeleted
    ? 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ1OY0mhKRTFDpKTCR9X7pae91M4uBlwhD7w6NlHmU9L9zHxdnr'
    : `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`;
  return (
    <div className={`flex items-start justify-between space-x-4 ${!isLast ? 'border-b border-gray-200 pb-4' : ''}`}>
      <div className="flex items-start space-x-4">
        <img
          src={avatarSrc}
          alt={name}
          className="w-12 h-12 border-2 object-cover"
        />
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="font-medium text-gray-900">{name}</h4>
          <StarReview rating={review.rating} size={16} showCount={false} />
          <p className="mt-2 text-sm text-gray-700">{review.text}</p>
        </div>
      </div>
      <div className="text-sm text-gray-500 ml-4 whitespace-nowrap w-24 text-right">{timeLabel}</div>
    </div>
  );
}
