import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '../../api/hooks/useProducts';
import { useCategories } from '../../api/hooks/useCategories';

/**
 * YouMayAlsoLike
 * - Fetches products in the same category as the current product and shows a small grid.
 * - Falls back to generic products if category cannot be resolved.
 */
export default function YouMayAlsoLike({ categoryId = null, categoryName = '', excludeId = null, title = 'You may also like' }) {
  // Resolve category id from name if not provided
  const { data: categories } = useCategories({ size: 200 });
  const resolvedCategoryId = useMemo(() => {
    if (categoryId) return categoryId;
    const target = (categoryName || '').trim().toLowerCase();
    if (!target || !Array.isArray(categories)) return null;
    const found = categories
      .filter(c => String(c.status || '').toLowerCase() === 'active')
      .find(c => (c?.name || '').trim().toLowerCase() === target);
    return found?.id ?? null;
  }, [categoryId, categoryName, categories]);

  // Load products: prefer category-specific, but also fetch a generic list as a fallback
  const { data: catProducts, loading: catLoading } = useProducts({ size: 12, categoryId: resolvedCategoryId || undefined, status: 'ACTIVE' });
  const { data: defaultProducts, loading: defaultLoading } = useProducts({ size: 8, status: 'ACTIVE' });

  const categoryItems = useMemo(() => {
    const arr = Array.isArray(catProducts) ? catProducts : [];
    return excludeId ? arr.filter(p => p.id !== excludeId) : arr;
  }, [catProducts, excludeId]);

  const fallbackItems = useMemo(() => {
    const arr = Array.isArray(defaultProducts) ? defaultProducts : [];
    return excludeId ? arr.filter(p => p.id !== excludeId) : arr;
  }, [defaultProducts, excludeId]);

  // Prefer category items, otherwise fallback to defaultProducts
  const items = (categoryItems && categoryItems.length) ? categoryItems : fallbackItems;
  const loading = catLoading || defaultLoading;

  // Always render the section header so the user sees the area even when no matches exist
  return (
    <div className="mt-12 max-w-5xl pl-6 sm:pl-10 lg:max-w-[800px] lg:pl-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">{title}</h2>
      </div>

      {loading && (!items || items.length === 0) && (
        <div className="p-6 text-sm text-gray-500">Loading recommendations…</div>
      )}

      {!loading && (!items || items.length === 0) && (
        <div className="p-6 text-sm text-gray-500">No recommendations found.</div>
      )}

      {items && items.length > 0 && (
        <div className="flex flex-wrap gap-8 justify-start">
          {items.slice(0, 8).map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              sku={product.sku}
              name={product.name}
              description={product.shortDescription || product.description}
              image={(product.primaryImageUrl || (product.imageUrls && product.imageUrls[0]) || product.image)}
              price={product.basePrice || product.price || 0}
              category={product.categoryName || product.category}
              rating={product.rating}
              numOfReviews={product.numOfReviews}
            />
          ))}
        </div>
      )}
    </div>
  );
}
