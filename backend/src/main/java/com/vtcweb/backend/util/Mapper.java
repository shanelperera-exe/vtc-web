package com.vtcweb.backend.util;

import com.vtcweb.backend.dto.category.CategoryDTO;
import com.vtcweb.backend.dto.order.*;
import com.vtcweb.backend.dto.product.CreateProductRequest;
import com.vtcweb.backend.dto.product.ProductDTO;
import com.vtcweb.backend.dto.product.ProductVariationDTO;
import com.vtcweb.backend.dto.product.UpdateProductRequest;
import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.model.entity.order.*;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.product.ProductVariation;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Simple manual mapper to keep controllers/services decoupled from JPA entities at the API layer.
 */
public final class Mapper {

    private Mapper() {}

    // Category mappings (shallow by default to avoid lazy collection access)
    public static CategoryDTO toDto(Category category) {
        if (category == null) return null;
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .categoryImage(category.getCategoryImage())
                .categoryIcon(category.getCategoryIcon())
                .carouselImage(category.getCarouselImage())
                // productCount intentionally omitted to avoid lazy init issues
                .build();
    }

    public static Category toEntity(CategoryDTO dto) {
        if (dto == null) return null;
        Category category = new Category();
        category.setId(dto.getId());
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setCategoryImage(dto.getCategoryImage());
        category.setCategoryIcon(dto.getCategoryIcon());
        category.setCarouselImage(dto.getCarouselImage());
        return category;
    }

    // Product mappings
    /**
     * Shallow mapping: does not traverse lazy collections.
     */
    public static ProductDTO toDtoShallow(Product product) {
        if (product == null) return null;
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    /**
     * Detailed mapping: expects relations (images, variations and variation attributes) to be loaded.
     */
    public static ProductDTO toDtoWithDetails(Product product) {
        if (product == null) return null;
        List<String> imageUrls = Optional.ofNullable(product.getImages())
                .orElse(Collections.emptySet())
                .stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());

        // Map variations to DTOs including price and attributes
        // Deduplicate by variation ID to guard against duplicates from multi-collection eager fetch joins
        List<ProductVariationDTO> variationDTOs = Optional.ofNullable(product.getVariations())
                .orElse(Collections.emptyList())
                .stream()
                .filter(v -> v != null && v.getId() != null)
                .collect(Collectors.toMap(
                        ProductVariation::getId,
                        v -> v,
                        (a, b) -> a,
                        java.util.LinkedHashMap::new
                ))
                .values()
                .stream()
                .map(Mapper::toVariationDto)
                .collect(Collectors.toList());

        Integer variationCount = variationDTOs.isEmpty() ? 0 : variationDTOs.size();
        Integer imageCount = product.getImages() == null ? null : product.getImages().size();

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .imageUrls(imageUrls)
                .variations(variationDTOs)
                .imageCount(imageCount)
                .variationCount(variationCount)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private static ProductVariationDTO toVariationDto(ProductVariation v) {
        if (v == null) return null;
        return ProductVariationDTO.builder()
                .id(v.getId())
                // Do not expose the internal variationKey; API should rely on attributes instead
                .price(v.getPrice())
                .stock(v.getStock())
                .imageUrl(v.getImageUrl())
                .attributes(v.getAttributes())
                .build();
    }

    public static Product fromCreateRequest(CreateProductRequest req) {
        if (req == null) return null;
        Product product = new Product();
        product.setName(req.getName());
        product.setShortDescription(req.getShortDescription());
        product.setDescription(req.getDescription());
        product.setBasePrice(req.getBasePrice());
        // category is set in service using req.getCategoryId()
        return product;
    }

    public static void applyUpdates(Product target, UpdateProductRequest updates) {
        if (target == null || updates == null) return;
        if (updates.getName() != null) {
            target.setName(updates.getName());
        }
        if (updates.getShortDescription() != null) {
            target.setShortDescription(updates.getShortDescription());
        }
        if (updates.getDescription() != null) {
            target.setDescription(updates.getDescription());
        }
        if (updates.getBasePrice() != null) {
            target.setBasePrice(updates.getBasePrice());
        }
    }

    // Order mappings
    public static OrderDTO toOrderDtoShallow(Order order) {
        if (order == null) return null;
        return baseOrderDtoBuilder(order)
                .items(null)
                .build();
    }

    public static OrderDTO toOrderDtoWithItems(Order order) {
        if (order == null) return null;
        List<OrderItemDTO> items = Optional.ofNullable(order.getItems())
                .orElse(Collections.emptyList())
                .stream()
                .filter(i -> i != null && i.getId() != null)
                .map(Mapper::toOrderItemDto)
                .collect(Collectors.toList());
        return baseOrderDtoBuilder(order)
                .items(items)
                .build();
    }

    private static OrderDTO.OrderDTOBuilder baseOrderDtoBuilder(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .placedAt(order.getPlacedAt())
                .processingStartedAt(order.getProcessingStartedAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .customerFirstName(order.getCustomerFirstName())
                .customerLastName(order.getCustomerLastName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .billingAddress(toAddressDto(order.getBillingAddress()))
                .shippingAddress(toAddressDto(order.getShippingAddress()))
                .deliveryMethod(order.getDeliveryMethod())
                .paymentMethod(order.getPaymentMethod())
                .paymentInfo(toPaymentInfoDto(order.getPaymentInfo()))
                .subtotal(order.getSubtotal())
                .discountTotal(order.getDiscountTotal())
                .shippingFee(order.getShippingFee())
                .total(order.getTotal());
    }

    private static OrderItemDTO toOrderItemDto(OrderItem item) {
        if (item == null) return null;
        return OrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .categoryId(item.getCategoryId())
                .categoryName(item.getCategoryName())
                .variationId(item.getVariationId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .variationAttributes(item.getVariationAttributes())
                .build();
    }

    private static AddressDTO toAddressDto(Address address) {
        if (address == null) return null;
        return AddressDTO.builder()
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .build();
    }

    private static PaymentInfoDTO toPaymentInfoDto(PaymentInfo pi) {
        if (pi == null) return null;
        return PaymentInfoDTO.builder()
                .cardType(pi.getCardType())
                .cardLast4(pi.getCardLast4())
                .cardExpMonth(pi.getCardExpMonth())
                .cardExpYear(pi.getCardExpYear())
                .build();
    }

    // Helper to build a deterministic variation key from attributes map
    public static String buildVariationKey(java.util.Map<String, String> attributes) {
        if (attributes == null || attributes.isEmpty()) return null;
        return attributes.entrySet().stream()
                .filter(e -> e.getKey() != null && e.getValue() != null)
                .sorted(java.util.Map.Entry.comparingByKey(String.CASE_INSENSITIVE_ORDER))
                .map(e -> escape(e.getKey().trim()) + "=" + escape(e.getValue().trim()))
                .collect(Collectors.joining("|"));
    }

    private static String escape(String s) {
        // escape backslash first, then '|' and '=' to avoid delimiter collisions
        return s.replace("\\", "\\\\")
                .replace("|", "\\|")
                .replace("=", "\\=");
    }
}
