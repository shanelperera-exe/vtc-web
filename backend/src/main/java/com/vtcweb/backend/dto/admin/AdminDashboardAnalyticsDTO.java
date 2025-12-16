package com.vtcweb.backend.dto.admin;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardAnalyticsDTO {

    /** ISO 4217 currency code. */
    @Builder.Default
    private String currency = "LKR";

    /** Server-side reference date (local). */
    private LocalDate asOfDate;

    private MetricCard grossRevenue30d;
    private MetricCard averageOrderValue30d;
    private MetricCard revenueTrailingYear;

    /** Revenue time series for the chart (default: last 7 days). */
    @Builder.Default
    private List<DailyRevenuePoint> revenueLast7Days = java.util.Collections.emptyList();

    /** Growth number used for the gradient growth card (default: last 30 days vs previous 30 days). */
    private GrowthMetric revenueGrowth30d;

    /** Trending product insight (top revenue product for the last 30 days). */
    private TrendingProduct trendingProduct30d;

    /** Category performance for last 30 days (default: top categories by units sold). */
    @Builder.Default
    private List<CategoryPerformance> categoryPerformance30d = java.util.Collections.emptyList();

    /** Order counts by status within the last 30 days (helps drive other widgets later). */
    @Builder.Default
    private Map<String, Long> orderStatusCounts30d = java.util.Collections.emptyMap();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricCard {
        private String title;
        private BigDecimal value;
        private String periodLabel;

        /** Percent change vs previous equal-length period. */
        private Double changePct;

        /** Convenience trend label: up|down|flat (computed server-side). */
        private String trend;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GrowthMetric {
        private String label;
        private Double changePct;
        private String trend;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyRevenuePoint {
        /** YYYY-MM-DD */
        private String date;
        private BigDecimal revenue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendingProduct {
        private Long productId;
        private String sku;
        private String productName;
        private String categoryName;
        private String imageUrl;

        /** Revenue in the current window. */
        private BigDecimal revenue;

        /** Month-over-month growth: current window vs previous equal window. */
        private Double growthMoMPct;

        /** Year-over-year growth: current window vs same window one year ago. */
        private Double growthYoYPct;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryPerformance {
        private Long categoryId;
        private String categoryName;

        /** Units sold in current window. */
        private Long unitsSold;

        /** Percent change vs previous equal window. */
        private Double growthPct;

        /** Convenience trend label: up|down|flat (computed server-side). */
        private String trend;
    }
}
