package com.vtcweb.backend.service.cart;

import com.vtcweb.backend.dto.cart.CartItemRequestDTO;
import com.vtcweb.backend.dto.cart.CartItemResponseDTO;
import com.vtcweb.backend.dto.cart.CartMergeFailureDTO;
import com.vtcweb.backend.dto.cart.CartResponseDTO;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.exception.OutOfStockException;
import com.vtcweb.backend.model.entity.cart.Cart;
import com.vtcweb.backend.model.entity.cart.CartItem;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.cart.CartItemRepository;
import com.vtcweb.backend.repository.cart.CartRepository;
import com.vtcweb.backend.repository.product.ProductVariationRepository;
import com.vtcweb.backend.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

	private static final String CART_CACHE = "cart";
	private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

	private final CartRepository cartRepository;
	private final CartItemRepository cartItemRepository;
	private final ProductVariationRepository productVariationRepository;
	private final UserRepository userRepository;

	@Value("${app.cart.tax-rate:0.00}")
	private BigDecimal taxRate;

	@Override
	@Transactional(readOnly = true)
	@Cacheable(value = CART_CACHE, key = "#userId")
	public CartResponseDTO getCart(Long userId) {
		Cart cart = cartRepository.findByUser_Id(userId).orElse(null);
		return buildCartResponse(cart, List.of());
	}

	@Override
	@Transactional
	@CacheEvict(value = CART_CACHE, key = "#userId")
	public CartItemResponseDTO addItem(Long userId, CartItemRequestDTO request) {
		Cart cart = loadOrCreateCart(userId);
		ProductVariation variation = fetchVariation(request.getProductVariationId());

		int quantityToAdd = request.getQuantity();
		ensurePositiveQuantity(quantityToAdd);

		CartItem item = findItemByVariation(cart, variation.getId()).orElse(null);
		int existingQty = item != null && item.getQuantity() != null ? item.getQuantity() : 0;
		int desiredQty = existingQty + quantityToAdd;
		ensureStockAvailable(variation, desiredQty);

		if (item == null) {
			item = CartItem.builder()
					.cart(cart)
					.productVariation(variation)
					.quantity(desiredQty)
					.build();
			cart.getItems().add(item);
		} else {
			item.setQuantity(desiredQty);
		}

		cartRepository.save(cart);
		return toCartItemResponse(item);
	}

	@Override
	@Transactional
	@CacheEvict(value = CART_CACHE, key = "#userId")
	public CartItemResponseDTO updateItem(Long userId, Long cartItemId, CartItemRequestDTO request) {
		CartItem item = findItemForUser(userId, cartItemId);
		int requestedQty = request.getQuantity();
		ensurePositiveQuantity(requestedQty);

		ProductVariation variation = item.getProductVariation();
		ensureStockAvailable(variation, requestedQty);

		item.setQuantity(requestedQty);
		cartItemRepository.save(item);
		return toCartItemResponse(item);
	}

	@Override
	@Transactional
	@CacheEvict(value = CART_CACHE, key = "#userId")
	public void removeItem(Long userId, Long cartItemId) {
		CartItem item = findItemForUser(userId, cartItemId);
		Cart cart = item.getCart();
		if (cart != null) {
			cart.getItems().remove(item);
		}
		cartItemRepository.delete(item);
	}

	@Override
	@Transactional
	@CacheEvict(value = CART_CACHE, key = "#userId")
	public void clearCart(Long userId) {
		Cart cart = cartRepository.findByUser_Id(userId).orElse(null);
		if (cart == null) {
			return;
		}
		Set<CartItem> items = cart.getItems();
		if (items == null || items.isEmpty()) {
			return;
		}
		items.clear();
		cartRepository.save(cart);
	}

	@Override
	@Transactional
	@CacheEvict(value = CART_CACHE, key = "#userId")
	public CartResponseDTO mergeLocalCart(Long userId, List<CartItemRequestDTO> localItems) {
		Cart cart = loadOrCreateCart(userId);
		if (localItems == null || localItems.isEmpty()) {
			return buildCartResponse(cart, List.of());
		}

		List<CartMergeFailureDTO> failures = new ArrayList<>();
		for (CartItemRequestDTO request : localItems) {
			if (request == null) {
				continue;
			}
			try {
				ensurePositiveQuantity(request.getQuantity());
				ProductVariation variation = fetchVariation(request.getProductVariationId());
				CartItem item = findItemByVariation(cart, variation.getId()).orElse(null);
				int existingQty = item != null && item.getQuantity() != null ? item.getQuantity() : 0;
				int desiredQty = existingQty + request.getQuantity();
				ensureStockAvailable(variation, desiredQty);

				if (item == null) {
					item = CartItem.builder()
							.cart(cart)
							.productVariation(variation)
							.quantity(desiredQty)
							.build();
					cart.getItems().add(item);
				} else {
					item.setQuantity(desiredQty);
				}
			} catch (NotFoundException | OutOfStockException | IllegalArgumentException ex) {
				failures.add(CartMergeFailureDTO.builder()
						.productVariationId(request.getProductVariationId())
						.requestedQuantity(request.getQuantity())
						.reason(ex.getMessage())
						.build());
			}
		}

		cartRepository.save(cart);
		return buildCartResponse(cart, failures);
	}

	private Cart loadOrCreateCart(Long userId) {
		return cartRepository.findByUser_Id(userId)
				.orElseGet(() -> {
					User user = userRepository.findById(userId)
							.orElseThrow(() -> new NotFoundException("User not found for id=" + userId));
					Cart cart = Cart.builder()
							.user(user)
							.items(new HashSet<>())
							.build();
					return cartRepository.save(cart);
				});
	}

	private CartItem findItemForUser(Long userId, Long cartItemId) {
		CartItem item = cartItemRepository.findById(cartItemId)
				.orElseThrow(() -> new NotFoundException("Cart item not found"));
		if (item.getCart() == null || item.getCart().getUser() == null
				|| !Objects.equals(item.getCart().getUser().getId(), userId)) {
			throw new NotFoundException("Cart item not found for user");
		}
		return item;
	}

	private Optional<CartItem> findItemByVariation(Cart cart, Long variationId) {
		if (cart == null || cart.getItems() == null) {
			return Optional.empty();
		}
		return cart.getItems().stream()
				.filter(ci -> ci.getProductVariation() != null
						&& Objects.equals(ci.getProductVariation().getId(), variationId))
				.findFirst();
	}

	private ProductVariation fetchVariation(Long variationId) {
		return productVariationRepository.findById(variationId)
				.orElseThrow(() -> new NotFoundException("Product variation not found for id=" + variationId));
	}

	private void ensureStockAvailable(ProductVariation variation, int desiredQuantity) {
		Integer stock = variation.getStock();
		int available = stock != null ? stock : 0;
		if (desiredQuantity > available) {
			throw new OutOfStockException(
					"Requested quantity " + desiredQuantity + " exceeds available stock " + available);
		}
	}

	private void ensurePositiveQuantity(Integer quantity) {
		if (quantity == null || quantity <= 0) {
			throw new IllegalArgumentException("Quantity must be greater than zero");
		}
	}

	private CartResponseDTO buildCartResponse(Cart cart, List<CartMergeFailureDTO> failures) {
		List<CartItemResponseDTO> itemDtos;
		if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
			itemDtos = List.of();
		} else {
			itemDtos = cart.getItems().stream()
					.map(this::toCartItemResponse)
					.sorted(Comparator.comparing(CartItemResponseDTO::getId, Comparator.nullsLast(Long::compareTo)))
					.toList();
		}

		BigDecimal subtotal = itemDtos.stream()
				.map(CartItemResponseDTO::getItemTotal)
				.reduce(BigDecimal.ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);

		BigDecimal tax = calculateTax(subtotal);
		BigDecimal total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

		List<CartMergeFailureDTO> immutableFailures = failures == null || failures.isEmpty()
				? List.of()
				: List.copyOf(failures);

		return CartResponseDTO.builder()
				.items(itemDtos)
				.subtotal(subtotal)
				.tax(tax)
				.total(total)
				.mergeFailures(immutableFailures)
				.build();
	}

	private BigDecimal calculateTax(BigDecimal subtotal) {
		if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
			return ZERO;
		}
		BigDecimal effectiveTaxRate = taxRate != null ? taxRate : BigDecimal.ZERO;
		return subtotal.multiply(effectiveTaxRate)
				.setScale(2, RoundingMode.HALF_UP);
	}

	private CartItemResponseDTO toCartItemResponse(CartItem cartItem) {
		ProductVariation variation = cartItem.getProductVariation();
		if (variation == null) {
			throw new IllegalStateException("Cart item missing product variation");
		}
		int quantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
		Product product = variation.getProduct();

		BigDecimal unitPrice = variation.getPrice();
		if (unitPrice == null && product != null) {
			unitPrice = product.getBasePrice();
		}
		if (unitPrice == null) {
			unitPrice = BigDecimal.ZERO;
		}
		unitPrice = unitPrice.setScale(2, RoundingMode.HALF_UP);
		BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);

		java.util.Map<String, String> detachedAttrs = null;
		if (variation.getAttributes() != null && !variation.getAttributes().isEmpty()) {
			detachedAttrs = new java.util.HashMap<>(variation.getAttributes());
		}

		// Determine best image URL: variation image > product primary image > any
		// product image > null
		String imageUrl = null;
		if (variation.getImageUrl() != null && !variation.getImageUrl().isBlank()) {
			imageUrl = variation.getImageUrl();
		} else if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
			// try to find primary image
			for (var img : product.getImages()) {
				try {
					if (img != null && img.getType() != null && img.getType().name().equals("PRIMARY")
							&& img.getUrl() != null && !img.getUrl().isBlank()) {
						imageUrl = img.getUrl();
						break;
					}
				} catch (Exception ex) {
					/* ignore image access errors */ }
			}
			if (imageUrl == null) {
				// no primary found, pick any
				for (var img : product.getImages()) {
					if (img != null && img.getUrl() != null && !img.getUrl().isBlank()) {
						imageUrl = img.getUrl();
						break;
					}
				}
			}
		}

		return CartItemResponseDTO.builder()
				.id(cartItem.getId())
				.productVariationId(variation.getId())
				.productName(product != null ? product.getName() : null)
				.variationKey(variation.getVariationKey())
				.imageUrl(imageUrl)
				.attributes(detachedAttrs)
				.price(unitPrice)
				.quantity(quantity)
				.availableStock(variation.getStock() != null ? variation.getStock() : 0)
				.itemTotal(itemTotal)
				.build();
	}
}
