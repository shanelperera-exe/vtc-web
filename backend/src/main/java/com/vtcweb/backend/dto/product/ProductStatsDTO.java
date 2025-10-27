package com.vtcweb.backend.dto.product;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStatsDTO {
    private Long productId;
    private String sku;
    private String name;
    private String primaryImageUrl;

    private long totalUnitsSold;
    private BigDecimal totalRevenue;
    private long orderCount;
    private BigDecimal averagePrice;

    @Builder.Default
    private List<DataPoint> dailySales = java.util.Collections.emptyList(); // last 90 days

    @Builder.Default
    private List<TopVariant> topVariants = java.util.Collections.emptyList();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DataPoint {
        private String date; // YYYY-MM-DD
        private long units;
        private BigDecimal revenue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopVariant {
        private Long variationId;
        private String label; // ex:, "Color=Red | Size=M"
        private long units;
    }
}
