package com.vtcweb.backend.service.checkout;

import com.vtcweb.backend.dto.cart.CartResponseDTO;
import com.vtcweb.backend.dto.order.*;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.exception.OutOfStockException;
import com.vtcweb.backend.model.entity.order.*;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.order.OrderRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.product.ProductVariationRepository;
import com.vtcweb.backend.repository.user.UserRepository;
import com.vtcweb.backend.service.cart.CartService;
import com.vtcweb.backend.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vtcweb.backend.service.email.EmailService;
import com.vtcweb.backend.service.email.EmailTemplateKey;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {

    private final CartService cartService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariationRepository variationRepository;
    private final com.vtcweb.backend.service.coupon.CouponService couponService;
    private final EmailService emailService;

    @Value("${app.cart.tax-rate:0.00}")
    private BigDecimal taxRate;

    @Override
    @Transactional
    public CheckoutResponseDTO checkout(Long userId, CheckoutRequestDTO request) {
        if (userId == null)
            throw new IllegalArgumentException("userId required");
        if (request == null)
            throw new IllegalArgumentException("request required");

        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        CartResponseDTO cart = cartService.getCart(userId);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        // Build Order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PLACED);
        // Prefer snapshot values from the request when provided, otherwise fallback to
        // authenticated user
        order.setCustomerFirstName(
                request.getCustomerFirstName() != null ? request.getCustomerFirstName() : user.getFirstName());
        order.setCustomerLastName(
                request.getCustomerLastName() != null ? request.getCustomerLastName() : user.getLastName());
        order.setCustomerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail() : user.getEmail());
        order.setCustomerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : user.getPhone());
        // Link order to authenticated user so customerId is recorded in DB and DTOs
        order.setUser(user);

        order.setBillingAddress(toAddressEntity(request.getBillingAddress()));
        order.setShippingAddress(toAddressEntity(request.getShippingAddress()));
        order.setOrderNotes(request.getOrderNotes());
        order.setDeliveryMethod(request.getDeliveryMethod());
        order.setPaymentMethod(request.getPaymentMethod());
        if (request.getPaymentMethod() == PaymentMethod.CARD) {
            if (request.getPaymentInfo() == null) {
                throw new IllegalArgumentException("paymentInfo required for CARD payments");
            }
            order.setPaymentInfo(toPaymentInfoEntity(request.getPaymentInfo()));
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        // Aggregate cart items by variation to avoid duplicate lines per variant
        java.util.Map<Long, Integer> qtyByVariation = new java.util.LinkedHashMap<>();
        for (var ci : cart.getItems()) {
            Long variationId = ci.getProductVariationId();
            int qty = ci.getQuantity();
            if (variationId == null || qty <= 0)
                continue;
            qtyByVariation.merge(variationId, qty,
                    (a, b) -> Integer.valueOf((a == null ? 0 : a) + (b == null ? 0 : b)));
        }

        for (var entry : qtyByVariation.entrySet()) {
            Long variationId = entry.getKey();
            int qty = entry.getValue();

            // Lock variation for stock check/decrement
            ProductVariation variation = variationRepository.findWithLockingById(variationId)
                    .orElseThrow(() -> new NotFoundException("Product variation not found: " + variationId));
            Product product = variation.getProduct();
            if (product == null) {
                Long pid = (variation.getProduct() != null) ? variation.getProduct().getId() : null;
                if (pid != null) {
                    product = productRepository.findById(pid).orElse(null);
                }
            }

            int available = variation.getStock() == null ? 0 : variation.getStock();
            if (qty > available) {
                throw new OutOfStockException("Item out of stock: variation=" + variationId + ", requested=" + qty
                        + ", available=" + available);
            }

            BigDecimal unit = variation.getPrice();
            if (unit == null && product != null)
                unit = product.getBasePrice();
            if (unit == null)
                unit = BigDecimal.ZERO;
            unit = unit.setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineTotal);

            // choose best image URL: variation image > product primary > any
            String imageUrl = null;
            if (variation.getImageUrl() != null && !variation.getImageUrl().isBlank()) {
                imageUrl = variation.getImageUrl();
            } else if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
                for (var img : product.getImages()) {
                    try {
                        if (img != null && img.getType() != null && img.getType().name().equals("PRIMARY")
                                && img.getUrl() != null && !img.getUrl().isBlank()) {
                            imageUrl = img.getUrl();
                            break;
                        }
                    } catch (Exception ignored) {
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

            OrderItem oi = OrderItem.builder()
                    .productId(product != null ? product.getId() : null)
                    .productName(product != null ? product.getName() : null)
                    .categoryId(product != null && product.getCategory() != null ? product.getCategory().getId() : null)
                    .categoryName(
                            product != null && product.getCategory() != null ? product.getCategory().getName() : null)
                    .variationId(variation.getId())
                    .quantity(qty)
                    .unitPrice(unit)
                    .totalPrice(lineTotal)
                    .imageUrl(imageUrl)
                    .variationAttributes(new java.util.HashMap<>(variation.getAttributes()))
                    .build();
            order.addItem(oi);

            // decrement stock once with aggregated quantity
            variation.setStock(available - qty);
        }

        // Allow optional overrides from the request for discount and shipping fee
        BigDecimal discount = request.getDiscountTotal() != null ? request.getDiscountTotal() : BigDecimal.ZERO;

        // If couponCode provided and no explicit discountTotal override, evaluate
        // coupon
        if ((discount == null || BigDecimal.ZERO.compareTo(discount) == 0) && request.getCouponCode() != null
                && !request.getCouponCode().trim().isEmpty()) {
            try {
                com.vtcweb.backend.dto.coupon.CouponApplyRequestDTO creq = new com.vtcweb.backend.dto.coupon.CouponApplyRequestDTO();
                creq.setCode(request.getCouponCode());
                creq.setSubtotal(subtotal);
                com.vtcweb.backend.dto.coupon.CouponApplyResponseDTO cresp = couponService.applyCoupon(creq);
                if (cresp != null && cresp.isValid()) {
                    discount = cresp.getDiscountAmount() != null ? cresp.getDiscountAmount() : BigDecimal.ZERO;
                }
            } catch (Exception ex) {
                // swallow coupon evaluation errors and proceed without discount
                discount = BigDecimal.ZERO;
            }
        }
        BigDecimal tax = (subtotal.compareTo(BigDecimal.ZERO) > 0
                ? subtotal.multiply((taxRate != null ? taxRate : BigDecimal.ZERO))
                : BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = request.getShippingFee() != null ? request.getShippingFee() : calculateShipping(subtotal);
        BigDecimal total = subtotal.subtract(discount).add(tax).add(shipping);

        order.setSubtotal(subtotal);
        order.setDiscountTotal(discount);
        order.setTaxTotal(tax);
        order.setShippingFee(shipping);
        order.setTotal(total);

        Order saved = orderRepository.save(order);

        // Clear cart after successful order creation
        cartService.clearCart(userId);

        // Trigger order confirmation email (fire-and-forget)
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
                java.util.List<java.util.Map<String, Object>> items = new java.util.ArrayList<>();
                if (saved.getItems() != null) {
                    for (OrderItem it : saved.getItems()) {
                        if (it == null)
                            continue;
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
            // Do not block checkout if email fails
        }

        // Build response DTO
        return CheckoutResponseDTO.builder()
                .orderId(saved.getId())
                .orderNumber(saved.getOrderNumber())
                .status(saved.getStatus())
                .placedAt(saved.getPlacedAt())
                .subtotal(saved.getSubtotal())
                .discountTotal(saved.getDiscountTotal())
                .taxTotal(saved.getTaxTotal())
                .shippingFee(saved.getShippingFee())
                .total(saved.getTotal())
                .items(saved.getItems() == null ? List.of()
                        : saved.getItems().stream().map(Mapper::toOrderItemDto).toList())
                .build();
    }

    private Address toAddressEntity(AddressDTO dto) {
        if (dto == null)
            return null;
        return Address.builder()
                .company(dto.getCompany())
                .line1(dto.getLine1())
                .line2(dto.getLine2())
                .city(dto.getCity())
                .district(dto.getDistrict())
                .province(dto.getProvince())
                .postalCode(dto.getPostalCode())
                .country(dto.getCountry())
                .build();
    }

    private PaymentInfo toPaymentInfoEntity(PaymentInfoDTO dto) {
        if (dto == null)
            return null;
        return PaymentInfo.builder()
                .cardType(dto.getCardType())
                .cardLast4(dto.getCardLast4())
                .cardExpMonth(dto.getCardExpMonth())
                .cardExpYear(dto.getCardExpYear())
                .build();
    }

    private BigDecimal calculateShipping(BigDecimal subtotal) {
        if (subtotal == null)
            return BigDecimal.ZERO;
        // Simple flat rule aligning with frontend Summary: free over 10,000, else 750
        return subtotal.compareTo(BigDecimal.valueOf(10000)) >= 0 || subtotal.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(750);
    }

    private String generateOrderNumber() {
        // Generate order number in format ORDYYYYMMDDXXXX similar to OrderServiceImpl
        String date = java.time.LocalDate.now().toString().replaceAll("-", "");
        java.util.Random rnd = new java.security.SecureRandom();
        int attempts = 0;
        String candidate;
        do {
            int seq = rnd.nextInt(10000);
            String seqStr = String.format("%04d", seq);
            candidate = "ORD" + date + seqStr;
            attempts++;
            if (attempts > 50)
                throw new IllegalStateException("Unable to generate unique order number");
        } while (orderRepository.existsByOrderNumber(candidate));
        return candidate;
    }
}
