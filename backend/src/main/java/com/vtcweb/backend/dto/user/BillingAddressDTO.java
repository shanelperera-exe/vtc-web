package com.vtcweb.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingAddressDTO {
    private Long id;
    private String name;
    private String phone;
    private String company;
    @NotBlank
    private String line1;
    private String line2;
    private String city;
    private String district;
    private String province;
    private String postalCode;
    private String country;
}
