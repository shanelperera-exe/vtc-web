package com.vtcweb.backend.dto.admin;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Sales analytics payload for the admin Sales tab.
 *
 * Notes on “profit/margin”:
 * This codebase does not currently store COGS (cost-of-goods). Any profit/margin values returned
 * are proxies computed from available sales fields (net sales, discounts) so the UI can still
 * surface actionable insights without inventing mock numbers.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSalesAnalyticsDTO {

    @Builder.Default
    private String currency = "LKR";

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDate prevStartDate;
    private LocalDate prevEndDate;

    private KpiBlock kpis;

    @Builder.Default
    private List<DailyPoint> daily = java.util.Collections.emptyList();

    /** Previous equal-length period series to support compare views in the UI. */
    @Builder.Default
    private List<DailyPoint> previousDaily = java.util.Collections.emptyList();

    @Builder.Default
    private List<ProductPerformance> topProducts = java.util.Collections.emptyList();

    @Builder.Default
    private List<ProductPerformance> worstProducts = java.util.Collections.emptyList();

    @Builder.Default
    private List<CategoryContribution> categories = java.util.Collections.emptyList();

    @Builder.Default
    private List<ProductContribution> productContributions = java.util.Collections.emptyList();

    private InventoryBlock inventory;

    private CustomerBlock customers;

    private PaymentsBlock payments;

    private StaffStoreBlock staffStore;

    @Builder.Default
    private List<String> insights = java.util.Collections.emptyList();

    // -------------------- Blocks --------------------

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Metric {
        private BigDecimal value;
        private Double changePct;
        private String trend; // up|down|flat
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricLong {
        private Long value;
        private Double changePct;
        private String trend; // up|down|flat
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricDouble {
        private Double value;
        private Double changePct;
        private String trend; // up|down|flat
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpiBlock {
        private Metric totalSalesRevenue;
        private Metric netSales;
        private MetricLong ordersCount;
        private Metric averageOrderValue;
        private MetricLong unitsSold;

        /** Proxy computed from available fields (no COGS). */
        private Metric grossProfit;

        /** Proxy computed from available fields (no COGS). */
        private MetricDouble grossMarginPct;

        private Metric discountGiven;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyPoint {
        /** YYYY-MM-DD */
        private String date;

        private BigDecimal revenue;
        private Long orders;
        private BigDecimal aov;

        private BigDecimal discounts;

        /** DeliveryMethod=STANDARD_DELIVERY */
        private BigDecimal onlineRevenue;

        /** DeliveryMethod=IN_STORE_PICKUP */
        private BigDecimal posRevenue;

        /** Cancelled total (proxy for refunds). UI can show as negative. */
        private BigDecimal cancelled;

        private Long units;

        /** Useful for target line in UI. */
        private BigDecimal targetRevenue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductPerformance {
        private Long productId;
        private String sku;
        private String productName;
        private Long categoryId;
        private String categoryName;
        private String imageUrl;

        private BigDecimal revenue;
        private Long units;

        /** Proxy for realized price vs list price: revenue / (basePrice * units). */
        private Double realizedRate;

        /** 0-100 (proxy): (1 - realizedRate) * 100. */
        private Double discountProxyPct;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductContribution {
        private Long productId;
        private String productName;
        private Long categoryId;
        private String categoryName;
        private BigDecimal revenue;
        private Long units;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryContribution {
        private Long categoryId;
        private String categoryName;
        private BigDecimal revenue;
        private Long units;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryBlock {
        @Builder.Default
        private List<InventoryItem> stockLevels = java.util.Collections.emptyList();

        @Builder.Default
        private List<InventoryDelta> overUnderStock = java.util.Collections.emptyList();

        @Builder.Default
        private List<InventoryTurnoverPoint> turnover = java.util.Collections.emptyList();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryItem {
        private Long productId;
        private String sku;
        private String productName;
        private String categoryName;
        private Long stock;
        private Long unitsSold;
        private Double daysCover;
        private String stockHealth; // low|slow|healthy
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryDelta {
        private Long productId;
        private String productName;
        /** Positive = overstock, negative = understock. */
        private Double deltaUnits;
        private String status; // over|under|ok
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryTurnoverPoint {
        private String date;
        /** Proxy velocity index based on units sold per day (no historical stock). */
        private Long unitsSold;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerBlock {
        private Long totalCustomers;
        private Long newCustomers;
        private Long returningCustomers;

        @Builder.Default
        private List<CustomerGrowthPoint> growth = java.util.Collections.emptyList();

        @Builder.Default
        private List<RadarMetric> behaviorRadar = java.util.Collections.emptyList();

        @Builder.Default
        private List<CustomerScatterPoint> valueVsFrequency = java.util.Collections.emptyList();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerGrowthPoint {
        private String date;
        private Long newCustomers;
        private Long activeCustomers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RadarMetric {
        private String metric;
        /** 0-100 scaled */
        private Double value;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerScatterPoint {
        private String customer;
        private Long orders;
        private BigDecimal totalSpend;
        private BigDecimal avgOrder;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentsBlock {
        @Builder.Default
        private List<PaymentSplit> paymentMethods = java.util.Collections.emptyList();

        @Builder.Default
        private List<DiscountSplit> discountedVsFullPrice = java.util.Collections.emptyList();

        @Builder.Default
        private List<ReturnPoint> returns = java.util.Collections.emptyList();

        @Builder.Default
        private List<DiscountImpactPoint> discountImpact = java.util.Collections.emptyList();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentSplit {
        private String method;
        private Long orders;
        private BigDecimal revenue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiscountSplit {
        private String bucket; // discounted|full_price
        private Long orders;
        private BigDecimal revenue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReturnPoint {
        private String date;
        /** Negative value on purpose for line charts. */
        private BigDecimal refunds;
        private Long cancelledOrders;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiscountImpactPoint {
        private String date;
        private BigDecimal discounts;
        /** Proxy margin (0-100) derived from discount intensity. */
        private Double marginProxyPct;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StaffStoreBlock {
        @Builder.Default
        private List<ChannelPoint> salesByChannel = java.util.Collections.emptyList();

        @Builder.Default
        private List<HourPoint> peakTimes = java.util.Collections.emptyList();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChannelPoint {
        private String channel;
        private BigDecimal revenue;
        private Long orders;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HourPoint {
        private Integer hour;
        private BigDecimal revenue;
        private Long orders;
    }
}
