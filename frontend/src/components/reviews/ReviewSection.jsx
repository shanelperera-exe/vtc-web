import React, { useState, useEffect } from "react";
import StarReview from "../ui/StarReview";
import ReviewForm from "./ReviewForm";
import RecentReviews from "./RecentReviews";
import { listReviewsByProduct } from '../../api/reviewApi';
import { FiEdit, FiX } from 'react-icons/fi';

// Simple relative time helper (returns strings like '20 minutes ago', '2 days ago', '1 month ago')
function timeAgo(isoDate) {
  try {
    const then = new Date(isoDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - then) / 1000)); // seconds

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


const ProgressBar = ({ percent }) => {
  return (
    <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-3 bg-[#00bf63] rounded-full"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

const ReviewSection = ({ product = null }) => {
  // No sample fallback data — show only real product reviews when available

  // We prefer live reviews from backend. Load reviews for this product when available.
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      if (!product?.id) {
        setReviews([]);
        return;
      }
      setLoadingReviews(true);
      try {
        const rev = await listReviewsByProduct(product.id);
        if (!active) return;
        const mapped = Array.isArray(rev) ? rev.map(r => ({
          id: r.id,
          name: r.name || (r.user && r.user.name) || 'Anonymous',
          image: (r.user && r.user.avatar) || r.image || '',
          rating: r.rating,
          text: r.body || r.text || r.comment || '',
          date: r.createdAt || r.time || new Date().toISOString(),
        })) : [];
        setReviews(mapped);
      } catch (e) {
        // ignore — leave reviews empty
        setReviews([]);
      } finally {
        if (active) setLoadingReviews(false);
      }
    }
    load();
    return () => { active = false; };
  }, [product?.id]);

  // Compute summary values from state
  const numReviews = reviews.length;
  const avgRating = numReviews > 0 ? +(reviews.reduce((s, r) => s + (typeof r.rating === 'number' ? r.rating : (r.stars || 0)), 0) / numReviews).toFixed(1) : (product?.rating || 0);

  const reviewsData = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating || r.stars || 0) === star).length;
    return { stars: star, count, percent: numReviews > 0 ? Math.round((count / numReviews) * 100) : 0 };
  });

  // recent reviews: sort by date if available, otherwise keep array order (assume newest first)
  const sorted = [...reviews].sort((a, b) => {
    const ta = new Date(a.date || a.createdAt || a.time || 0).getTime();
    const tb = new Date(b.date || b.createdAt || b.time || 0).getTime();
    return tb - ta;
  });

  const recentReviews = sorted.map((r) => ({
    name: r.user?.name || r.name || r.author || 'Anonymous',
    image: r.user?.avatar || r.avatar || r.image || '',
    rating: typeof r.rating === 'number' ? r.rating : (r.stars || 0),
    text: r.comment || r.text || r.body || '',
    date: r.date || r.createdAt || r.time || new Date().toISOString(),
  }));

  const [showForm, setShowForm] = useState(false);

  // Inline form toggle - no body scroll locking needed for inline form

  return (
    <>
    <section aria-labelledby="reviews-heading" className="py-6 px-6">
  <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-x-8 gap-y-8">
        {/* Left Side */}
        <div>
          <h2
            id="reviews-heading"
            className="text-4xl font-semibold tracking-tight text-gray-700"
          >
            Customer Reviews
          </h2>

          <div className="mt-4 flex items-center space-x-4">
            <StarReview rating={avgRating} numReviews={numReviews} size={20} showCount={!!numReviews} />
            <p className="text-gray-700 font-medium">{avgRating} out of 5 stars</p>
            {numReviews ? (
              <span className="text-gray-500 text-sm">Based on {numReviews} reviews</span>
            ) : null}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Review data</h3>
            {numReviews > 0 ? (
              <dl className="mt-4 space-y-3">
                {reviewsData.map((item) => (
                  <div key={item.stars} className="text-sm text-gray-700">
                    <dt className="flex items-center gap-2 w-full">
                      <span className="font-medium flex-shrink-0 w-16 md:w-14 whitespace-nowrap">{item.stars} stars</span>
                      <div className="flex items-center gap-2 w-full md:flex-1">
                        <div className="flex-shrink-0 md:flex-1 md:max-w-[130px]">
                          <ProgressBar percent={item.percent} />
                        </div>
                        <span className="ml-2 md:ml-6 md:w-24 text-right">{item.count} ({item.percent}%)</span>
                      </div>
                    </dt>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-gray-600">No aggregated review data yet.</p>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="mt-1">
          <h3 className="text-lg font-semibold text-gray-700">
            Recent reviews
          </h3>
          <RecentReviews reviews={recentReviews} />
          {loadingReviews && <p className="text-sm text-gray-500 mt-2">Loading reviews...</p>}
        </div>
      </div>
  </section>
  {/* modal removed - form renders inline when toggled */}
    </>
  );
};

export default ReviewSection;
