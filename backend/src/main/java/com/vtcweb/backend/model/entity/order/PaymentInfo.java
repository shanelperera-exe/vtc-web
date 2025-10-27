package com.vtcweb.backend.model.entity.order;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentInfo {
    private String cardType; // e.g., VISA, MASTERCARD
    private String cardLast4; // last 4 digits only
    private Integer cardExpMonth; // 1-12
    private Integer cardExpYear; // YYYY
}
