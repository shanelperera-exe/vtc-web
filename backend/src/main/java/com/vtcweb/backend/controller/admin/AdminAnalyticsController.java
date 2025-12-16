package com.vtcweb.backend.controller.admin;

import com.vtcweb.backend.dto.admin.AdminDashboardAnalyticsDTO;
import com.vtcweb.backend.model.entity.order.Order;
import com.vtcweb.backend.repository.order.OrderItemRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    /**
     * Dashboard analytics for the admin UI.
     *
     * Defaults:
     * - Stat cards: last 30 days revenue + AOV, trailing 365 days revenue
     * - Chart: last 7 days revenue
     * - Growth card: last 30 days vs previous 30 days revenue
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardAnalyticsDTO> dashboard(
            @RequestParam(name = "currency", required = false, defaultValue = "LKR") String currency,
            @RequestParam(name = "chartDays", required = false, defaultValue = "7") int chartDays,
            @RequestParam(name = "windowDays", required = false, defaultValue = "30") int windowDays) {

        int chartWindow = Math.max(1, Math.min(365, chartDays));
        int window = Math.max(1, Math.min(365, windowDays));

        LocalDate today = LocalDate.now();

        // --- 30d window ---
        LocalDate winStartDate = today.minusDays(window - 1);
        LocalDateTime winStart = winStartDate.atStartOfDay();
        LocalDateTime winEndExclusive = today.plusDays(1).atStartOfDay();

        BigDecimal revenue = nz(orderRepository.sumSalesTotalBetween(winStart, winEndExclusive));
        long orderCount = orderRepository.countSalesBetween(winStart, winEndExclusive);
        BigDecimal avgOrder = orderCount > 0
                ? revenue.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // previous equal window
        LocalDate prevEndDate = winStartDate.minusDays(1);
        LocalDate prevStartDate = prevEndDate.minusDays(window - 1);
        LocalDateTime prevStart = prevStartDate.atStartOfDay();
        LocalDateTime prevEndExclusive = winStartDate.atStartOfDay();

        BigDecimal prevRevenue = nz(orderRepository.sumSalesTotalBetween(prevStart, prevEndExclusive));
        long prevOrderCount = orderRepository.countSalesBetween(prevStart, prevEndExclusive);
        BigDecimal prevAvgOrder = prevOrderCount > 0
                ? prevRevenue.divide(BigDecimal.valueOf(prevOrderCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        double revenueChangePct = pctChange(prevRevenue, revenue);
        double avgOrderChangePct = pctChange(prevAvgOrder, avgOrder);

        // status counts for last 30d
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (Object[] row : orderRepository.countByStatusBetween(winStart, winEndExclusive)) {
            if (row == null || row.length < 2 || row[0] == null) continue;
            String status = String.valueOf(row[0]);
            long count = ((Number) row[1]).longValue();
            statusCounts.put(status, count);
        }

        // --- trailing year (365 days) ---
        int trailingDays = 365;
        LocalDate trailingStartDate = today.minusDays(trailingDays - 1);
        LocalDateTime trailingStart = trailingStartDate.atStartOfDay();
        LocalDateTime trailingEndExclusive = today.plusDays(1).atStartOfDay();

        BigDecimal trailingRevenue = nz(orderRepository.sumSalesTotalBetween(trailingStart, trailingEndExclusive));

        LocalDate trailingPrevEndDate = trailingStartDate.minusDays(1);
        LocalDate trailingPrevStartDate = trailingPrevEndDate.minusDays(trailingDays - 1);
        BigDecimal trailingPrevRevenue = nz(orderRepository.sumSalesTotalBetween(
                trailingPrevStartDate.atStartOfDay(),
                trailingStartDate.atStartOfDay()
        ));
        double trailingChangePct = pctChange(trailingPrevRevenue, trailingRevenue);

        // --- chart series (last N days) ---
        LocalDate chartStartDate = today.minusDays(chartWindow - 1);
        Map<String, BigDecimal> daily = new LinkedHashMap<>();
        for (int i = 0; i < chartWindow; i++) {
            daily.put(chartStartDate.plusDays(i).toString(), BigDecimal.ZERO);
        }

        List<Order> chartOrders = orderRepository.findSalesBetween(chartStartDate.atStartOfDay(), today.plusDays(1).atStartOfDay());
        for (Order o : chartOrders) {
            if (o == null || o.getPlacedAt() == null) continue;
            LocalDate d = o.getPlacedAt().toLocalDate();
            String key = d.toString();
            if (!daily.containsKey(key)) continue;
            daily.put(key, daily.get(key).add(nz(o.getTotal())));
        }

        List<AdminDashboardAnalyticsDTO.DailyRevenuePoint> series = daily.entrySet().stream()
                .map(e -> AdminDashboardAnalyticsDTO.DailyRevenuePoint.builder().date(e.getKey()).revenue(e.getValue()).build())
                .toList();

        // --- trending product (top revenue in last 30 days) ---
        AdminDashboardAnalyticsDTO.TrendingProduct trending = null;
        try {
            List<Object[]> top = orderItemRepository.topProductsByRevenueBetween(winStart, winEndExclusive);
            if (top != null && !top.isEmpty()) {
            Object[] row = top.get(0);
            Long productId = row != null && row.length > 0 ? (Long) row[0] : null;
            String productName = row != null && row.length > 1 ? (String) row[1] : null;
            String categoryName = row != null && row.length > 2 ? (String) row[2] : null;
            String imageUrl = row != null && row.length > 3 ? (String) row[3] : null;
            BigDecimal productRevenue = row != null && row.length > 4 && row[4] != null
                ? (BigDecimal) row[4]
                : BigDecimal.ZERO;

            String sku = null;
            if (productId != null) {
                sku = productRepository.findById(productId).map(p -> p.getSku()).orElse(null);
            }

            BigDecimal prevProductRevenue = (productId != null)
                ? nz(orderItemRepository.sumRevenueByProductIdBetween(productId, prevStart, prevEndExclusive))
                : BigDecimal.ZERO;

            // same 30-day window one year ago
            LocalDate yoyStartDate = winStartDate.minusYears(1);
            LocalDate yoyEndDate = today.minusYears(1);
            BigDecimal yoyRevenue = (productId != null)
                ? nz(orderItemRepository.sumRevenueByProductIdBetween(
                    productId,
                    yoyStartDate.atStartOfDay(),
                    yoyEndDate.plusDays(1).atStartOfDay()))
                : BigDecimal.ZERO;

            trending = AdminDashboardAnalyticsDTO.TrendingProduct.builder()
                .productId(productId)
                .sku(sku)
                .productName(productName)
                .categoryName(categoryName)
                .imageUrl(imageUrl)
                .revenue(productRevenue)
                .growthMoMPct(round2(pctChange(prevProductRevenue, productRevenue)))
                .growthYoYPct(round2(pctChange(yoyRevenue, productRevenue)))
                .build();
            }
        } catch (Exception ignored) {
            // keep dashboard resilient even if trending fails
        }

        // --- category performance (top units in last 30 days) ---
        List<AdminDashboardAnalyticsDTO.CategoryPerformance> categoryPerformance = java.util.Collections.emptyList();
        try {
            List<Object[]> currentCats = orderItemRepository.topCategoriesByUnitsBetween(winStart, winEndExclusive);
            List<Object[]> prevCats = orderItemRepository.topCategoriesByUnitsBetween(prevStart, prevEndExclusive);

            Map<Long, Long> prevUnitsByCat = new HashMap<>();
            if (prevCats != null) {
                for (Object[] row : prevCats) {
                    if (row == null || row.length < 3 || row[0] == null) continue;
                    Long categoryId = (Long) row[0];
                    Long units = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                    prevUnitsByCat.put(categoryId, units);
                }
            }

            if (currentCats != null && !currentCats.isEmpty()) {
                categoryPerformance = currentCats.stream()
                        .filter(r -> r != null && r.length >= 3 && r[0] != null)
                        .limit(4)
                        .map(r -> {
                            Long categoryId = (Long) r[0];
                            String categoryName = r[1] != null ? String.valueOf(r[1]) : null;
                            long unitsSold = r[2] != null ? ((Number) r[2]).longValue() : 0L;
                            long prevUnits = prevUnitsByCat.getOrDefault(categoryId, 0L);
                            double growthPct = pctChange(BigDecimal.valueOf(prevUnits), BigDecimal.valueOf(unitsSold));
                            return AdminDashboardAnalyticsDTO.CategoryPerformance.builder()
                                    .categoryId(categoryId)
                                    .categoryName(categoryName)
                                    .unitsSold(unitsSold)
                                    .growthPct(round2(growthPct))
                                    .trend(trendLabel(growthPct))
                                    .build();
                        })
                        .toList();
            }
        } catch (Exception ignored) {
            // keep dashboard resilient
        }

        AdminDashboardAnalyticsDTO dto = AdminDashboardAnalyticsDTO.builder()
                .currency(currency == null || currency.isBlank() ? "LKR" : currency.trim().toUpperCase())
                .asOfDate(today)
                .grossRevenue30d(AdminDashboardAnalyticsDTO.MetricCard.builder()
                        .title("Gross Revenue")
                        .value(revenue)
                        .periodLabel(periodLabel(winStartDate, today))
                        .changePct(round2(revenueChangePct))
                        .trend(trendLabel(revenueChangePct))
                        .build())
                .averageOrderValue30d(AdminDashboardAnalyticsDTO.MetricCard.builder()
                        .title("Avg Order")
                        .value(avgOrder)
                        .periodLabel(periodLabel(winStartDate, today))
                        .changePct(round2(avgOrderChangePct))
                        .trend(trendLabel(avgOrderChangePct))
                        .build())
                .revenueTrailingYear(AdminDashboardAnalyticsDTO.MetricCard.builder()
                        .title("Trailing Year")
                        .value(trailingRevenue)
                        .periodLabel("Previous 365 days")
                        .changePct(round2(trailingChangePct))
                        .trend(trendLabel(trailingChangePct))
                        .build())
                .revenueLast7Days(series)
                .revenueGrowth30d(AdminDashboardAnalyticsDTO.GrowthMetric.builder()
                        .label("Rev. Growth")
                        .changePct(round2(revenueChangePct))
                        .trend(trendLabel(revenueChangePct))
                        .startDate(winStartDate)
                        .endDate(today)
                        .build())
                .trendingProduct30d(trending)
                .categoryPerformance30d(categoryPerformance)
                .orderStatusCounts30d(statusCounts)
                .build();

        return ResponseEntity.ok(dto);
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    /** Percent change from prev -> current. Returns 0 when both are 0, and 100 when prev=0 and current>0. */
    private static double pctChange(BigDecimal prev, BigDecimal current) {
        BigDecimal p = nz(prev);
        BigDecimal c = nz(current);
        if (p.compareTo(BigDecimal.ZERO) == 0) {
            return c.compareTo(BigDecimal.ZERO) == 0 ? 0.0 : 100.0;
        }
        // (c - p) / p * 100
        BigDecimal diff = c.subtract(p);
        return diff.divide(p, 8, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
    }

    private static String trendLabel(double pct) {
        if (pct > 0.0001) return "up";
        if (pct < -0.0001) return "down";
        return "flat";
    }

    private static double round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private static String periodLabel(LocalDate start, LocalDate end) {
        if (start == null || end == null) return "";
        // Keep it simple + consistent for UI
        return "From " + start + " - " + end;
    }
}
