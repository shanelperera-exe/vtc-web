package com.vtcweb.backend.dto.order;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentInfoDTO {
    private String cardType;
    private String cardLast4;
    private Integer cardExpMonth;
    private Integer cardExpYear;
}
