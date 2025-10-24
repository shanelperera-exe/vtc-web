package com.vtcweb.backend.controller.order;

import com.vtcweb.backend.dto.order.CheckoutRequestDTO;
import com.vtcweb.backend.dto.order.CheckoutResponseDTO;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.user.UserRepository;
import com.vtcweb.backend.service.checkout.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
    public ResponseEntity<CheckoutResponseDTO> checkout(@Valid @RequestBody CheckoutRequestDTO request,
                                                        @AuthenticationPrincipal Object principal) {
        // Resolve current user from Spring Security Authentication (username = email per JwtAuthenticationFilter)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        if (email == null || email.isBlank()) throw new NotFoundException("Authenticated user not found");
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new NotFoundException("User not found"));
        CheckoutResponseDTO resp = checkoutService.checkout(user.getId(), request);
        return ResponseEntity.ok(resp);
    }
}
