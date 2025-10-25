package com.vtcweb.backend.model.entity.order;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    private String company;
    private String line1;
    private String line2;
    private String city;
    private String district;
    private String province;
    private String postalCode;
    private String country;
}

