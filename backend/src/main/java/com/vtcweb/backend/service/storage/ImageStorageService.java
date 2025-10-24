package com.vtcweb.backend.service.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction for storing images (Cloudinary, S3, etc.).
 *
 * Folder conventions currently used:
 *  - categories/{categoryId}/{slot}   where slot ∈ {main, icon, carousel}
 *  - products/{SKU}/                  for product-level images (PRIMARY/SECONDARY)
 *  - products/{SKU}/variations/{variationId} for variation-specific images
 *
 * NOTE: Earlier uploads may exist in legacy folders (e.g. just categories/{id}).
 * Cleanup utilities should account for both layouts until migration completes.
 */
public interface ImageStorageService {

	/*
	 * Folder Convention (Cloudinary oriented):
	 *  categories/{categoryId}/{slot}
	 *      slot ∈ { main, icon, carousel }
	 *  products/{sku}/
	 *      (direct product images - PRIMARY/SECONDARY)
	 *  products/{sku}/variations/{variationId}
	 *      (variation-specific image assets)
	 *  Fallback: if SKU is missing, products/id-{productId}
	 *
	 * These folder names are assembled in the controllers (CategoryImageController & ProductImageController)
	 * prior to calling upload(). Keeping the logic there avoids coupling this abstraction to domain entities.
	 */

	/**
	 * Upload an image and return a descriptor.
	 * @param file multipart image file
	 * @param folder optional logical folder/path (provider-specific)
	 * @return upload result containing URL and provider public ID
	 */
	UploadResult upload(MultipartFile file, String folder);

	/**
	 * Delete a previously uploaded asset by its public ID.
	 * @param publicId provider public identifier
	 */
	void delete(String publicId);

	/**
	 * Convenience: derive a publicId from a typical Cloudinary secure URL and delete it.
	 * This is a best-effort helper used when only the URL was persisted. If URL format
	 * doesn't match expectations, the call is ignored.
	 * Expected formats:
	 *   https://res.cloudinary.com/<cloud>/image/upload/v<version>/<folder>/<name>.<ext>
	 *   https://res.cloudinary.com/<cloud>/image/upload/<folder>/<name>.<ext>
	 * Returns true if a delete attempt was made.
	 */
	default boolean deleteByUrl(String url) {
		if (url == null || url.isBlank()) return false;
		try {
			// Only handle Cloudinary secure URLs
			int idx = url.indexOf("/upload/");
			if (idx < 0) return false;
			String tail = url.substring(idx + "/upload/".length());
			// Strip version segment if present (v123456789)
			if (tail.startsWith("v")) {
				int slash = tail.indexOf('/');
				if (slash > 0) tail = tail.substring(slash + 1);
			}
			// Remove file extension
			int dot = tail.lastIndexOf('.');
			if (dot > 0) tail = tail.substring(0, dot);
			if (tail.isBlank()) return false;
			delete(tail); // delegate to provider-specific deletion
			return true;
		} catch (Exception ignored) {
			return false;
		}
	}

	/** Simple value object for upload results. */
	record UploadResult(String url, String publicId, long bytes, String format) {}
}
