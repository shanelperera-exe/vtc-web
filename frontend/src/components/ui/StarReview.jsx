import React from 'react';
import { StarIcon } from '@heroicons/react/20/solid';

/**
 * StarReview
 * Props:
 *  - rating: number (0-5)
 *  - numReviews: number
 */
export default function StarReview({ rating = 0, numReviews = 0, size = 16, showCount = true, color = "#00bf63", emptyColor = "#e5e7eb" }) {
    // Render 5 stars with support for half/partial star via two overlapping icons
    // Use inline-flex and align-middle so the numeric review count lines up vertically
    return (
        <div className="inline-flex items-center">
            {[0, 1, 2, 3, 4].map((i) => {
                if (rating >= i + 1) {
                    return (
                        <StarIcon
                            key={i}
                            aria-hidden="true"
                            style={{ width: `${size}px`, height: `${size}px` }}
                            className="inline-block align-middle shrink-0"
                            color={color}
                            fill={color}
                        />
                    );
                } else if (rating > i && rating < i + 1) {
                    const half = Math.max(0, Math.min(1, rating - i));
                    const clip = Math.round((1 - half) * size);
                    return (
                        <span
                            key={i}
                            style={{ position: 'relative', width: `${size}px`, height: `${size}px`, display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
                        >
                            <StarIcon
                                aria-hidden="true"
                                style={{ width: `${size}px`, height: `${size}px`, position: 'absolute', left: 0, top: 0, clipPath: `inset(0 ${clip}px 0 0)` }}
                                className="inline-block align-middle shrink-0"
                                color={color}
                                fill={color}
                            />
                            <StarIcon
                                aria-hidden="true"
                                style={{ width: `${size}px`, height: `${size}px`, position: 'absolute', left: 0, top: 0, clipPath: `inset(0 0 0 ${clip}px)` }}
                                className="inline-block align-middle text-gray-200 shrink-0"
                                color={emptyColor}
                                fill={emptyColor}
                            />
                        </span>
                    );
                } else {
                    return (
                        <StarIcon
                            key={i}
                            aria-hidden="true"
                            style={{ width: `${size}px`, height: `${size}px` }}
                            className="inline-block align-middle text-gray-200 shrink-0"
                            color={emptyColor}
                            fill={emptyColor}
                        />
                    );
                }
            })}
            {showCount && (
                <span className="ml-2 text-sm font-medium text-black align-middle">{numReviews} reviews</span>
            )}
        </div>
    );
}
