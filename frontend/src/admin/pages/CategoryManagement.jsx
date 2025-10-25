import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SearchBar from '../../components/layout/SearchBar';
import PopupModal from "../../components/ui/PopupModal";
import CategoryGrid from '../components/categories/CategoryGrid';
import CategoryForm from '../components/categories/CategoryForm';
import { slugify, cap, today, niceDate } from '../components/categories/categoryUtils';
// Updated relative paths to api modules
import { useCategories } from '../../api/hooks/useCategories';
import { uploadCategoryImage } from '../../api/categoryApi';

export default function CategoryManagement() {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);

	// Request all categories (active + inactive) for admin management
	const { data: categories, loading, error, create, update, remove, reload } = useCategories({ size: 500, status: 'all' });

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [toDelete, setToDelete] = useState(null);

	useEffect(() => { setPage(1); }, [query, statusFilter, pageSize]);

	const filtered = useMemo(() => {
		return (categories || []).filter((c) => {
			const matchesQuery = `${c.name} ${c.slug || ''} ${c.description || ''}`.toLowerCase().includes(query.toLowerCase());
			// backend doesn't yet provide status, treat all as active
			const status = c.status || 'active';
			const matchesStatus = statusFilter === 'all' ? true : status === statusFilter;
			return matchesQuery && matchesStatus;
		});
	}, [categories, query, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const pageData = useMemo(() => {
		const start = (page - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, page, pageSize]);

	const parentName = () => '—'; // no parent concept in backend yet

	const openCreate = () => {
		setEditing({
			id: null,
			name: '',
			slug: '',
			description: '',
			status: 'active',
			// form-specific image keys (UI state names)
			mainImage: '',
			tileImage1: '',
			tileImage2: '',
			carouselImage: ''
		});
		setIsFormOpen(true);
	};
	const openEdit = (cat) => {
		// Map backend (new + legacy) field names to form image fields
		setEditing({
			id: cat.id,
			name: cat.name || '',
			slug: cat.slug || '',
			description: cat.description || '',
			status: cat.status || 'active',
			mainImage: cat.catMainImg || cat.categoryImage || '',
			tileImage1: cat.catTileImage1 || cat.categoryIcon || '',
			tileImage2: cat.catTileImage2 || cat.categoryIcon2 || '', // future expansion if added
			carouselImage: cat.carouselImg || cat.carouselImage || ''
		});
		setIsFormOpen(true);
	};
	const openDelete = (cat) => { setToDelete(cat); setIsDeleteOpen(true); };

	const handleSave = async (form) => {
		if (!form.name.trim()) return;
		// Prepare base payload excluding images (we may upload them separately)
		const basePayload = { name: form.name, description: form.description, status: form.status };
		const needsUpload = (val) => typeof val === 'string' && val.startsWith('data:');

		try {
			let categoryId = form.id;
			if (!categoryId) {
				// Create category first (without images) to obtain ID
				const created = await create(basePayload);
				categoryId = created.id;
			}

			// Upload any data URL images
			const uploadOps = [];
			if (needsUpload(form.mainImage)) uploadOps.push({ slot: 'main', data: form.mainImage });
			if (needsUpload(form.tileImage1)) uploadOps.push({ slot: 'tile1', data: form.tileImage1 });
			if (needsUpload(form.tileImage2)) uploadOps.push({ slot: 'tile2', data: form.tileImage2 });
			if (needsUpload(form.carouselImage)) uploadOps.push({ slot: 'carousel', data: form.carouselImage });

			const slotUrlMap = {};

			// Helper: convert data URL -> File
			const dataUrlToFile = async (dataUrl, slot) => {
				const res = await fetch(dataUrl);
				const blob = await res.blob();
				// Prefer webp extension if blob is webp (smaller) else derive from mime
				let ext = 'jpg';
				if (blob.type === 'image/png') ext = 'png';
				else if (blob.type === 'image/svg+xml') ext = 'svg';
				else if (blob.type === 'image/webp') ext = 'webp';
				const fileName = `${slot}-${Date.now()}.${ext}`;
				return new File([blob], fileName, { type: blob.type });
			};

			if (uploadOps.length) {
				const startedAt = performance.now();
				await Promise.all(uploadOps.map(async (op) => {
					try {
						const file = await dataUrlToFile(op.data, op.slot);
						const uploaded = await uploadCategoryImage(categoryId, file, op.slot);
						slotUrlMap[op.slot] = uploaded.url;
					} catch (err) {
						// Fail soft: still allow category save with remaining images
						console.warn('Image upload failed for slot', op.slot, err);
					}
				}));
				const totalMs = Math.round(performance.now() - startedAt);
				// eslint-disable-next-line no-console
				console.debug(`[CategoryManagement] Uploaded ${uploadOps.length} image(s) in ${totalMs}ms`);
			}

			// Build final update payload with NEW canonical field names; include legacy names for transitional compatibility
			const finalPayload = {
				...basePayload,
				catMainImg: slotUrlMap.main || (!needsUpload(form.mainImage) ? form.mainImage : undefined),
				catTileImage1: slotUrlMap.tile1 || (!needsUpload(form.tileImage1) ? form.tileImage1 : undefined),
				catTileImage2: slotUrlMap.tile2 || (!needsUpload(form.tileImage2) ? form.tileImage2 : undefined),
				carouselImg: slotUrlMap.carousel || (!needsUpload(form.carouselImage) ? form.carouselImage : undefined),
				// Explicitly null out legacy names if they ever appear
				categoryImage: undefined,
				categoryIcon: undefined,
				carouselImage: undefined
			};

			await update(categoryId, finalPayload);
			setIsFormOpen(false); setEditing(null);
			// Optionally reload to reflect fresh URLs
			await reload();
		} catch (e) {
			throw e; // surface to form
		}
	};

	const handleDelete = async () => {
		if (!toDelete) return;
		try { await remove(toDelete.id); } catch (e) { /* ignore */ }
		setIsDeleteOpen(false); setToDelete(null);
	};

	return (
		<div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
				<div>
					<h1 className="text-6xl font-semibold text-black">Categories</h1>
					<p className="text-md text-gray-600 pt-4">Create, edit, and organize product categories.</p>
				</div>
				<button
					onClick={openCreate}
					className="group relative inline-flex items-center justify-center h-11 px-4 border-2 border-black bg-black text-white hover:bg-[#23f47d] hover:text-black transition-colors"
				>
					<FiPlus className="mr-2" />
					<span className="text-sm font-medium">Add Category</span>
				</button>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
				<div className="flex items-center gap-3 w-full">
					<div className="relative flex-1">
						<SearchBar
							name="categorySearch"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search categories..."
							width="320px"
						/>
					</div>

					<div className="flex items-center gap-3">
						<div className="flex items-center space-x-2">
							<span className="text-md text-gray-700 hidden md:inline">Status</span>
							<div className="inline-flex rounded-full border-2 border-black overflow-hidden mr-2">
								{(['all', 'active', 'inactive']).map((s, idx) => (
									<button
										key={s}
										onClick={() => setStatusFilter(s)}
										aria-pressed={statusFilter === s}
										className={`px-3 py-2 text-sm ${statusFilter === s ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#23f47d]'} ${idx === 0 ? 'rounded-l-full' : ''} ${idx === 2 ? 'rounded-r-full' : ''}`}
									>
										{cap(s)}
									</button>
								))}
							</div>
						</div>

						<div className="flex items-center gap-2">
							<FiFilter className="text-black" />
							<div className="text-sm bg-gray-100 border border-gray-200 text-gray-800 px-3 py-1">{filtered.length} result(s)</div>
						</div>
					</div>
				</div>
			</div>

			{/* Table */}
			<CategoryGrid data={pageData} onEdit={openEdit} onDelete={openDelete} parentName={parentName} />

			{/* Pagination */}
			<div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
				<div className="flex items-center gap-2 text-sm">
					<span>Rows per page</span>
					<select
						value={pageSize}
						onChange={(e) => setPageSize(parseInt(e.target.value))}
						className="border-2 border-black px-2 py-1 bg-white"
					>
						{[5, 10, 20].map((s) => (
							<option key={s} value={s}>{s}</option>
						))}
					</select>
					<span className="text-gray-600">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
				</div>
				<div className="inline-flex border-2 border-black">
					<button
						className="px-3 py-2 bg-white hover:bg-[#23f47d]"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						<FiChevronLeft />
					</button>
					<div className="px-3 py-2 bg-black text-green-400 text-sm">{page} / {totalPages}</div>
					<button
						className="px-3 py-2 bg-white hover:bg-[#23f47d]"
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
					>
						<FiChevronRight />
					</button>
				</div>
			</div>

			{/* Create/Edit Modal */}
			<PopupModal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditing(null); }} maxWidthClass="max-w-7xl">
				{editing && (
					<CategoryForm
						key={editing.id ?? "new"}
						initial={editing}
						existing={categories}
						onCancel={() => { setIsFormOpen(false); setEditing(null); }}
						onSubmit={handleSave}
					/>
				)}
			</PopupModal>

			{/* Delete Confirm */}
			<PopupModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
				<div className="p-1">
					<h3 className="text-xl font-semibold text-black mb-2">Delete category?</h3>
					<p className="text-sm text-gray-700 mb-5">This will remove "{toDelete?.name}" from the list. This action cannot be undone.</p>
					<div className="flex justify-end gap-2">
						<button onClick={() => setIsDeleteOpen(false)} className="px-3 py-2 border-2 border-black bg-white">Cancel</button>
						<button onClick={handleDelete} className="px-3 font-medium py-2 border-2 border-black bg-black text-white hover:bg-[#23f47d] hover:text-black">Delete</button>
					</div>
				</div>
			</PopupModal>
		</div>
	);
}



