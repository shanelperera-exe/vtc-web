package com.vtcweb.backend.controller.product;

import com.vtcweb.backend.dto.product.ProductImageDTO;
import com.vtcweb.backend.dto.product.ProductImagesSyncRequest;
import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.product.ProductImage.ImageType;
import com.vtcweb.backend.service.product.ProductImageService;
import com.vtcweb.backend.service.product.ProductService;
import com.vtcweb.backend.service.storage.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

/** Endpoints for product & variation image uploads via backend-proxied Cloudinary. */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductImageController {

    private final ImageStorageService imageStorageService;
	private final ProductImageService productImageService;
	private final ProductService productService; // to obtain SKU for folder naming

    /** Upload an image for a product (multipart). */
	@PostMapping(value = "/{productId}/images/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> uploadForProduct(@PathVariable Long productId,
								@RequestPart("file") MultipartFile file,
								@RequestParam(name = "type", required = false) ImageType type) {
	// Folder structure: products/{sku}/ (primary & secondary images)
	String sku = productService.getById(productId).getSku();
	String folder = "products/" + (sku != null ? sku : ("id-" + productId));
	ImageStorageService.UploadResult uploaded = imageStorageService.upload(file, folder);
	ProductImage created = productImageService.addToProduct(productId, uploaded.url(), type);
	URI location = ServletUriComponentsBuilder.fromCurrentRequest()
		.path("/{id}")
		.buildAndExpand(created.getId())
		.toUri();
	return ResponseEntity.created(location).body(Map.of(
		"id", created.getId(),
		"url", created.getUrl(),
		"type", created.getType().name(),
		"publicId", uploaded.publicId(),
		"bytes", uploaded.bytes(),
		"format", uploaded.format()
	));
    }

    /** Upload an image tied to a specific variation. */
	@PostMapping(value = "/{productId}/variations/{variationId}/images/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> uploadForVariation(@PathVariable Long productId,
								  @PathVariable Long variationId,
								  @RequestPart("file") MultipartFile file,
								  @RequestParam(name = "type", required = false) ImageType type) {
	// Folder structure for variation image: products/{sku}/variations/{variationId}
	String sku = productService.getById(productId).getSku();
	String baseFolder = "products/" + (sku != null ? sku : ("id-" + productId));
	ImageStorageService.UploadResult uploaded = imageStorageService.upload(file, baseFolder + "/variations/" + variationId);
	ProductImage created = productImageService.addToVariation(productId, variationId, uploaded.url(), type);
	URI location = ServletUriComponentsBuilder.fromCurrentRequest()
		.path("/{id}")
		.buildAndExpand(created.getId())
		.toUri();
	return ResponseEntity.created(location).body(Map.of(
		"id", created.getId(),
		"url", created.getUrl(),
		"type", created.getType().name(),
		"publicId", uploaded.publicId(),
		"bytes", uploaded.bytes(),
		"format", uploaded.format()
	));
    }

	@PostMapping(value = "/{productId}/images/sync")
	@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> syncProductImages(@PathVariable Long productId,
								 @RequestBody ProductImagesSyncRequest request) {
	List<ProductImage> updated = productImageService.syncProductImages(
		productId,
		request.getPrimaryImage(),
		request.getSecondaryImages()
	);
	List<ProductImageDTO> payload = updated.stream()
		.map(img -> ProductImageDTO.builder()
			.id(img.getId())
			.url(img.getUrl())
			.type(img.getType() != null ? img.getType().name() : null)
			.build())
		.toList();
	return ResponseEntity.ok(Map.of(
		"productId", productId,
		"images", payload
	));
    }
}
