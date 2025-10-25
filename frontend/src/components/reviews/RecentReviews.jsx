import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Review from './Review';

// small timeAgo helper (keeps same behavior as ReviewSection)
function timeAgo(isoDate) {
  try {
    const then = new Date(isoDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - then) / 1000));
    if (diff === 0) return 'just now';
    if (diff < 60) return `${diff} sec${diff !== 1 ? 's' : ''} ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } catch (e) {
    return '';
  }
}

export default function RecentReviews({ reviews = [] }) {
  const [visibleCount, setVisibleCount] = useState(Math.min(3, reviews.length));
  const [filter, setFilter] = useState('all'); // 'all' or 5..1

  // Keep visibleCount within bounds if reviews array changes (e.g. new review added)
  useEffect(() => {
    if (visibleCount > reviews.length) {
      setVisibleCount(Math.min(3, reviews.length));
    }
  }, [reviews.length]);

  // When filter changes, reset visibleCount to default (3 or filtered length)
  useEffect(() => {
    let filtered;
    if (filter === 'all') filtered = reviews;
    else if (filter === 'recent') filtered = [...reviews].sort((a, b) => new Date(b.date || b.createdAt || b.time || 0).getTime() - new Date(a.date || a.createdAt || a.time || 0).getTime());
    else filtered = reviews.filter((r) => Math.round(r.rating || r.stars || 0) === Number(filter));
    setVisibleCount(Math.min(3, filtered.length));
  }, [filter, reviews]);

  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-gray-600">No reviews yet. Be the first to write one.</p>;
  }

  // apply filter
  let filteredReviews;
  if (filter === 'all') filteredReviews = reviews;
  else if (filter === 'recent') filteredReviews = [...reviews].sort((a, b) => new Date(b.date || b.createdAt || b.time || 0).getTime() - new Date(a.date || a.createdAt || a.time || 0).getTime());
  else filteredReviews = reviews.filter((r) => Math.round(r.rating || r.stars || 0) === Number(filter));

  const hasMoreThanDefault = filteredReviews.length > 3;
  const isExpanded = visibleCount >= filteredReviews.length;
  const showLoadMore = hasMoreThanDefault;

  return (
    <>
      <div className="mt-4 space-y-6">
        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <span className="text-md font-medium text-gray-700">Filter:</span>
          <div className="inline-flex items-center gap-2">
            {['recent', 'all', 5, 4, 3, 2, 1].map((opt) => {
              const label = opt === 'all' ? `All (${reviews.length})` : opt === 'recent' ? 'Recent' : `${opt}★`;
              const active = String(filter) === String(opt);
              return (
                <button
                  key={String(opt)}
                  type="button"
                  onClick={() => setFilter(opt)}
                  className={
                    `px-3 py-1 text-sm rounded-none border ${active ? 'bg-[#00bf63] text-white border-[#00bf63]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {filteredReviews.slice(0, visibleCount).map((review, idx) => (
          <Review
            key={idx}
            review={review}
            isLast={idx === Math.min(visibleCount, filteredReviews.length) - 1}
            timeLabel={timeAgo(review.date || review.createdAt)}
          />
        ))}

        {showLoadMore && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((cur) => (cur >= filteredReviews.length ? Math.min(3, filteredReviews.length) : filteredReviews.length))
              }
              className="px-4 py-2 border-2 border-gray-600 text-sm bg-white hover:bg-gray-900 hover:border-gray-900 hover:text-white inline-flex items-center gap-2"
            >
              {isExpanded ? (
                <>
                  <FiChevronUp className="w-4 h-4" />
                  View less
                </>
              ) : (
                <>
                  <FiChevronDown className="w-4 h-4" />
                  View more
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
