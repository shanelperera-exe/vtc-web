package com.vtcweb.backend.controller.product;

import com.vtcweb.backend.dto.product.ProductVariationCreateRequest;
import com.vtcweb.backend.dto.product.ProductVariationDTO;
import com.vtcweb.backend.dto.product.UpdateProductVariationRequest;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.service.product.ProductVariationService;
import com.vtcweb.backend.util.Mapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/variations")
@RequiredArgsConstructor
public class ProductVariationController {

    private final ProductVariationService variationService;

    @GetMapping
    public ResponseEntity<Page<ProductVariationDTO>> list(@PathVariable Long productId, Pageable pageable) {
        Page<ProductVariation> page = variationService.listByProduct(productId, pageable).map(v -> v);
        return ResponseEntity.ok(page.map(Mapper::toVariationDto));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductVariationDTO>> listAll(@PathVariable Long productId) {
        List<ProductVariationDTO> list = variationService.listByProduct(productId).stream().map(Mapper::toVariationDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ProductVariationDTO> create(@PathVariable Long productId,
            @Valid @RequestBody ProductVariationCreateRequest request) {
        ProductVariation v = new ProductVariation();
        v.setPrice(request.getPrice());
        v.setStock(request.getStock());
        v.setImageUrl(request.getImageUrl());
        v.setAttributes(request.getAttributes());
        ProductVariation created = variationService.create(productId, v);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(Mapper.toVariationDto(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ProductVariationDTO> update(@PathVariable Long productId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductVariationRequest request) {
        ProductVariation patch = new ProductVariation();
        patch.setPrice(request.getPrice());
        patch.setStock(request.getStock());
        patch.setImageUrl(request.getImageUrl());
        patch.setAttributes(request.getAttributes());
        ProductVariation updated = variationService.update(id, patch);
        return ResponseEntity.ok(Mapper.toVariationDto(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long productId, @PathVariable Long id) {
        variationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
