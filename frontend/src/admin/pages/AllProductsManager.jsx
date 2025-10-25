import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';
import { FiPlus, FiFilter } from 'react-icons/fi';
import SearchBar from '../../components/layout/SearchBar';
import ProductGrid from '../components/products/ProductGrid';
import ProductForm from '../components/products/ProductForm';
import Dropdown from '../../components/ui/Dropdown';
// Fixed paths to shared api hooks/modules
import { useProducts } from '../../api/hooks/useProducts';
import { useCategories } from '../../api/hooks/useCategories';
import { getProductDetails, syncProductImages, createProductFull, createVariation, listAllVariations, updateVariation, deleteVariation, updateProductStatus } from '../../api/productApi';
import PopupModal from '../../components/ui/PopupModal';

export default function AllProductsManager({ initialCategoryId = null, showHeader = true, containerClassName = 'w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategoryId ? String(initialCategoryId) : 'all');
  const [status, setStatus] = useState('all');
  const [prodFilter, setProdFilter] = useState('all');
  const [sort, setSort] = useState('alpha-asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [formBaseline, setFormBaseline] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSaving, setFormSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    if (initialCategoryId) {
      setCategory(String(initialCategoryId));
    }
  }, [initialCategoryId]);

  // Deep-link: open edit modal when ?edit=<id> appears in URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;
    // Try to find the product in the current page; if not, open with just id and let details fetch fill in
    const idVal = isNaN(Number(editId)) ? editId : Number(editId);
    const candidate = (products || []).find(p => String(p.id) === String(idVal));
    openEdit(candidate || { id: idVal });
    // Clear the param to avoid re-opening on subsequent renders
    searchParams.delete('edit');
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data: categoryList } = useCategories({ size: 200 });
  const categoryOptions = (categoryList || []).map(c => ({ value: String(c.id), label: c.name }));

  // Heuristic: treat hyphenated or underscore-separated tokens as potential SKUs
  const looksLikeSku = (val) => {
    const s = String(val || '').trim();
    if (s.length < 3) return false;
    // e.g., ABC-123-XYZ or ABC_123, require at least one separator to avoid hijacking name searches
    const hasSep = /[-_]/.test(s);
    return hasSep && /^[A-Za-z0-9-_]+$/.test(s);
  };
  const skuCandidate = looksLikeSku(query) ? query.trim() : undefined;

  // Map UI sort options to backend sort param
  const mapSortToBackend = (val) => {
    switch (val) {
      case 'alpha-asc': return 'name,asc';
      case 'alpha-desc': return 'name,desc';
      case 'price-asc': return 'basePrice,asc';
      case 'price-desc': return 'basePrice,desc';
      default: return undefined;
    }
  };
  // Map stock filter to backend param: 'in' | 'out' | undefined
  const mapStockToBackend = (pf) => pf === 'in-stock' ? 'in' : pf === 'out-of-stock' ? 'out' : undefined;

  const { data: products, loading, error, create, update, remove, reload } = useProducts({
    page: page - 1,
    size: pageSize,
    search: query,
    sku: skuCandidate,
    categoryId: category === 'all' ? undefined : Number(category),
    // Send 'all' explicitly so backend can treat it as no filter; otherwise pass ACTIVE/INACTIVE
    status: status === 'all' ? 'all' : status.toUpperCase(),
    sort: mapSortToBackend(sort),
    stock: mapStockToBackend(prodFilter)
  });

  // With backend-side stock filter, no extra client-side stock filter is needed
  const filtered = useMemo(() => (products || []), [products]);

  // sorting client side on currently loaded page only
  // Sorting is now handled server-side via sort param; keep current order
  const sorted = filtered;

  // Auto-refresh on cross-component product deletion
  useEffect(() => {
    function onDeleted(e) {
      try { reload(); } catch (_) {}
    }
    document.addEventListener('product:deleted', onDeleted);
    return () => document.removeEventListener('product:deleted', onDeleted);
  }, [reload]);

  const pageData = sorted; // already limited by backend page request
  const total = pageData.length; // only current page count (backend page meta not exposed here)

  const closeForm = () => {
    setIsFormOpen(false);
    setFormInitial(null);
    setFormBaseline(null);
    setFormLoading(false);
    setFormSaving(false);
    setFormError(null);
  };

  const mapProductToForm = (product = {}) => {
    const categoryId = product.categoryId ?? product.category;
    const basePrice = product.basePrice ?? product.price ?? 0;
    const primary = product.primaryImageUrl || product.primaryImage || product.image || '';
    const rawImages = Array.isArray(product.imageUrls)
      ? product.imageUrls.filter(Boolean)
      : Array.isArray(product.secondaryImages)
        ? product.secondaryImages.filter(Boolean)
        : [];
    const secondaryImages = primary ? rawImages.filter((url) => url !== primary) : rawImages;
    const highlights = Array.isArray(product.highlights)
      ? product.highlights.filter((h) => typeof h === 'string' && h.trim().length)
      : [];
    const variants = Array.isArray(product.variations)
      ? product.variations.map((v) => {
        const attrs = v.attributes || {};
        const color = attrs.color || attrs.Color || attrs.colour || v.color || '';
        const size = attrs.size || attrs.Size || v.size || '';
        return {
          id: v.id ?? Date.now() + Math.random(),
          color,
          size,
          stock: typeof v.stock === 'number' ? v.stock : 0,
          price: v.price ?? basePrice,
          imageUrl: v.imageUrl || ''
        };
      })
      : [];
    return {
      id: product.id ?? null,
      name: product.name || '',
      sku: product.sku || '',
      status: product.status || 'active',
      categoryId: categoryId ? String(categoryId) : '',
      price: basePrice,
      detailedDescription: product.detailedDescription || product.description || '',
      shortDescription: product.shortDescription || '',
      highlights,
      primaryImage: primary,
      secondaryImages,
      variants,
    };
  };

  const createEmptyProduct = () => {
    const defaultCategory = category === 'all' ? '' : category;
    return mapProductToForm({
      categoryId: defaultCategory,
      basePrice: 0,
      highlights: [],
    });
  };

  const openCreate = () => {
    const initial = createEmptyProduct();
    setFormInitial(initial);
    setFormBaseline(initial);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = async (product) => {
    setFormError(null);
    const base = mapProductToForm(product);
    setFormInitial(base);
    setFormBaseline(base);
    setIsFormOpen(true);
    if (!product?.id) return;
    try {
      setFormLoading(true);
      const details = await getProductDetails(product.id);
      if (details) {
        const detailed = mapProductToForm(details);
        setFormInitial(detailed);
        setFormBaseline(detailed);
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to load product details');
    } finally {
      setFormLoading(false);
    }
  };

  const openDelete = (product) => {
    setToDelete(product);
    setIsDeleteOpen(true);
  };

  const uploadImagesForProduct = async (productId, form) => {
    const primaryImage = form.primaryImage || null;
    const secondaryImages = Array.isArray(form.secondaryImages) ? form.secondaryImages.filter(Boolean) : [];
    if (!primaryImage && secondaryImages.length === 0) {
      return;
    }
    try {
      await syncProductImages(productId, { primaryImage, secondaryImages });
    } catch (err) {
      console.warn('Failed to sync product images', err);
    }
  };

  const handleSave = async (form) => {
    if (formSaving) return;
    setFormError(null);
    setFormSaving(true);
    try {
      const categoryIdNum = form.categoryId !== undefined && form.categoryId !== null && form.categoryId !== ''
        ? Number(form.categoryId)
        : undefined;
      if (!Number.isFinite(categoryIdNum)) {
        throw new Error('Please select a category');
      }
      const basePrice = Number(form.basePrice ?? form.price ?? 0);
      const safePrice = Number.isFinite(basePrice) ? basePrice : 0;
      const sanitizedHighlights = Array.isArray(form.highlights)
        ? form.highlights.map((h) => h.trim()).filter(Boolean)
        : [];
      // form mapping conventions: form.description = short description; form.detailedDescription = long description
      const basePayload = {
        name: (form.name || '').trim(),
        shortDescription: (form.shortDescription || '').trim(),
        detailedDescription: (form.detailedDescription || '').trim(),
        basePrice: safePrice,
        // include status so admins can change Active/Inactive in the form
        status: (form.status || 'active').toUpperCase(),
        highlights: sanitizedHighlights,
        categoryId: categoryIdNum,
      };

      // Normalize variations into backend expected format when present
      const variations = Array.isArray(form.variants)
        ? form.variants
            .filter(v => (v.color || v.size || '').trim().length)
            .map(v => ({
              price: Number.isFinite(Number(v.price)) ? Number(v.price) : safePrice,
              stock: Number.isFinite(Number(v.stock)) ? Number(v.stock) : 0,
              imageUrl: v.imageUrl || null,
              attributes: {
                Color: (v.color || '').trim(),
                Size: (v.size || '').trim(),
              }
            }))
        : [];

      // Images: primary + secondary as a flat list with types
      const images = [];
      if (form.primaryImage) images.push({ url: form.primaryImage, type: 'PRIMARY' });
      if (Array.isArray(form.secondaryImages)) {
        for (const url of form.secondaryImages.filter(Boolean)) {
          images.push({ url, type: 'SECONDARY' });
        }
      }

      if (!form.id) {
        // Create full product atomically when variations/images exist
        // ensure status propagates on create as well
        const fullPayload = { ...basePayload, images, variations };
        const created = await createProductFull(fullPayload);
        // Reload list after create
        await reload();
      } else {
        const baselineCategory = formBaseline?.categoryId
          ? Number(formBaseline.categoryId)
          : (formBaseline?.category ? Number(formBaseline.category) : undefined);
        const newCategoryId = categoryIdNum && baselineCategory !== categoryIdNum ? categoryIdNum : undefined;
        const updatePayload = { ...basePayload };
        delete updatePayload.categoryId; // handled via newCategoryId when present
        await update(form.id, updatePayload, { newCategoryId });
        // Sync variations on edit: naive replace via diff
        try {
          const existing = await listAllVariations(form.id);
          const desired = Array.isArray(form.variants) ? form.variants : [];
          // Build by attributes map key Color/Size
          const keyOf = (v) => {
            const c = (v.color || v.attributes?.Color || v.attributes?.color || '').trim();
            const s = (v.size || v.attributes?.Size || v.attributes?.size || '').trim();
            return `Color=${c}|Size=${s}`;
          };
          const existingByKey = new Map((existing || []).map(v => [keyOf(v), v]));
          const desiredByKey = new Map(desired.map(v => [keyOf(v), v]));
          // Deletes
          for (const [k, v] of existingByKey) {
            if (!desiredByKey.has(k)) {
              await deleteVariation(form.id, v.id);
            }
          }
          // Creates or updates
          for (const [k, dv] of desiredByKey) {
            const ev = existingByKey.get(k);
            const payload = {
              price: Number.isFinite(Number(dv.price)) ? Number(dv.price) : safePrice,
              stock: Number.isFinite(Number(dv.stock)) ? Number(dv.stock) : 0,
              imageUrl: dv.imageUrl || null,
              attributes: { Color: (dv.color || '').trim(), Size: (dv.size || '').trim() },
            };
            if (!ev) await createVariation(form.id, payload);
            else await updateVariation(form.id, ev.id, payload);
          }
        } catch (e) {
          console.warn('Failed to sync variations for product', form.id, e);
        }
        // For images, keep current image sync
        await uploadImagesForProduct(form.id, form);
      }
      await reload();
      closeForm();
    } catch (err) {
      setFormError(err?.message || 'Failed to save product');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      await reload();
    } catch (err) {
      console.warn('Failed to delete product', err);
    } finally {
      setIsDeleteOpen(false);
      setToDelete(null);
    }
  };

  return (
    <div className={containerClassName}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-6xl font-semibold text-black">Products</h1>
            <p className="text-md text-gray-600 pt-4">Manage all products across categories.</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center gap-2 h-11 px-4 border-2 border-black bg-black text-white hover:bg-[#23f47d] hover:text-black"> <FiPlus /> <span className="text-sm font-medium">Add Product</span></button>
        </div>
      )}
      {!showHeader && (
        <div className="flex justify-end mb-5">
          <button onClick={openCreate} className="inline-flex items-center gap-2 h-11 px-4 border-2 border-black bg-black text-white hover:bg-[#23f47d] hover:text-black"> <FiPlus /> <span className="text-sm font-medium">Add Product</span></button>
        </div>
      )}

      <Toolbar query={query} setQuery={setQuery} category={category} setCategory={setCategory} status={status} setStatus={setStatus} prodFilter={prodFilter} setProdFilter={setProdFilter} sort={sort} setSort={setSort} total={total} categoryOptions={[{ value: 'all', label: 'All Categories' }, ...categoryOptions]} />

      {error && <div className="text-sm text-red-600">Error loading products: {error.message}</div>}
      {loading && <div className="text-sm text-gray-500">Loading products...</div>}

      <ProductGrid data={pageData} onEdit={openEdit} onDelete={openDelete} onToggleStatus={async (p) => {
        // Normalize status to be case-insensitive when determining the next state
        const isActive = String(p?.status || '').toLowerCase() === 'active';
        const next = isActive ? 'inactive' : 'active';
        try {
          // Use dedicated endpoint for reliability
          await updateProductStatus(p.id, next.toUpperCase());
          await reload();
        } catch (e) {
          console.warn('Failed to update product status', e);
        }
      }} />

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span>Rows per page</span>
          <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="border-2 border-black px-2 py-1 bg-white"> {[4, 8, 12].map(s => <option key={s} value={s}>{s}</option>)}</select>
          <span className="text-gray-600">Page {page}</span>
        </div>
        <div className="inline-flex border-2 border-black">
          <button className="px-3 py-2 bg-white hover:bg-[#23f47d]" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <div className="px-3 py-2 bg-black text-green-400 text-sm">{page}</div>
          <button className="px-3 py-2 bg-white hover:bg-[#23f47d]" onClick={() => setPage(p => p + 1)} disabled={pageData.length < pageSize}>Next</button>
        </div>
      </div>

      <PopupModal isOpen={isFormOpen} onClose={closeForm} maxWidthClass={'max-w-[1200px]'}>
        <div className="w-full">
          {formError && (
            <div className="mb-4 border-2 border-red-500 bg-red-50 text-red-700 px-4 py-2 text-sm">
              {formError}
            </div>
          )}
          {formLoading && !formInitial && (
            <div className="text-sm text-gray-500">Loading product details…</div>
          )}
          {formLoading && formInitial && (
            <div className="text-xs text-gray-500 mb-3">Refreshing product details…</div>
          )}
          {formInitial && (
            <ProductForm
              initial={formInitial}
              onCancel={closeForm}
              onSubmit={handleSave}
              categories={categoryOptions}
              saving={formSaving}
            />
          )}
        </div>
      </PopupModal>
      <PopupModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <div className="p-4 max-w-sm bg-white">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0"><div className="w-10 h-10 bg-red-50 text-red-700 flex items-center justify-center"><ExclamationTriangleIcon className="w-5 h-5" /></div></div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Confirm deletion</h3>
              <p className="mt-1 text-sm text-gray-600">Are you sure you want to permanently delete <span className="font-medium text-gray-900">{toDelete?.name ? `"${toDelete.name}"` : `this product`}</span>?</p>
              {toDelete?.sku && <p className="mt-2 text-xs text-gray-500">SKU: <span className="font-medium text-gray-700">{toDelete.sku}</span></p>}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setIsDeleteOpen(false)} className="px-3 py-1.5 border border-gray-300 bg-white text-sm font-medium hover:shadow-sm transition">Cancel</button>
            <motion.button onClick={handleDelete} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium border border-red-700 hover:bg-red-600 shadow-sm">Delete</motion.button>
          </div>
        </div>
      </PopupModal>
    </div>
  );
}

function Toolbar({ query, setQuery, category, setCategory, status, setStatus, prodFilter, setProdFilter, sort, setSort, total, categoryOptions }) {
  const statusBorderClass = status === 'all' ? 'border-black' : status === 'active' ? 'border-green-600' : 'border-red-600';
  const stockBorderClass = prodFilter === 'all' ? 'border-black' : prodFilter === 'in-stock' ? 'border-green-600' : 'border-red-600';
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4 w-full">
      <div className="flex items-center gap-3">
        <div className="flex-none">
          <SearchBar value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." width="360px" />
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <Dropdown value={category} onChange={(v) => setCategory(v)} options={categoryOptions} className="w-44 h-8 pr-7 border-2 border-black bg-white text-xs" />
        <div className="ml-2 flex items-center">
          <div className="text-xs font-medium mr-2">Status</div>
          <div className={`inline-flex border-2 ${statusBorderClass} overflow-hidden rounded-full mr-2`}>
            {['all', 'active', 'inactive'].map(opt => { const isSelected = status === opt; const selectedClass = isSelected ? (opt === 'active' ? 'bg-green-600 text-white border-2 border-green-600' : opt === 'inactive' ? 'bg-red-600 text-white border-2 border-red-600' : 'bg-black text-white border-2 border-black') : 'bg-white text-black hover:bg-gray-100 border-0'; return <button key={opt} onClick={() => setStatus(opt)} className={`px-2 py-1 text-xs ${selectedClass}`}>{opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}</button>; })}
          </div>
        </div>
        <div className="ml-3 flex items-center">
          <div className="text-xs mr-2 font-medium">Stock</div>
          <div className={`inline-flex border-2 ${stockBorderClass} overflow-hidden rounded-full mr-3`}>
            {['all', 'in-stock', 'out-of-stock'].map(opt => { const isSelected = prodFilter === opt; const selectedClass = isSelected ? (opt === 'in-stock' ? 'bg-green-600 text-white border-2 border-green-600' : opt === 'out-of-stock' ? 'bg-red-600 text-white border-2 border-red-600' : 'bg-black text-white border-2 border-black') : 'bg-white text-black hover:bg-gray-100 border-0'; return <button key={opt} onClick={() => setProdFilter(opt)} className={`px-2 py-1 text-xs ${selectedClass}`}>{opt === 'all' ? 'All' : opt === 'in-stock' ? 'In stock' : 'Out of stock'}</button>; })}
          </div>
        </div>
        <div className="ml-3 flex items-center">
          <div className="text-xs font-medium mr-2">Sort by</div>
          <Dropdown value={sort} onChange={(v) => setSort(v)} options={[{ value: 'alpha-asc', label: 'Alphabetically, A–Z' }, { value: 'alpha-desc', label: 'Alphabetically, Z–A' }, { value: 'price-asc', label: 'Price, low to high' }, { value: 'price-desc', label: 'Price, high to low' }]} className="w-48 h-8 pr-7 border-2 border-black bg-white text-xs" />
        </div>
        <div className="text-xs font-medium flex items-center gap-1 ml-4"><FiFilter className="text-black" /> {total} result(s)</div>
      </div>
    </div>
  );
}


