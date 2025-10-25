package com.vtcweb.backend.dto.user;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingViewDTO {
    private java.util.List<String> address;
}
