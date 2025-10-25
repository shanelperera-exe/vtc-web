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
      <div className="w-full px-4 py-10 text-sm text-red-600">
        Failed to load categories: {error.message || "Unknown error"}
      </div>
    );
  }

  if (!hasLoaded) {
    return (
      <div className="w-full px-4 py-10 text-sm text-gray-600">
        Loading category details…
      </div>
    );
  }

  if (!activeCategory) {
    return (
      <div className="w-full px-4 py-10 text-sm text-gray-600">
        The requested category could not be found.
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="ml-3 inline-flex items-center gap-2 border-2 border-black px-3 py-1 text-xs font-medium text-black hover:bg-black hover:text-white"
        >
          <FiArrowLeft /> Back to all products
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full px-2 py-6 sm:px-4 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-sm font-medium text-black transition hover:bg-black hover:text-white"
        >
          <FiArrowLeft /> All Products
        </button>
        <h1 className="text-4xl font-bold text-black sm:text-5xl md:text-6xl">
          {activeCategory.name}
        </h1>
        <p className="pt-3 text-sm text-gray-600 sm:text-base">
          Manage the product catalog for the {activeCategory.name} category.
        </p>
      </div>

      <AllProductsManager
        initialCategoryId={activeCategory.id}
        showHeader={false}
        containerClassName="w-full px-2 pb-8 sm:px-4 md:px-6 lg:px-8"
      />
    </div>
  );
}
