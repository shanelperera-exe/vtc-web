package com.vtcweb.backend.service.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/** Cloudinary implementation of ImageStorageService. */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryImageStorageService implements ImageStorageService {

	private final Cloudinary cloudinary;

	@Override
	public UploadResult upload(MultipartFile file, String folder) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("file must not be empty");
		}
		try {
			// Basic validation of content type
			String contentType = file.getContentType();
			if (contentType != null && !contentType.startsWith("image/")) {
				throw new IllegalArgumentException("Only image files are allowed");
			}
			@SuppressWarnings("unchecked")
			Map<String, Object> params = (Map<String, Object>) (Map<?, ?>) ObjectUtils.asMap(
					"folder", folder != null && !folder.isBlank() ? folder : "products",
					"resource_type", "image",
					"overwrite", false,
					"format", deriveFormat(contentType));
			Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), params);
			String url = (String) result.get("secure_url");
			String publicId = (String) result.get("public_id");
			String format = (String) result.get("format");
			Number bytes = (Number) result.get("bytes");
			return new UploadResult(url, publicId, bytes != null ? bytes.longValue() : file.getSize(), format);
		} catch (IOException e) {
			throw new RuntimeException("Failed to upload image to Cloudinary", e);
		}
	}

	@Override
	public void delete(String publicId) {
		if (publicId == null || publicId.isBlank())
			return; // no-op
		try {
			cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
		} catch (Exception e) {
			log.warn("Failed to delete Cloudinary asset {}: {}", publicId, e.getMessage());
		}
	}

	private String deriveFormat(String contentType) {
		if (contentType == null)
			return null; // let Cloudinary decide
		if (MediaType.IMAGE_PNG_VALUE.equals(contentType))
			return "png";
		if (MediaType.IMAGE_JPEG_VALUE.equals(contentType))
			return "jpg";
		if ("image/webp".equals(contentType))
			return "webp";
		return null;
	}
}
