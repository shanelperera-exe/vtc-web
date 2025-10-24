package com.vtcweb.backend.service.order;

import com.vtcweb.backend.dto.order.CreateOrderItemRequest;
import com.vtcweb.backend.dto.order.CreateOrderRequest;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.model.entity.order.*;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.repository.order.OrderRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.product.ProductVariationRepository;
import lombok.RequiredArgsConstructor;
import com.vtcweb.backend.service.email.EmailService;
import com.vtcweb.backend.service.email.EmailTemplateKey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariationRepository variationRepository;
    private final com.vtcweb.backend.repository.user.UserRepository userRepository;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public Order create(CreateOrderRequest request) {
        if (request == null) throw new IllegalArgumentException("request must not be null");
        validateCreateRequest(request);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PLACED);
        order.setCustomerFirstName(request.getCustomerFirstName());
        order.setCustomerLastName(request.getCustomerLastName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());

        // Addresses
        order.setBillingAddress(toAddressEntity(request.getBillingAddress()));
        order.setShippingAddress(toAddressEntity(request.getShippingAddress()));
        order.setDeliveryMethod(request.getDeliveryMethod());
        order.setPaymentMethod(request.getPaymentMethod());
        if (request.getPaymentMethod() == PaymentMethod.CARD) {
            if (request.getPaymentInfo() == null) {
                throw new IllegalArgumentException("paymentInfo required for CARD payments");
            }
            order.setPaymentInfo(toPaymentInfoEntity(request.getPaymentInfo()));
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateOrderItemRequest itemReq : request.getItems()) {
            if (itemReq == null) continue;
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found: id=" + itemReq.getProductId()));
            Category category = product.getCategory();
            ProductVariation variation = null;
            if (itemReq.getVariationId() != null) {
                variation = variationRepository.findByProductIdAndId(product.getId(), itemReq.getVariationId())
                        .orElseThrow(() -> new NotFoundException("Variation not found: productId=" + product.getId() + ", variationId=" + itemReq.getVariationId()));
            }
            int qty = (itemReq.getQuantity() == null) ? 0 : itemReq.getQuantity();
            if (qty <= 0) throw new IllegalArgumentException("quantity must be >= 1");

            BigDecimal unitPrice;
            if (variation != null && variation.getPrice() != null) {
                unitPrice = variation.getPrice();
            } else if (product.getBasePrice() != null) {
                unitPrice = product.getBasePrice();
            } else {
                throw new IllegalStateException("No price available for product id=" + product.getId());
            }
            if (unitPrice.signum() < 0) throw new IllegalStateException("unitPrice negative for product id=" + product.getId());

            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(qty));
            subtotal = subtotal.add(totalPrice);

            // choose best image URL: variation image > product primary > any
            String imageUrl = null;
            if (variation != null && variation.getImageUrl() != null && !variation.getImageUrl().isBlank()) {
                imageUrl = variation.getImageUrl();
            } else if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
                // try primary first
                for (var img : product.getImages()) {
                    if (img != null && img.getType() != null && img.getType().name().equals("PRIMARY") && img.getUrl() != null && !img.getUrl().isBlank()) {
                        imageUrl = img.getUrl();
                        break;
                    }
                }
                if (imageUrl == null) {
                    for (var img : product.getImages()) {
                        if (img != null && img.getUrl() != null && !img.getUrl().isBlank()) {
                            imageUrl = img.getUrl();
                            break;
                        }
                    }
                }
            }

            OrderItem item = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .categoryId(category != null ? category.getId() : null)
                    .categoryName(category != null ? category.getName() : null)
                    .variationId(variation != null ? variation.getId() : null)
                    .imageUrl(determineImageUrl(product, variation))
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .imageUrl(imageUrl)
                    // snapshot attributes defensively (clone) to preserve historical integrity
                    .variationAttributes(variation != null ? new java.util.HashMap<>(variation.getAttributes()) : new java.util.HashMap<>())
                    .build();
            order.addItem(item);
        }

        BigDecimal shippingFee = defaultNonNegative(request.getShippingFee());
        BigDecimal discountTotal = defaultNonNegative(request.getDiscountTotal());
        if (discountTotal.compareTo(subtotal) > 0) {
            // clamp discount to subtotal
            discountTotal = subtotal;
        }
        BigDecimal total = subtotal.subtract(discountTotal).add(shippingFee);

        order.setSubtotal(subtotal);
        order.setDiscountTotal(discountTotal);
        order.setShippingFee(shippingFee);
        order.setTotal(total);

        // If the customer email corresponds to a registered user, link the order to that user
        if (order.getCustomerEmail() != null) {
            userRepository.findByEmailIgnoreCase(order.getCustomerEmail()).ifPresent(order::setUser);
        }
        Order saved = orderRepository.save(order);

        // Fire-and-forget order confirmation email
        try {
            if (saved.getCustomerEmail() != null && !saved.getCustomerEmail().isBlank()) {
                String to = saved.getCustomerEmail();
                String customerName = String.format("%s %s",
                        saved.getCustomerFirstName() == null ? "" : saved.getCustomerFirstName(),
                        saved.getCustomerLastName() == null ? "" : saved.getCustomerLastName()).trim();
                java.util.Map<String, Object> params = new java.util.HashMap<>();
                params.put("customer_name", customerName.isBlank() ? "Customer" : customerName);
                params.put("order_id", saved.getOrderNumber());
                params.put("total", saved.getTotal());
                // Optional items summary
                java.util.List<java.util.Map<String, Object>> items = new java.util.ArrayList<>();
                if (saved.getItems() != null) {
                    for (OrderItem it : saved.getItems()) {
                        if (it == null) continue;
                        java.util.Map<String, Object> m = new java.util.HashMap<>();
                        m.put("name", it.getProductName());
                        m.put("qty", it.getQuantity());
                        m.put("price", it.getTotalPrice());
                        items.add(m);
                    }
                }
                params.put("items", items);
                String subject = "Your VTC Order " + saved.getOrderNumber();
                emailService.sendTemplateAsync(EmailTemplateKey.ORDER_CONFIRMATION, to, subject, params);
            }
        } catch (Exception ignored) {
            // Do not block order creation if email fails
        }

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getByIdWithDetails(Long id) {
        return orderRepository.findOneById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> list(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new com.vtcweb.backend.exception.NotFoundException("Order not found: orderNumber=" + orderNumber));
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Optional<Order> getByOrderNumberWithDetails(String orderNumber) {
        return orderRepository.findOneByOrderNumber(orderNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> listByCustomerEmail(String email, Pageable pageable) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email must not be blank");
        return orderRepository.findByCustomerEmailIgnoreCase(email, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> listByUserId(Long userId, Pageable pageable) {
        if (userId == null) throw new IllegalArgumentException("userId must not be null");
        return orderRepository.findByUserId(userId, pageable);
    }

    @Override
    public Order updateStatus(Long id, OrderStatus newStatus) {
        return updateStatus(id, newStatus, null);
    }

    @Override
    public Order updateStatus(Long id, OrderStatus newStatus, LocalDateTime at) {
        if (newStatus == null) throw new IllegalArgumentException("newStatus must not be null");
        Order order = getById(id);
        OrderStatus current = order.getStatus();
        if (current == newStatus) return order; // idempotent

        // Enforce linear progression
        switch (newStatus) {
            case PROCESSING -> {
                if (current != OrderStatus.PLACED) {
                    throw new IllegalArgumentException("Cannot move to PROCESSING from " + current);
                }
                order.setStatus(OrderStatus.PROCESSING);
                order.setProcessingStartedAt(at != null ? at : LocalDateTime.now());
            }
            case SHIPPED -> {
                if (current != OrderStatus.PROCESSING) {
                    throw new IllegalArgumentException("Cannot move to SHIPPED from " + current);
                }
                order.setStatus(OrderStatus.SHIPPED);
                order.setShippedAt(at != null ? at : LocalDateTime.now());
            }
            case DELIVERED -> {
                if (current != OrderStatus.SHIPPED) {
                    throw new IllegalArgumentException("Cannot move to DELIVERED from " + current);
                }
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveredAt(at != null ? at : LocalDateTime.now());
            }
            case CANCELLED -> {
                // Allow cancel from PLACED or PROCESSING only
                if (current != OrderStatus.PLACED && current != OrderStatus.PROCESSING) {
                    throw new IllegalArgumentException("Cannot cancel order from status " + current);
                }
                // Only restore stock once per order (idempotency guard)
                if (!order.isStockRestored()) {
                    // For each order item that references a variation, lock and increment stock
                    for (OrderItem it : order.getItems()) {
                        if (it == null) continue;
                        Long varId = it.getVariationId();
                        int qty = it.getQuantity() == null ? 0 : it.getQuantity();
                        if (varId == null || qty <= 0) continue;
                        // lock variation row for update
                        ProductVariation variation = variationRepository.findWithLockingById(varId)
                                .orElse(null);
                        if (variation == null) continue; // nothing to do
                        Integer currentStock = variation.getStock();
                        int newStock = (currentStock == null ? 0 : currentStock) + qty;
                        variation.setStock(newStock);
                        variationRepository.save(variation);
                    }
                    order.setStockRestored(true);
                }
                order.setStatus(OrderStatus.CANCELLED);
                order.setCancelledAt(at != null ? at : LocalDateTime.now());
            }
            case PLACED -> throw new IllegalArgumentException("Cannot revert status to PLACED");
        }
        Order saved = orderRepository.save(order);

        // Notify customer about status update (except reverting to PLACED which is disallowed above)
        try {
            if (saved.getCustomerEmail() != null && !saved.getCustomerEmail().isBlank()) {
                String to = saved.getCustomerEmail();
                String customerName = String.format("%s %s",
                        saved.getCustomerFirstName() == null ? "" : saved.getCustomerFirstName(),
                        saved.getCustomerLastName() == null ? "" : saved.getCustomerLastName()).trim();
                java.util.Map<String, Object> params = new java.util.HashMap<>();
                params.put("customer_name", customerName.isBlank() ? "Customer" : customerName);
                params.put("order_id", saved.getOrderNumber());
                params.put("status", saved.getStatus() != null ? saved.getStatus().name() : "UPDATED");
                String subject = "Your order status updated";
                emailService.sendTemplateAsync(EmailTemplateKey.ORDER_STATUS_UPDATE, to, subject, params);
            }
        } catch (Exception ignored) {
            // Never block status updates due to email failures
        }

        return saved;
    }

    @Override
    public void delete(Long id) {
        Order existing = getById(id);
        orderRepository.delete(existing);
    }

    private void validateCreateRequest(CreateOrderRequest r) {
        if (isBlank(r.getCustomerFirstName())) throw new IllegalArgumentException("customerFirstName blank");
        if (isBlank(r.getCustomerLastName())) throw new IllegalArgumentException("customerLastName blank");
        if (isBlank(r.getCustomerEmail())) throw new IllegalArgumentException("customerEmail blank");
        if (r.getItems() == null || r.getItems().isEmpty()) throw new IllegalArgumentException("items empty");
        if (r.getBillingAddress() == null) throw new IllegalArgumentException("billingAddress null");
        if (r.getShippingAddress() == null) throw new IllegalArgumentException("shippingAddress null");
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }

    private String generateOrderNumber() {
        // Format required by product: ORDYYYYMMDDXXXX
        // where XXXX is a zero-padded 4-digit sequence (generated randomly but checked for uniqueness)
        String date = java.time.LocalDate.now().toString().replaceAll("-", "");
        int attempts = 0;
        java.util.Random rnd = RANDOM; // SecureRandom
        String candidate;
        do {
            int seq = rnd.nextInt(10000); // 0..9999
            String seqStr = String.format("%04d", seq);
            candidate = "ORD" + date + seqStr;
            attempts++;
            if (attempts > 50) throw new IllegalStateException("Unable to generate unique order number after many attempts");
        } while (orderRepository.existsByOrderNumber(candidate));
        return candidate;
    }

    private Address toAddressEntity(com.vtcweb.backend.dto.order.AddressDTO dto) {
        if (dto == null) return null;
        return Address.builder()
        .line1(dto.getLine1())
        .line2(dto.getLine2())
        .city(dto.getCity())
        .district(dto.getDistrict())
        .province(dto.getProvince())
        .postalCode(dto.getPostalCode())
        .country(dto.getCountry())
                .build();
    }

    private PaymentInfo toPaymentInfoEntity(com.vtcweb.backend.dto.order.PaymentInfoDTO dto) {
        if (dto == null) return null;
        return PaymentInfo.builder()
                .cardType(dto.getCardType())
                .cardLast4(dto.getCardLast4())
                .cardExpMonth(dto.getCardExpMonth())
                .cardExpYear(dto.getCardExpYear())
                .build();
    }

    private BigDecimal defaultNonNegative(BigDecimal v) {
        if (v == null) return BigDecimal.ZERO;
        if (v.signum() < 0) throw new IllegalArgumentException("Negative monetary value not allowed");
        return v;
    }

    private String determineImageUrl(Product product, ProductVariation variation) {
        // variation image has highest priority
        try {
            if (variation != null && variation.getImageUrl() != null && !variation.getImageUrl().isBlank()) {
                return variation.getImageUrl();
            }
        } catch (Exception ignored) {}

        if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
            // try primary
            for (var img : product.getImages()) {
                try {
                    if (img != null && img.getType() != null && img.getType().name().equals("PRIMARY") && img.getUrl() != null && !img.getUrl().isBlank()) {
                        return img.getUrl();
                    }
                } catch (Exception ignored) {}
            }
            // fallback to any image
            for (var img : product.getImages()) {
                if (img != null && img.getUrl() != null && !img.getUrl().isBlank()) return img.getUrl();
            }
        }
        return null;
    }
}
