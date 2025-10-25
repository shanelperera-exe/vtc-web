package com.vtcweb.backend.service.user;

import com.vtcweb.backend.dto.user.BillingAddressDTO;
import com.vtcweb.backend.dto.user.ShippingAddressDTO;

import java.util.List;

public interface UserAddressService {
    List<BillingAddressDTO> listBilling();
    List<ShippingAddressDTO> listShipping();
    // Admin/Manager: list addresses for a specific user
    List<BillingAddressDTO> listBillingForUser(Long userId);
    List<ShippingAddressDTO> listShippingForUser(Long userId);
    BillingAddressDTO createBilling(BillingAddressDTO dto);
    ShippingAddressDTO createShipping(ShippingAddressDTO dto);
    BillingAddressDTO updateBilling(Long id, BillingAddressDTO dto);
    ShippingAddressDTO updateShipping(Long id, ShippingAddressDTO dto);
    void deleteBilling(Long id);
    void deleteShipping(Long id);
}
