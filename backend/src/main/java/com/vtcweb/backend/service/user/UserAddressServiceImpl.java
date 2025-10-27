package com.vtcweb.backend.service.user;

import com.vtcweb.backend.dto.user.BillingAddressDTO;
import com.vtcweb.backend.dto.user.ShippingAddressDTO;
import com.vtcweb.backend.model.entity.user.BillingAddress;
import com.vtcweb.backend.model.entity.user.ShippingAddress;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.user.BillingAddressRepository;
import com.vtcweb.backend.repository.user.ShippingAddressRepository;
import com.vtcweb.backend.repository.user.UserRepository;
import com.vtcweb.backend.exception.NotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserAddressServiceImpl implements UserAddressService {
    private final BillingAddressRepository billingRepo;
    private final ShippingAddressRepository shippingRepo;
    private final UserRepository userRepository;

    public UserAddressServiceImpl(BillingAddressRepository billingRepo, ShippingAddressRepository shippingRepo,
            UserRepository userRepository) {
        this.billingRepo = billingRepo;
        this.shippingRepo = shippingRepo;
        this.userRepository = userRepository;
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null)
            throw new NotFoundException("User not authenticated");
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private BillingAddressDTO toDto(BillingAddress e) {
        if (e == null)
            return null;
        return BillingAddressDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .phone(e.getPhone())
                .company(e.getCompany())
                .line1(e.getLine1())
                .line2(e.getLine2())
                .city(e.getCity())
                .district(e.getDistrict())
                .province(e.getProvince())
                .postalCode(e.getPostalCode())
                .country(e.getCountry())
                .build();
    }

    private BillingAddress toEntity(BillingAddressDTO d) {
        if (d == null)
            return null;
        return BillingAddress.builder()
                .id(d.getId())
                .name(d.getName())
                .phone(d.getPhone())
                .company(d.getCompany())
                .line1(d.getLine1())
                .line2(d.getLine2())
                .city(d.getCity())
                .district(d.getDistrict())
                .province(d.getProvince())
                .postalCode(d.getPostalCode())
                .country(d.getCountry())
                .build();
    }

    private ShippingAddressDTO toDto(ShippingAddress e) {
        if (e == null)
            return null;
        return ShippingAddressDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .phone(e.getPhone())
                .company(e.getCompany())
                .line1(e.getLine1())
                .line2(e.getLine2())
                .city(e.getCity())
                .district(e.getDistrict())
                .province(e.getProvince())
                .postalCode(e.getPostalCode())
                .country(e.getCountry())
                .build();
    }

    private ShippingAddress toEntity(ShippingAddressDTO d) {
        if (d == null)
            return null;
        return ShippingAddress.builder()
                .id(d.getId())
                .name(d.getName())
                .phone(d.getPhone())
                .company(d.getCompany())
                .line1(d.getLine1())
                .line2(d.getLine2())
                .city(d.getCity())
                .district(d.getDistrict())
                .province(d.getProvince())
                .postalCode(d.getPostalCode())
                .country(d.getCountry())
                .build();
    }

    @Override
    public List<BillingAddressDTO> listBilling() {
        User u = currentUser();
        return billingRepo.findByUser(u).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<ShippingAddressDTO> listShipping() {
        User u = currentUser();
        return shippingRepo.findByUser(u).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillingAddressDTO> listBillingForUser(Long userId) {
        if (userId == null)
            throw new IllegalArgumentException("userId required");
        User u = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        return billingRepo.findByUser(u).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShippingAddressDTO> listShippingForUser(Long userId) {
        if (userId == null)
            throw new IllegalArgumentException("userId required");
        User u = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        return shippingRepo.findByUser(u).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public BillingAddressDTO createBilling(BillingAddressDTO dto) {
        User u = currentUser();
        BillingAddress e = toEntity(dto);
        e.setUser(u);
        BillingAddress saved = billingRepo.save(e);
        return toDto(saved);
    }

    @Override
    public ShippingAddressDTO createShipping(ShippingAddressDTO dto) {
        User u = currentUser();
        ShippingAddress e = toEntity(dto);
        e.setUser(u);
        ShippingAddress saved = shippingRepo.save(e);
        return toDto(saved);
    }

    @Override
    public BillingAddressDTO updateBilling(Long id, BillingAddressDTO dto) {
        User u = currentUser();
        BillingAddress e = billingRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Billing address not found"));
        if (!e.getUser().getId().equals(u.getId()))
            throw new NotFoundException("Billing address not found");
        e.setName(dto.getName());
        e.setPhone(dto.getPhone());
        e.setCompany(dto.getCompany());
        e.setLine1(dto.getLine1());
        e.setLine2(dto.getLine2());
        e.setCity(dto.getCity());
        e.setDistrict(dto.getDistrict());
        e.setProvince(dto.getProvince());
        e.setPostalCode(dto.getPostalCode());
        e.setCountry(dto.getCountry());
        BillingAddress saved = billingRepo.save(e);
        return toDto(saved);
    }

    @Override
    public ShippingAddressDTO updateShipping(Long id, ShippingAddressDTO dto) {
        User u = currentUser();
        ShippingAddress e = shippingRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipping address not found"));
        if (!e.getUser().getId().equals(u.getId()))
            throw new NotFoundException("Shipping address not found");
        e.setName(dto.getName());
        e.setPhone(dto.getPhone());
        e.setCompany(dto.getCompany());
        e.setLine1(dto.getLine1());
        e.setLine2(dto.getLine2());
        e.setCity(dto.getCity());
        e.setDistrict(dto.getDistrict());
        e.setProvince(dto.getProvince());
        e.setPostalCode(dto.getPostalCode());
        e.setCountry(dto.getCountry());
        ShippingAddress saved = shippingRepo.save(e);
        return toDto(saved);
    }

    @Override
    public void deleteBilling(Long id) {
        User u = currentUser();
        BillingAddress e = billingRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Billing address not found"));
        if (!e.getUser().getId().equals(u.getId()))
            throw new NotFoundException("Billing address not found");
        billingRepo.delete(e);
    }

    @Override
    public void deleteShipping(Long id) {
        User u = currentUser();
        ShippingAddress e = shippingRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipping address not found"));
        if (!e.getUser().getId().equals(u.getId()))
            throw new NotFoundException("Shipping address not found");
        shippingRepo.delete(e);
    }
}
