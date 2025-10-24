package com.vtcweb.backend.controller.cart;

import com.vtcweb.backend.dto.cart.CartItemRequestDTO;
import com.vtcweb.backend.dto.cart.CartItemResponseDTO;
import com.vtcweb.backend.dto.cart.CartResponseDTO;
import com.vtcweb.backend.exception.UnauthorizedException;
import com.vtcweb.backend.security.JwtTokenProvider;
import com.vtcweb.backend.service.cart.CartService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@Validated
public class CartController {

	private final CartService cartService;
	private final JwtTokenProvider jwtTokenProvider;

	public CartController(CartService cartService, JwtTokenProvider jwtTokenProvider) {
		this.cartService = cartService;
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
	public ResponseEntity<CartResponseDTO> getCart(HttpServletRequest request) {
		Long userId = resolveUserId(request);
		CartResponseDTO response = cartService.getCart(userId);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/add")
	@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
	public ResponseEntity<CartItemResponseDTO> addItem(@Valid @RequestBody CartItemRequestDTO requestBody,
													   HttpServletRequest request) {
		Long userId = resolveUserId(request);
		CartItemResponseDTO response = cartService.addItem(userId, requestBody);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PutMapping("/item/{id}")
	@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
	public ResponseEntity<CartItemResponseDTO> updateItem(@PathVariable("id") Long cartItemId,
														  @Valid @RequestBody CartItemRequestDTO requestBody,
														  HttpServletRequest request) {
		Long userId = resolveUserId(request);
		CartItemResponseDTO response = cartService.updateItem(userId, cartItemId, requestBody);
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/item/{id}")
	@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
	public ResponseEntity<Void> removeItem(@PathVariable("id") Long cartItemId,
										   HttpServletRequest request) {
		Long userId = resolveUserId(request);
		cartService.removeItem(userId, cartItemId);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/clear")
	@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
	public ResponseEntity<Void> clearCart(HttpServletRequest request) {
		Long userId = resolveUserId(request);
		cartService.clearCart(userId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/merge-local")
	@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
	public ResponseEntity<CartResponseDTO> mergeLocal(@Valid @RequestBody List<CartItemRequestDTO> localItems,
													  HttpServletRequest request) {
		Long userId = resolveUserId(request);
		CartResponseDTO response = cartService.mergeLocalCart(userId, localItems);
		return ResponseEntity.ok(response);
	}

	private Long resolveUserId(HttpServletRequest request) {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
			throw new UnauthorizedException("Missing or invalid Authorization header");
		}
		String token = header.substring(7);
		try {
			Jws<Claims> parsed = jwtTokenProvider.parseAndValidate(token);
			String subject = parsed.getBody().getSubject();
			if (!StringUtils.hasText(subject)) {
				throw new UnauthorizedException("Token subject missing");
			}
			return Long.parseLong(subject);
		} catch (JwtException | NumberFormatException ex) {
			throw new UnauthorizedException("Invalid JWT token");
		}
	}
}
