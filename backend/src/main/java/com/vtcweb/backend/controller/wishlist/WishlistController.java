package com.vtcweb.backend.controller.wishlist;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.vtcweb.backend.dto.wishlist.WishlistItemDTO;
import com.vtcweb.backend.dto.wishlist.WishlistResponseDTO;
import com.vtcweb.backend.exception.UnauthorizedException;
import com.vtcweb.backend.security.JwtTokenProvider;
import com.vtcweb.backend.service.wishlist.WishlistService;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@Validated
public class WishlistController {

    private final WishlistService wishlistService;
    private final JwtTokenProvider jwtTokenProvider;

    public WishlistController(WishlistService wishlistService, JwtTokenProvider jwtTokenProvider) {
        this.wishlistService = wishlistService;
        this.jwtTokenProvider = jwtTokenProvider;
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
            if (!StringUtils.hasText(subject)) throw new UnauthorizedException("Token subject missing");
            return Long.parseLong(subject);
        } catch (JwtException | NumberFormatException ex) {
            throw new UnauthorizedException("Invalid JWT token");
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
    public ResponseEntity<WishlistResponseDTO> getWishlist(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        WishlistResponseDTO resp = wishlistService.getWishlist(userId);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/add/{productId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
    public ResponseEntity<WishlistItemDTO> add(@PathVariable("productId") Long productId,
                                               HttpServletRequest request) {
        Long userId = resolveUserId(request);
        WishlistItemDTO item = wishlistService.addProduct(userId, productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @DeleteMapping("/remove/{productId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
    public ResponseEntity<Void> remove(@PathVariable("productId") Long productId,
                                       HttpServletRequest request) {
        Long userId = resolveUserId(request);
        wishlistService.removeProduct(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
    public ResponseEntity<Void> clear(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        wishlistService.clear(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/merge-local")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
    public ResponseEntity<WishlistResponseDTO> mergeLocal(@RequestBody List<Long> productIds,
                                                          HttpServletRequest request) {
        Long userId = resolveUserId(request);
        WishlistResponseDTO resp = wishlistService.mergeLocal(userId, productIds);
        return ResponseEntity.ok(resp);
    }
}
