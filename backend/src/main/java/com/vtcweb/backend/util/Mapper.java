package com.vtcweb.backend.util;

import com.vtcweb.backend.dto.category.CategoryDTO;
import com.vtcweb.backend.dto.product.CreateProductRequest;
import com.vtcweb.backend.dto.product.ProductDTO;
import com.vtcweb.backend.dto.product.ProductVariationDTO;
import com.vtcweb.backend.dto.product.UpdateProductRequest;
import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.product.ProductVariation;
// Order imports
import com.vtcweb.backend.dto.order.*;
import com.vtcweb.backend.model.entity.order.*;
import com.vtcweb.backend.dto.user.UserDto;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.dto.review.ReviewDTO;
import com.vtcweb.backend.model.entity.review.Review;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Objects;

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
                .status(category.getStatus() == null ? null : category.getStatus().name().toLowerCase())
                .code(category.getCode())
                .catMainImg(category.getCatMainImg())
                .catTileImage1(category.getCatTileImage1())
                .catTileImage2(category.getCatTileImage2())
                .carouselImg(category.getCarouselImg())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt() != null ? category.getUpdatedAt() : category.getCreatedAt())
                // productCount intentionally omitted to avoid lazy init issues
                .build();
    }

    public static Category toEntity(CategoryDTO dto) {
        if (dto == null) return null;
        Category category = new Category();
        category.setId(dto.getId());
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            String s = dto.getStatus().trim().toUpperCase();
            try {
                category.setStatus(com.vtcweb.backend.model.entity.category.CategoryStatus.valueOf(s));
            } catch (IllegalArgumentException ex) {
                // ignore invalid; leave null to allow service defaults
            }
        }
    category.setCode(dto.getCode());
    category.setCatMainImg(dto.getCatMainImg());
    category.setCatTileImage1(dto.getCatTileImage1());
    category.setCatTileImage2(dto.getCatTileImage2());
    category.setCarouselImg(dto.getCarouselImg());
        return category;
    }

    // Product mappings
    /**
     * Shallow mapping: does not traverse lazy collections.
     */
    public static ProductDTO toDtoShallow(Product product) {
        if (product == null) return null;
    String categoryName = product.getCategory() != null ? product.getCategory().getName() : null;
    return ProductDTO.builder()
        .id(product.getId())
        .sku(product.getSku())
        .name(product.getName())
        .shortDescription(product.getShortDescription())
    .detailedDescription(product.getDetailedDescription())
        .basePrice(product.getBasePrice())
        .price(product.getBasePrice()) // alias
        .highlights(product.getHighlights() == null ? null : List.copyOf(product.getHighlights()))
        .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
        .categoryName(categoryName)
        .category(categoryName) // alias for frontend expecting product.category
        .status(product.getStatus() == null ? null : product.getStatus().name().toLowerCase())
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
                .collect(java.util.stream.Collectors.toMap(
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

    String categoryName = product.getCategory() != null ? product.getCategory().getName() : null;
    // Determine primary image: first PRIMARY type, else first available
    String primary = null;
    if (product.getImages() != null) {
        primary = product.getImages().stream()
            .filter(Objects::nonNull)
            .filter(img -> img.getType() == ProductImage.ImageType.PRIMARY)
            .map(ProductImage::getUrl)
            .findFirst()
            .orElseGet(() -> product.getImages().stream()
                .filter(Objects::nonNull)
                .map(ProductImage::getUrl)
                .findFirst().orElse(null));
    }
    return ProductDTO.builder()
        .id(product.getId())
        .sku(product.getSku())
        .name(product.getName())
        .shortDescription(product.getShortDescription())
    .detailedDescription(product.getDetailedDescription())
        .basePrice(product.getBasePrice())
        .price(product.getBasePrice())
        .highlights(product.getHighlights() == null ? null : List.copyOf(product.getHighlights()))
        .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
        .categoryName(categoryName)
        .category(categoryName)
        .imageUrls(imageUrls)
        .image(primary)
        .primaryImageUrl(primary)
        .variations(variationDTOs)
        .imageCount(imageCount)
        .variationCount(variationCount)
        .status(product.getStatus() == null ? null : product.getStatus().name().toLowerCase())
        .createdAt(product.getCreatedAt())
        .updatedAt(product.getUpdatedAt())
        .build();
    }

    public static ProductVariationDTO toVariationDto(ProductVariation v) {
        if (v == null) return null;
        return ProductVariationDTO.builder()
                .id(v.getId())
                // Do not expose the internal variationKey; API should rely on attributes instead
                .price(v.getPrice())
                .stock(v.getStock())
                .imageUrl(v.getImageUrl())
                // Prefer variation-level threshold if present; default to 5
                .lowStockThreshold(getLowStockThresholdOrDefault(v))
                .attributes(v.getAttributes())
                .build();
    }

    private static Integer getLowStockThresholdOrDefault(ProductVariation v) {
        try {
            // If the entity has a field/getter for lowStockThreshold, use it; otherwise default
            java.lang.reflect.Method getter = v.getClass().getMethod("getLowStockThreshold");
            Object val = getter.invoke(v);
            if (val instanceof Integer) {
                Integer i = (Integer) val;
                if (i != null) return i;
            }
        } catch (NoSuchMethodException ignored) {
            // Entity does not yet expose the field; fall through to default
        } catch (Exception ignored) {
        }
        return 5;
    }

    public static Product fromCreateRequest(CreateProductRequest req) {
        if (req == null) return null;
        Product product = new Product();
        product.setName(req.getName());
        product.setShortDescription(req.getShortDescription());
    product.setDetailedDescription(req.getDetailedDescription());
        product.setBasePrice(req.getBasePrice());
        // Optional status
        if (req.getStatus() != null) {
            try {
                product.setStatus(com.vtcweb.backend.model.entity.product.ProductStatus.valueOf(req.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
                // leave null; service will default
            }
        }
        if (req.getHighlights() != null) {
            // Sanitize: trim, remove blanks, cap list size
            java.util.List<String> sanitized = req.getHighlights().stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .limit(25)
                    .toList();
            product.setHighlights(new java.util.ArrayList<>(sanitized));
        }
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
        if (updates.getDetailedDescription() != null) {
            target.setDetailedDescription(updates.getDetailedDescription());
        }
        if (updates.getBasePrice() != null) {
            target.setBasePrice(updates.getBasePrice());
        }
        if (updates.getStatus() != null) {
            try {
                target.setStatus(com.vtcweb.backend.model.entity.product.ProductStatus.valueOf(updates.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
                // ignore invalid; keep previous
            }
        }
        if (updates.getHighlights() != null) {
            // Replace entire list (client sends authoritative ordering); filter blank entries
            List<String> sanitized = updates.getHighlights().stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .limit(25) // arbitrary safety cap
                    .toList();
            target.setHighlights(new java.util.ArrayList<>(sanitized));
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
    // Protect against duplicate OrderItem instances returned by JPA fetch joins
    List<OrderItemDTO> items = Optional.ofNullable(order.getItems())
        .orElse(Collections.emptyList())
        .stream()
        .filter(i -> i != null && i.getId() != null)
        // Deduplicate by id preserving insertion order
        .collect(Collectors.toMap(
            com.vtcweb.backend.model.entity.order.OrderItem::getId,
            i -> i,
            (a, b) -> a,
            java.util.LinkedHashMap::new
        ))
        .values()
        .stream()
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
                .cancelledAt(order.getCancelledAt())
                .customerFirstName(order.getCustomerFirstName())
                .customerLastName(order.getCustomerLastName())
                .customerEmail(order.getCustomerEmail())
                .customerId(order.getUser() != null ? order.getUser().getId() : null)
                .customerUserCode(order.getUser() != null ? order.getUser().getUserCode() : null)
                .customerPhone(order.getCustomerPhone())
                .billingAddress(toAddressDto(order.getBillingAddress()))
                .shippingAddress(toAddressDto(order.getShippingAddress()))
                .deliveryMethod(order.getDeliveryMethod())
                .paymentMethod(order.getPaymentMethod())
                .paymentInfo(toPaymentInfoDto(order.getPaymentInfo()))
                .subtotal(order.getSubtotal())
                .discountTotal(order.getDiscountTotal())
                .taxTotal(order.getTaxTotal())
                .shippingFee(order.getShippingFee())
                .total(order.getTotal())
                .orderNotes(order.getOrderNotes());
    }

    public static OrderItemDTO toOrderItemDto(OrderItem item) {
        if (item == null) return null;
        return OrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .imageUrl(getOrderItemImageUrl(item))
                .categoryId(item.getCategoryId())
                .categoryName(item.getCategoryName())
                .variationId(item.getVariationId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .variationAttributes(item.getVariationAttributes())
                .build();
    }

    private static String getOrderItemImageUrl(com.vtcweb.backend.model.entity.order.OrderItem item) {
        if (item == null) return null;
        try {
            // If OrderItem stores imageUrl in entity (future), prefer it via getter
            java.lang.reflect.Method m = item.getClass().getMethod("getImageUrl");
            Object v = m.invoke(item);
            if (v instanceof String) {
                String s = (String) v;
                if (s != null && !s.isBlank()) return s;
            }
        } catch (NoSuchMethodException ignored) {
            // method not present on entity, fall back to null
        } catch (Exception ignored) {
        }
        return null;
    }

    private static AddressDTO toAddressDto(Address address) {
        if (address == null) return null;
        return AddressDTO.builder()
                .company(address.getCompany())
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .district(address.getDistrict())
        .province(address.getProvince())
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
                .map(e -> {
                    String key = e.getKey().trim();
                    if (!key.isEmpty()) {
                        key = key.substring(0,1).toUpperCase() + key.substring(1); // normalize first char uppercase
                    }
                    return escape(key) + "=" + escape(e.getValue().trim());
                })
                .collect(Collectors.joining("|"));
    }

    private static String escape(String s) {
        // escape backslash first, then '|' and '=' to avoid delimiter collisions
        return s.replace("\\", "\\\\")
                .replace("|", "\\|")
                .replace("=", "\\=");
    }

    // User mappings
    public static UserDto toUserDto(User user) {
        if (user == null) return null;
        java.util.Set<String> roles = user.getRoles() == null ? java.util.Collections.emptySet() : user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet());
        return UserDto.builder()
                .id(user.getId())
        .userCode(user.getUserCode())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roles(roles)
                .enabled(user.isEnabled())
                .locked(user.isLocked())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                // orderCount and totalSpend can be set by services if needed
                .build();
    }

    // Review mapping
    public static ReviewDTO toReviewDto(Review r) {
        if (r == null) return null;
        return ReviewDTO.builder()
                .id(r.getId())
                .productId(r.getProduct() != null ? r.getProduct().getId() : null)
                .rating(r.getRating())
                .title(r.getTitle())
                .body(r.getBody())
                .name(r.getName())
                .email(r.getEmail())
                .userId(r.getReviewer() != null ? r.getReviewer().getId() : null)
                .createdAt(r.getCreatedAt())
                .build();
    }
}
