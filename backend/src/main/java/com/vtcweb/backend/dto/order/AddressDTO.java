package com.vtcweb.backend.dto.order;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDTO {
    @Size(max = 255)
    private String company;
    private String line1;
    private String line2;
    private String city;
    private String district;
    private String province;
    private String postalCode;
    private String country;
}

