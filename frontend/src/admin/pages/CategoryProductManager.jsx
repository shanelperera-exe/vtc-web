import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import AllProductsManager from "./AllProductsManager";
// Correct api hook path
import { useCategories } from "../../api/hooks/useCategories";
// Correct path to category utilities
import { slugify } from "../components/categories/categoryUtils";

const slugMatches = (category, targetSlug) => {
  if (!category) return false;
  const raw = category.slug || slugify(category.name || "");
  return raw?.toLowerCase() === targetSlug?.toLowerCase();
};

export default function CategoryProductManager() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const {
    data: categories = [],
    loading,
    error,
    page: categoryPage,
  } = useCategories({ size: 200, status: 'all' });

  const hasLoaded = typeof categoryPage?.totalElements === "number";

  const activeCategory = useMemo(() => {
    if (!categorySlug) return null;
    return categories.find((cat) => slugMatches(cat, categorySlug)) || null;
  }, [categories, categorySlug]);

  useEffect(() => {
    if (!categorySlug || !hasLoaded || loading) return;
    if (!activeCategory) {
      navigate("/admin/products", { replace: true });
    }
  }, [categorySlug, hasLoaded, loading, activeCategory, navigate]);

  if (error) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load categories: {error.message || "Unknown error"}
        </div>
      </div>
    );
  }

  if (!hasLoaded) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          Loading category details…
        </div>
      </div>
    );
  }

  if (!activeCategory) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          The requested category could not be found.
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="ml-3 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <FiArrowLeft /> Back to all products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full px-2 py-6 sm:px-4 md:px-6 lg:px-8">
        <div className="rounded-xl border border-black/10 bg-white p-4 sm:p-5 shadow-sm">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <FiArrowLeft /> All Products
          </button>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold text-black">
            {activeCategory.name}
          </h1>
          <p className="pt-2 text-sm text-gray-600 sm:text-base">
            Manage the product catalog for the {activeCategory.name} category.
          </p>
        </div>
      </div>

      <AllProductsManager
        initialCategoryId={activeCategory.id}
        showHeader={false}
        containerClassName="w-full px-2 pb-8 sm:px-4 md:px-6 lg:px-8"
      />
    </div>
  );
}
