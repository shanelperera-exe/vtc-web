import React, { useEffect, useState, useRef, useCallback } from "react";
// Corrected path to shared axios client
import apiClient from '../../../api/axios';
import { cap, slugify } from "./categoryUtils";
import { FiImage, FiInfo, FiCheckCircle, FiXCircle, FiUpload, FiLink, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import CropModal from './CropModal';

/**
 * Image field name mapping:
 * UI state fields: mainImage, tileImage1, tileImage2, carouselImage
 * New backend fields: catMainImg, catTileImage1, catTileImage2, carouselImg
 * Legacy backend fields (being phased out): categoryImage, categoryIcon, carouselImage
 * Conversion performed in CategoryManagement.handleSave & openEdit.
 */
export default function CategoryForm({ initial, onCancel, onSubmit, existing = [] }) {
  const [form, setForm] = useState({ ...initial });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Validation rules
  const validate = useCallback((draft = form) => {
    const e = {};
    const name = (draft.name || '').trim();
    if (!name) e.name = 'Name is required';
    else if (name.length < 2) e.name = 'Name must be at least 2 characters';
    else if (name.length > 80) e.name = 'Name cannot exceed 80 characters';

    const slugRaw = (draft.slug || '').trim();
    const slug = slugRaw || slugify(name);
    if (!slug) e.slug = 'Slug is required';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) e.slug = 'Slug must be lowercase letters, numbers, dashes';
    else {
      const taken = existing.filter(c => c.id !== draft.id).some(c => {
        const s = (c.slug || slugify(c.name || '')).toLowerCase();
        return s === slug.toLowerCase();
      });
      if (taken) e.slug = 'Slug already in use';
    }

    if (draft.description && draft.description.length > 300) e.description = 'Description max 300 characters';

    return e;
  }, [form, existing]);

  // reset handler for cancel button: reset local form state then call onCancel
  const handleCancel = () => {
    setForm({ ...initial });
    if (typeof onCancel === 'function') onCancel();
  };

  useEffect(() => {
    // Placeholder for any mount logic
  }, []);

  const canSave = Object.keys(validate()).length === 0;

  // Revalidate on key fields change
  useEffect(() => {
    setErrors(validate());
  }, [form.name, form.slug, form.description, validate]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const v = validate();
        setErrors(v);
        setSubmitError(null);
        if (Object.keys(v).length) return;
        try {
          setSubmitting(true);
          await onSubmit({ ...form, slug: form.slug || slugify(form.name) });
        } catch (err) {
          setSubmitError(err?.message || 'Failed to save category');
        } finally {
          setSubmitting(false);
        }
      }}
      className="w-full max-w-[1200px] mx-auto bg-white rounded-2xl p-6 min-h-[70vh]"
      noValidate
    >
      {/* Header */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <div className="min-w-0">
          <h3 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            {form.id ? "Edit Category" : "Create Category"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Fill in the details below.</p>
        </div>
      </div>

      {submitError && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm" role="alert">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-600 text-white border border-black/10">
                <FiAlertTriangle className="w-5 h-5" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold tracking-wide leading-snug">There was a problem</p>
              <p className="mt-0.5 text-rose-700 break-words">{submitError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="ml-2 self-center inline-flex items-center justify-center w-8 h-8 rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Dismiss error"
            >
              <FiXCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
  {/* Name & Slug */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Name" required helper="Category display name" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug:
                    f.slug && f.slug !== slugify(f.name)
                      ? f.slug
                      : slugify(e.target.value),
                }))
              }
              className={`w-full h-11 px-3 rounded-lg border ${errors.name ? 'border-rose-300' : 'border-black/10'} bg-white text-sm placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
              placeholder="e.g., Homeware"
            />
          </Field>

          <Field
            label="Slug"
            helper="Auto-generated from name; can be edited"
            error={errors.slug}
          >
            <input
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value }))
              }
              className={`w-full h-11 px-3 rounded-lg border ${errors.slug ? 'border-rose-300' : 'border-black/10'} bg-white text-sm placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
              placeholder="homeware"
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description" helper="Short description of the category" error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border ${errors.description ? 'border-rose-300' : 'border-black/10'} bg-white text-sm placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
            placeholder="Short description..."
          />
        </Field>

        {/* Status */}
        <Field label="Status" required>
          <div className="inline-flex items-center gap-2">
            {["active", "inactive"].map((s) => {
              const isActive = s === 'active';
              const bg = form.status === s ? (isActive ? 'bg-emerald-50' : 'bg-rose-50') : 'bg-white';
              const txt = form.status === s ? (isActive ? 'text-emerald-800' : 'text-rose-800') : 'text-gray-700';
              const Icon = isActive ? FiCheckCircle : FiXCircle;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`${bg} ${txt} inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full border border-black/10 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1" />
                  {cap(s)}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Images */}
        <div className="pt-2">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2"><FiImage className="w-5 h-5 text-black/60" />Images</h4>
              <p className="text-xs text-gray-500 mt-1">Upload or link images used across the storefront UI.</p>
            </div>
            <ImageGuidelines />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <ImageField
              label="Main Image (1:1)"
              helper="Category thumbnail"
              value={form.mainImage}
              onChange={(v) => setForm((f) => ({ ...f, mainImage: v }))}
              previewSize="w-full aspect-square"
            />
            <ImageField
              label="Tile Image 1 (1:1)"
              helper="Grid tile (PNG w/ transparency ideal)"
              value={form.tileImage1}
              onChange={(v) => setForm((f) => ({ ...f, tileImage1: v }))}
              previewSize="w-full aspect-square"
            />
            <ImageField
              label="Tile Image 2 (1:1)"
              helper="Alt grid tile"
              value={form.tileImage2}
              onChange={(v) => setForm((f) => ({ ...f, tileImage2: v }))}
              previewSize="w-full aspect-square"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-black/10 bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50" disabled={submitting}>
          <FiXCircle className="w-4 h-4" />
          Cancel
        </button>
        <button type="submit" disabled={!canSave || submitting} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-black/10 bg-black text-white hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50">
          {submitting && <span className="inline-block w-3 h-3 border-2 border-white/70 border-t-transparent animate-spin rounded-full" aria-hidden="true" />}
          {!submitting && <FiCheckCircle className="w-4 h-4" />}
          {form.id ? (submitting ? 'Saving...' : 'Save Changes') : (submitting ? 'Creating...' : 'Create')}
        </button>
      </div>
    </form>
  );
}

/* Field Component */
function Field({ label, children, required, helper, error }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:gap-2">
      <div className="md:w-32 mb-2 md:mb-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-900">{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
        {helper && (
          <div className="text-xs text-gray-500 mt-1">{helper}</div>
        )}
      </div>
      <div className="flex-1">
        {children}
        {error && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{error}</p>}
      </div>
    </div>
  );
}

/* Collapsible guidelines component */
function ImageGuidelines() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative mt-7">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-help"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <FiInfo className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">Image guidelines</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 bg-white rounded-xl border border-black/10 p-3 text-gray-600 text-xs shadow-sm" role="dialog" aria-label="Image guidelines">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-700 mb-1">
            <FiInfo className="w-4 h-4 text-gray-500" />
            <span>Image guidelines</span>
          </div>
          <ul className="list-disc ml-4 space-y-1">
            <li>Accepted formats: jpg, jpeg, png, svg.</li>
            <li>Square assets: 800–1000px (1:1).</li>
            <li>Banner: 1920×1080 (16:9).</li>
            <li>Keep files under ~2–5MB for faster uploads.</li>
            <li>Use public CORS-enabled URLs for remote previews.</li>
            <li>Prefer sRGB; avoid animated SVGs for previews.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* Image Field modern card */
function ImageField({ label, helper, value, onChange, previewSize }) {
  const [mode, setMode] = useState(value && value.startsWith('data:') ? 'upload' : 'url');
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const fileRef = useRef(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hashCache, setHashCache] = useState({}); // name -> url mapping to avoid re-uploads

  const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const resizeDataUrl = (dataUrl, fileType, maxW = 1400, maxH = 1400) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const ratio = Math.min(1, maxW / width, maxH / height);
      const nw = Math.round(width * ratio);
      const nh = Math.round(height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = nw; canvas.height = nh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, nw, nh);
      const outType = fileType === 'image/png' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(outType, outType === 'image/png' ? 1 : 0.9));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  const allowedExt = ['png', 'jpg', 'jpeg', 'svg'];

  const resetFileInput = () => { try { if (fileRef.current) fileRef.current.value = null; } catch(e) {} };

  const handleFileSelect = async (file) => {
    setFileError('');
    if (!file) return;
    const mimeOk = allowedTypes.includes(file.type);
    const ext = (file.name || '').split('.').pop().toLowerCase();
    const extOk = allowedExt.includes(ext);
    if (!mimeOk || !extOk) {
      setFileError('Only png, jpg, jpeg, svg allowed.');
      resetFileInput();
      setFileName('');
      onChange('');
      return;
    }
    setFileName(file.name);
    try {
      const dataUrl = await readFileAsDataURL(file);
      const resized = await resizeDataUrl(dataUrl, file.type);
      // show preview immediately
      onChange(resized);

      // compute hash to dedupe (skip large re-uploads of identical files in this session)
      try {
        const hash = await crypto.subtle.digest('SHA-256', await (await fetch(resized)).arrayBuffer());
        const hashHex = Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
        if (hashCache[hashHex]) {
          // already uploaded identical content; reuse URL
          onChange(hashCache[hashHex]);
          return;
        }
        // upload in background
        setUploading(true); setProgress(0);
        // Convert dataURL to blob
        const resFetch = await fetch(resized);
        const blob = await resFetch.blob();
        const formData = new FormData();
        // Generic temporary endpoint for direct image upload (category not yet created) -> fallback to keep dataURL if fails
        formData.append('file', new File([blob], file.name, { type: blob.type }));
        // Attempt optional generic upload endpoint (if exists) else skip silently
        try {
          const resp = await apiClient.post('/api/uploads/temp', formData, {
            onUploadProgress: (pe) => {
              if (pe.total) setProgress(Math.round((pe.loaded * 100)/pe.total));
            }
          });
          if (resp?.data?.url) {
            setHashCache(prev => ({ ...prev, [hashHex]: resp.data.url }));
            onChange(resp.data.url);
          }
        } catch(uploadErr){
          // ignore; will upload properly after category creation via slot endpoints
        }
      } catch(hashErr) { /* ignore hashing issues */ }
      finally { setUploading(false); setProgress(0); }
    } catch(err) {
      const fallback = await readFileAsDataURL(file);
      onChange(fallback);
    }
  };

  const clearImage = () => { setFileName(''); onChange(''); resetFileInput(); };

  const truncateDisplayName = (name, maxLen = 22) => {
    if (!name) return '';
    const parts = name.split('.');
    if (parts.length === 1) return name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name;
    const ext = parts.pop();
    const base = parts.join('.');
    if (base.length <= maxLen) return `${base}.${ext}`;
    return `${base.slice(0, maxLen - 1)}….${ext}`;
  };

  return (
    <div className="relative group bg-white rounded-xl border border-black/10 p-4 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h5 className="text-sm font-semibold text-gray-900 leading-tight">{label}</h5>
          {helper && <p className="text-[11px] text-gray-500 mt-0.5">{helper}</p>}
        </div>
        {value && (
          <button
            type="button"
            onClick={clearImage}
            className="opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center w-8 h-8 rounded-lg border border-black/10 text-gray-500 hover:text-rose-700 hover:border-rose-200 bg-white"
            title="Remove image"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preview */}
      <div className={`relative mb-3 overflow-hidden bg-gray-50 rounded-lg border border-dashed border-black/20 flex items-center justify-center ${previewSize || ''}`}>
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { if (mode === 'upload') { fileRef.current?.click(); } else { setMode('upload'); } }}
                  className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 text-xs font-semibold text-gray-800 shadow-sm hover:bg-white"
                >
                  <FiUpload className="w-4 h-4" />
                  <span>Change</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCropOpen(true)}
                  className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 text-xs font-semibold text-gray-800 shadow-sm hover:bg-white"
                >
                  <FiImage className="w-4 h-4" />
                  <span>Crop</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-400 text-xs gap-1 py-6">
            <FiImage className="w-6 h-6" />
            <span>No image</span>
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5 mb-2 self-start" role="tablist" aria-label="Image input mode">
        <button
          type="button"
          onClick={() => { setMode('url'); setFileError(''); resetFileInput(); }}
          aria-pressed={mode === 'url'}
          className={`flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded-full transition ${mode === 'url' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
        >
          <FiLink className="w-4 h-4" />
          <span>URL</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('upload'); setFileError(''); }}
          aria-pressed={mode === 'upload'}
          className={`flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded-full transition ${mode === 'upload' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
        >
          <FiUpload className="w-4 h-4" />
          <span>Upload</span>
        </button>
      </div>

      {/* Inputs */}
      {mode === 'url' ? (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-black/10 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-xs"
          placeholder="https://.../image.jpg"
        />
      ) : (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files && e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-black/10 bg-black text-white text-xs font-semibold hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <FiUpload className="w-4 h-4" />
            <span>{value ? 'Replace image' : 'Upload image'}</span>
          </button>
          {(fileName || fileError || (value && value.startsWith('data:'))) && (
            <div className="mt-2 text-[11px] flex items-center gap-2">
              {uploading && <span className="text-gray-600">Uploading {progress}%</span>}
              {!fileError && (fileName || (value && value.startsWith('data:'))) && (
                <>
                  <span className="text-gray-600 truncate" title={fileName || 'Uploaded image'}>{truncateDisplayName(fileName || 'uploaded-image.png')}</span>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-600"
                    aria-label="Remove image"
                    title="Remove"
                  >
                    <FiXCircle className="w-3 h-3 -ml-2" />
                  </button>
                </>
              )}
              {fileError && <span className="text-red-600">{fileError}</span>}
            </div>
          )}
        </div>
      )}
      <CropModal
        src={value}
        aspect={(previewSize || '').includes('aspect-video') ? 16/9 : 1}
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onComplete={(dataUrl) => {
          onChange(dataUrl);
        }}
      />
    </div>
  );
}
