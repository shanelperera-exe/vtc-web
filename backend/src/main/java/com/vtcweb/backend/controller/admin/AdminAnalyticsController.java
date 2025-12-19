package com.vtcweb.backend.controller.admin;

import com.vtcweb.backend.dto.admin.AdminDashboardAnalyticsDTO;
import com.vtcweb.backend.dto.admin.AdminSalesAnalyticsDTO;
import com.vtcweb.backend.model.entity.order.Order;
import com.vtcweb.backend.model.entity.order.DeliveryMethod;
import com.vtcweb.backend.repository.order.OrderItemRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.product.ProductVariationRepository;
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
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariationRepository productVariationRepository;

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

    /**
     * Sales analytics powering the admin Sales tab.
     *
     * Query params:
     * - days: window size (default 30)
     * - currency: ISO 4217 currency code (default LKR)
     */
    @GetMapping("/sales")
    public ResponseEntity<AdminSalesAnalyticsDTO> sales(
            @RequestParam(name = "currency", required = false, defaultValue = "LKR") String currency,
            @RequestParam(name = "days", required = false, defaultValue = "30") int days) {

        int window = Math.max(7, Math.min(365, days));
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(window - 1L);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime endExclusive = today.plusDays(1).atStartOfDay();

        LocalDate prevEndDate = startDate.minusDays(1);
        LocalDate prevStartDate = prevEndDate.minusDays(window - 1L);
        LocalDateTime prevStart = prevStartDate.atStartOfDay();
        LocalDateTime prevEndExclusive = startDate.atStartOfDay();

        String cur = (currency == null || currency.isBlank()) ? "LKR" : currency.trim().toUpperCase();

        // --- KPI aggregates (real data) ---
        BigDecimal totalRevenue = nz(orderRepository.sumSalesTotalBetween(start, endExclusive));
        BigDecimal prevTotalRevenue = nz(orderRepository.sumSalesTotalBetween(prevStart, prevEndExclusive));

        BigDecimal netSales = nz(orderRepository.sumNetSalesBetween(start, endExclusive));
        BigDecimal prevNetSales = nz(orderRepository.sumNetSalesBetween(prevStart, prevEndExclusive));

        long ordersCount = orderRepository.countSalesBetween(start, endExclusive);
        long prevOrdersCount = orderRepository.countSalesBetween(prevStart, prevEndExclusive);

        BigDecimal aov = ordersCount > 0
                ? totalRevenue.divide(BigDecimal.valueOf(ordersCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal prevAov = prevOrdersCount > 0
                ? prevTotalRevenue.divide(BigDecimal.valueOf(prevOrdersCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal discountGiven = nz(orderRepository.sumDiscountBetween(start, endExclusive));
        BigDecimal prevDiscountGiven = nz(orderRepository.sumDiscountBetween(prevStart, prevEndExclusive));

        long unitsSold = sumUnits(orderItemRepository.dailyUnitsSoldBetween(start, endExclusive));
        long prevUnitsSold = sumUnits(orderItemRepository.dailyUnitsSoldBetween(prevStart, prevEndExclusive));

        // Profit/margin proxies (no COGS stored): treat net sales as gross profit proxy.
        BigDecimal grossProfit = netSales;
        BigDecimal prevGrossProfit = prevNetSales;
        double grossMarginPct = safePct(grossProfit, totalRevenue);
        double prevGrossMarginPct = safePct(prevGrossProfit, prevTotalRevenue);

        AdminSalesAnalyticsDTO.KpiBlock kpis = AdminSalesAnalyticsDTO.KpiBlock.builder()
                .totalSalesRevenue(metric(totalRevenue, prevTotalRevenue))
                .netSales(metric(netSales, prevNetSales))
                .ordersCount(metricLong(ordersCount, prevOrdersCount))
                .averageOrderValue(metric(aov, prevAov))
                .unitsSold(metricLong(unitsSold, prevUnitsSold))
                .grossProfit(metric(grossProfit, prevGrossProfit))
                .grossMarginPct(metricDouble(grossMarginPct, prevGrossMarginPct))
                .discountGiven(metric(discountGiven, prevDiscountGiven))
                .build();

        // --- Daily series (fill missing dates) ---
        Map<String, BigDecimal> revenueByDay = new LinkedHashMap<>();
        Map<String, Long> ordersByDay = new LinkedHashMap<>();
        for (int i = 0; i < window; i++) {
            String d = startDate.plusDays(i).toString();
            revenueByDay.put(d, BigDecimal.ZERO);
            ordersByDay.put(d, 0L);
        }

        for (Object[] row : orderRepository.dailyRevenueAndOrdersBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            if (!revenueByDay.containsKey(d)) continue;
            revenueByDay.put(d, nz((BigDecimal) row[1]));
            ordersByDay.put(d, row[2] != null ? ((Number) row[2]).longValue() : 0L);
        }

        Map<String, BigDecimal> discountsByDay = new LinkedHashMap<>();
        for (int i = 0; i < window; i++) {
            discountsByDay.put(startDate.plusDays(i).toString(), BigDecimal.ZERO);
        }
        for (Object[] row : orderRepository.dailyDiscountsBetween(start, endExclusive)) {
            if (row == null || row.length < 2 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            if (!discountsByDay.containsKey(d)) continue;
            discountsByDay.put(d, nz((BigDecimal) row[1]));
        }

        Map<String, BigDecimal> cancelledByDay = new LinkedHashMap<>();
        Map<String, Long> cancelledCountByDay = new LinkedHashMap<>();
        for (int i = 0; i < window; i++) {
            String d = startDate.plusDays(i).toString();
            cancelledByDay.put(d, BigDecimal.ZERO);
            cancelledCountByDay.put(d, 0L);
        }
        for (Object[] row : orderRepository.dailyCancelledTotalsBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            if (!cancelledByDay.containsKey(d)) continue;
            cancelledByDay.put(d, nz((BigDecimal) row[1]));
            cancelledCountByDay.put(d, row[2] != null ? ((Number) row[2]).longValue() : 0L);
        }

        Map<String, Long> unitsByDay = new LinkedHashMap<>();
        for (int i = 0; i < window; i++) {
            unitsByDay.put(startDate.plusDays(i).toString(), 0L);
        }
        for (Object[] row : orderItemRepository.dailyUnitsSoldBetween(start, endExclusive)) {
            if (row == null || row.length < 2 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            if (!unitsByDay.containsKey(d)) continue;
            unitsByDay.put(d, row[1] != null ? ((Number) row[1]).longValue() : 0L);
        }

        Map<String, BigDecimal> onlineByDay = new LinkedHashMap<>();
        Map<String, BigDecimal> posByDay = new LinkedHashMap<>();
        for (int i = 0; i < window; i++) {
            String d = startDate.plusDays(i).toString();
            onlineByDay.put(d, BigDecimal.ZERO);
            posByDay.put(d, BigDecimal.ZERO);
        }
        for (Object[] row : orderRepository.dailyRevenueByDeliveryMethodBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[0] == null || row[1] == null) continue;
            String d = String.valueOf(row[0]);
            if (!onlineByDay.containsKey(d)) continue;
            DeliveryMethod m = (DeliveryMethod) row[1];
            BigDecimal v = nz((BigDecimal) row[2]);
            if (m == DeliveryMethod.STANDARD_DELIVERY) onlineByDay.put(d, onlineByDay.get(d).add(v));
            if (m == DeliveryMethod.IN_STORE_PICKUP) posByDay.put(d, posByDay.get(d).add(v));
        }

        // Target line: use previous period average daily revenue + 5%.
        BigDecimal prevAvgDaily = (window > 0)
                ? prevTotalRevenue.divide(BigDecimal.valueOf(window), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal targetDaily = prevAvgDaily.multiply(BigDecimal.valueOf(1.05)).setScale(2, RoundingMode.HALF_UP);

        List<AdminSalesAnalyticsDTO.DailyPoint> daily = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> e : revenueByDay.entrySet()) {
            String d = e.getKey();
            BigDecimal rev = e.getValue();
            long oc = ordersByDay.getOrDefault(d, 0L);
            BigDecimal dayAov = oc > 0
                    ? rev.divide(BigDecimal.valueOf(oc), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            daily.add(AdminSalesAnalyticsDTO.DailyPoint.builder()
                    .date(d)
                    .revenue(rev)
                    .orders(oc)
                    .aov(dayAov)
                    .discounts(discountsByDay.getOrDefault(d, BigDecimal.ZERO))
                    .onlineRevenue(onlineByDay.getOrDefault(d, BigDecimal.ZERO))
                    .posRevenue(posByDay.getOrDefault(d, BigDecimal.ZERO))
                    .cancelled(cancelledByDay.getOrDefault(d, BigDecimal.ZERO))
                    .units(unitsByDay.getOrDefault(d, 0L))
                    .targetRevenue(targetDaily)
                    .build());
        }

        // --- Previous-period daily series (same shape, aligned by index rather than date) ---
        Map<String, BigDecimal> prevRevenueByDay = new LinkedHashMap<>();
        Map<String, Long> prevOrdersByDay = new LinkedHashMap<>();
        for (int i = 0; i < window; i++) {
            String d = prevStartDate.plusDays(i).toString();
            prevRevenueByDay.put(d, BigDecimal.ZERO);
            prevOrdersByDay.put(d, 0L);
        }
        for (Object[] row : orderRepository.dailyRevenueAndOrdersBetween(prevStart, prevEndExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            if (!prevRevenueByDay.containsKey(d)) continue;
            prevRevenueByDay.put(d, nz((BigDecimal) row[1]));
            prevOrdersByDay.put(d, row[2] != null ? ((Number) row[2]).longValue() : 0L);
        }

        Map<String, BigDecimal> prevDiscountsByDay = new LinkedHashMap<>();
        Map<String, BigDecimal> prevOnlineByDay = new LinkedHashMap<>();
        Map<String, BigDecimal> prevPosByDay = new LinkedHashMap<>();
        Map<String, BigDecimal> prevCancelledByDay = new LinkedHashMap<>();
        Map<String, Long> prevUnitsByDay = new LinkedHashMap<>();

        for (int i = 0; i < window; i++) {
            String d = prevStartDate.plusDays(i).toString();
            prevDiscountsByDay.put(d, BigDecimal.ZERO);
            prevOnlineByDay.put(d, BigDecimal.ZERO);
            prevPosByDay.put(d, BigDecimal.ZERO);
            prevCancelledByDay.put(d, BigDecimal.ZERO);
            prevUnitsByDay.put(d, 0L);
        }

        for (Object[] row : orderRepository.dailyDiscountsBetween(prevStart, prevEndExclusive)) {
            if (row == null || row.length < 2 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            if (!prevDiscountsByDay.containsKey(d)) continue;
            prevDiscountsByDay.put(d, nz((BigDecimal) row[1]));
        }
        for (Object[] row : orderRepository.dailyCancelledTotalsBetween(prevStart, prevEndExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            if (!prevCancelledByDay.containsKey(d)) continue;
            prevCancelledByDay.put(d, nz((BigDecimal) row[1]));
        }
        for (Object[] row : orderItemRepository.dailyUnitsSoldBetween(prevStart, prevEndExclusive)) {
            if (row == null || row.length < 2 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            if (!prevUnitsByDay.containsKey(d)) continue;
            prevUnitsByDay.put(d, row[1] != null ? ((Number) row[1]).longValue() : 0L);
        }
        for (Object[] row : orderRepository.dailyRevenueByDeliveryMethodBetween(prevStart, prevEndExclusive)) {
            if (row == null || row.length < 3 || row[0] == null || row[1] == null) continue;
            String d = String.valueOf(row[0]);
            if (!prevOnlineByDay.containsKey(d)) continue;
            DeliveryMethod m = (DeliveryMethod) row[1];
            BigDecimal v = nz((BigDecimal) row[2]);
            if (m == DeliveryMethod.STANDARD_DELIVERY) prevOnlineByDay.put(d, prevOnlineByDay.get(d).add(v));
            if (m == DeliveryMethod.IN_STORE_PICKUP) prevPosByDay.put(d, prevPosByDay.get(d).add(v));
        }

        List<AdminSalesAnalyticsDTO.DailyPoint> previousDaily = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> e : prevRevenueByDay.entrySet()) {
            String d = e.getKey();
            BigDecimal rev = e.getValue();
            long oc = prevOrdersByDay.getOrDefault(d, 0L);
            BigDecimal dayAov = oc > 0
                    ? rev.divide(BigDecimal.valueOf(oc), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            previousDaily.add(AdminSalesAnalyticsDTO.DailyPoint.builder()
                    .date(d)
                    .revenue(rev)
                    .orders(oc)
                    .aov(dayAov)
                    .discounts(prevDiscountsByDay.getOrDefault(d, BigDecimal.ZERO))
                    .onlineRevenue(prevOnlineByDay.getOrDefault(d, BigDecimal.ZERO))
                    .posRevenue(prevPosByDay.getOrDefault(d, BigDecimal.ZERO))
                    .cancelled(prevCancelledByDay.getOrDefault(d, BigDecimal.ZERO))
                    .units(prevUnitsByDay.getOrDefault(d, 0L))
                    .targetRevenue(targetDaily)
                    .build());
        }

        // --- Products / categories ---
        List<Object[]> topRows = orderItemRepository.topProductsByRevenueAndUnitsBetween(start, endExclusive);
        List<Object[]> worstRows = orderItemRepository.worstProductsByRevenueAndUnitsBetween(start, endExclusive);

        List<Object[]> contribRows = topRows == null ? java.util.Collections.emptyList() : topRows;
        List<AdminSalesAnalyticsDTO.ProductContribution> contributions = contribRows.stream()
                .filter(r -> r != null && r.length >= 7 && r[0] != null)
                .limit(30)
                .map(r -> AdminSalesAnalyticsDTO.ProductContribution.builder()
                        .productId((Long) r[0])
                        .productName(r[1] != null ? String.valueOf(r[1]) : null)
                        .categoryId(r[2] != null ? ((Number) r[2]).longValue() : null)
                        .categoryName(r[3] != null ? String.valueOf(r[3]) : null)
                        .revenue(nz((BigDecimal) r[5]))
                        .units(r[6] != null ? ((Number) r[6]).longValue() : 0L)
                        .build())
                .toList();

        Set<Long> productIdsForEnrichment = new java.util.HashSet<>();
        for (AdminSalesAnalyticsDTO.ProductContribution c : contributions) {
            if (c.getProductId() != null) productIdsForEnrichment.add(c.getProductId());
        }
        if (topRows != null) {
            topRows.stream().filter(r -> r != null && r.length > 0 && r[0] != null).limit(15).forEach(r -> productIdsForEnrichment.add((Long) r[0]));
        }
        if (worstRows != null) {
            worstRows.stream().filter(r -> r != null && r.length > 0 && r[0] != null).limit(15).forEach(r -> productIdsForEnrichment.add((Long) r[0]));
        }

        Map<Long, String> skuByProductId = new HashMap<>();
        Map<Long, BigDecimal> basePriceByProductId = new HashMap<>();
        if (!productIdsForEnrichment.isEmpty()) {
            productRepository.findAllById(productIdsForEnrichment).forEach(p -> {
                if (p == null) return;
                skuByProductId.put(p.getId(), p.getSku());
                basePriceByProductId.put(p.getId(), nz(p.getBasePrice()));
            });
        }

        List<AdminSalesAnalyticsDTO.ProductPerformance> topProducts = mapProducts(topRows, skuByProductId, basePriceByProductId, 10);
        List<AdminSalesAnalyticsDTO.ProductPerformance> worstProducts = mapProducts(worstRows, skuByProductId, basePriceByProductId, 10);

        List<AdminSalesAnalyticsDTO.CategoryContribution> categories = new ArrayList<>();
        for (Object[] row : orderItemRepository.categoryRevenueBetween(start, endExclusive)) {
            if (row == null || row.length < 4 || row[0] == null) continue;
            categories.add(AdminSalesAnalyticsDTO.CategoryContribution.builder()
                    .categoryId(row[0] != null ? ((Number) row[0]).longValue() : null)
                    .categoryName(row[1] != null ? String.valueOf(row[1]) : null)
                    .revenue(nz((BigDecimal) row[2]))
                    .units(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                    .build());
        }

        // --- Inventory ---
        AdminSalesAnalyticsDTO.InventoryBlock inventory = buildInventory(window, start, endExclusive, topProducts, skuByProductId, basePriceByProductId);

        // --- Customers ---
        AdminSalesAnalyticsDTO.CustomerBlock customers = buildCustomers(startDate, today, start, endExclusive);

        // --- Payments / discounts / returns ---
        AdminSalesAnalyticsDTO.PaymentsBlock payments = buildPayments(daily, start, endExclusive);

        // --- Channel + peak times ---
        AdminSalesAnalyticsDTO.StaffStoreBlock staffStore = buildStaffStore(start, endExclusive);

        // --- Smart insights ---
        List<String> insights = buildInsights(kpis, categories, inventory, customers, payments, topProducts);

        AdminSalesAnalyticsDTO dto = AdminSalesAnalyticsDTO.builder()
                .currency(cur)
                .startDate(startDate)
                .endDate(today)
                .prevStartDate(prevStartDate)
                .prevEndDate(prevEndDate)
                .kpis(kpis)
                .daily(daily)
                .previousDaily(previousDaily)
                .topProducts(topProducts)
                .worstProducts(worstProducts)
                .categories(categories)
                .productContributions(contributions)
                .inventory(inventory)
                .customers(customers)
                .payments(payments)
                .staffStore(staffStore)
                .insights(insights)
                .build();

        return ResponseEntity.ok(dto);
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static double safePct(BigDecimal numerator, BigDecimal denominator) {
        BigDecimal n = nz(numerator);
        BigDecimal d = nz(denominator);
        if (d.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return n.divide(d, 8, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
    }

    private static AdminSalesAnalyticsDTO.Metric metric(BigDecimal current, BigDecimal prev) {
        double change = pctChange(prev, current);
        return AdminSalesAnalyticsDTO.Metric.builder()
                .value(nz(current))
                .changePct(round2(change))
                .trend(trendLabel(change))
                .build();
    }

    private static AdminSalesAnalyticsDTO.MetricLong metricLong(long current, long prev) {
        double change = pctChange(BigDecimal.valueOf(prev), BigDecimal.valueOf(current));
        return AdminSalesAnalyticsDTO.MetricLong.builder()
                .value(current)
                .changePct(round2(change))
                .trend(trendLabel(change))
                .build();
    }

    private static AdminSalesAnalyticsDTO.MetricDouble metricDouble(double current, double prev) {
        double change = (Math.abs(prev) < 0.0000001) ? (Math.abs(current) < 0.0000001 ? 0.0 : 100.0) : ((current - prev) / prev) * 100.0;
        return AdminSalesAnalyticsDTO.MetricDouble.builder()
                .value(round2(current))
                .changePct(round2(change))
                .trend(trendLabel(change))
                .build();
    }

    private static long sumUnits(List<Object[]> dailyUnitsRows) {
        if (dailyUnitsRows == null) return 0L;
        long sum = 0L;
        for (Object[] row : dailyUnitsRows) {
            if (row == null || row.length < 2) continue;
            if (row[1] == null) continue;
            sum += ((Number) row[1]).longValue();
        }
        return sum;
    }

    private static List<AdminSalesAnalyticsDTO.ProductPerformance> mapProducts(
            List<Object[]> rows,
            Map<Long, String> skuByProductId,
            Map<Long, BigDecimal> basePriceByProductId,
            int limit
    ) {
        if (rows == null) return java.util.Collections.emptyList();
        List<AdminSalesAnalyticsDTO.ProductPerformance> out = new ArrayList<>();
        for (Object[] r : rows) {
            if (r == null || r.length < 7 || r[0] == null) continue;
            Long productId = (Long) r[0];
            String name = r[1] != null ? String.valueOf(r[1]) : null;
            Long categoryId = r[2] != null ? ((Number) r[2]).longValue() : null;
            String categoryName = r[3] != null ? String.valueOf(r[3]) : null;
            String imageUrl = r[4] != null ? String.valueOf(r[4]) : null;
            BigDecimal revenue = nz((BigDecimal) r[5]);
            long units = r[6] != null ? ((Number) r[6]).longValue() : 0L;

            BigDecimal base = nz(basePriceByProductId.get(productId));
            BigDecimal listRevenue = (units > 0) ? base.multiply(BigDecimal.valueOf(units)) : BigDecimal.ZERO;

            double realizedRate = 1.0;
            if (listRevenue.compareTo(BigDecimal.ZERO) > 0) {
                realizedRate = revenue.divide(listRevenue, 6, RoundingMode.HALF_UP).doubleValue();
            }
            double discountProxy = Math.max(0.0, Math.min(100.0, (1.0 - realizedRate) * 100.0));

            out.add(AdminSalesAnalyticsDTO.ProductPerformance.builder()
                    .productId(productId)
                    .sku(skuByProductId.get(productId))
                    .productName(name)
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .imageUrl(imageUrl)
                    .revenue(revenue)
                    .units(units)
                    .realizedRate(round2(realizedRate))
                    .discountProxyPct(round2(discountProxy))
                    .build());
            if (out.size() >= limit) break;
        }
        return out;
    }

    private AdminSalesAnalyticsDTO.InventoryBlock buildInventory(
            int window,
            LocalDateTime start,
            LocalDateTime endExclusive,
            List<AdminSalesAnalyticsDTO.ProductPerformance> topProducts,
            Map<Long, String> skuByProductId,
            Map<Long, BigDecimal> basePriceByProductId
    ) {
        // Focus inventory widgets on best sellers (keeps payload small and actionable).
        List<AdminSalesAnalyticsDTO.ProductPerformance> focus = topProducts == null
            ? java.util.Collections.emptyList()
            : topProducts;

        List<Long> productIds = focus
                .stream().map(AdminSalesAnalyticsDTO.ProductPerformance::getProductId)
                .filter(id -> id != null)
                .distinct().toList();

        Map<Long, Long> stockByProduct = new HashMap<>();
        if (!productIds.isEmpty()) {
            for (Object[] row : productVariationRepository.sumStockByProductIds(productIds)) {
                if (row == null || row.length < 2 || row[0] == null) continue;
                Long pid = (Long) row[0];
                long stock = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                stockByProduct.put(pid, stock);
            }
        }

        // Units sold per selected product in window
        Map<Long, Long> unitsByProduct = new HashMap<>();
        if (!productIds.isEmpty()) {
            // Reuse top-products rows to approximate units, since this method is called from sales() after mapping.
            for (AdminSalesAnalyticsDTO.ProductPerformance p : focus) {
                if (p.getProductId() == null) continue;
                unitsByProduct.put(p.getProductId(), p.getUnits() == null ? 0L : p.getUnits());
            }
        }

        List<AdminSalesAnalyticsDTO.InventoryItem> stockLevels = new ArrayList<>();
        List<AdminSalesAnalyticsDTO.InventoryDelta> overUnder = new ArrayList<>();
        for (AdminSalesAnalyticsDTO.ProductPerformance p : focus) {
            Long pid = p.getProductId();
            if (pid == null) continue;
            long stock = stockByProduct.getOrDefault(pid, 0L);
            long units = unitsByProduct.getOrDefault(pid, 0L);

            double velocity = window > 0 ? (double) units / (double) window : 0.0; // units/day
            double daysCover = velocity > 0.0001 ? stock / velocity : (stock > 0 ? 999.0 : 0.0);

            String health;
            if (stock <= 5 || daysCover < 7) health = "low";
            else if (daysCover > 60) health = "slow";
            else health = "healthy";

            // Target stock = 21 days of cover
            double targetStock = velocity * 21.0;
            double delta = stock - targetStock;
            String status = (delta > targetStock * 0.5) ? "over" : (delta < -targetStock * 0.5 ? "under" : "ok");

            stockLevels.add(AdminSalesAnalyticsDTO.InventoryItem.builder()
                    .productId(pid)
                    .sku(skuByProductId.get(pid))
                    .productName(p.getProductName())
                    .categoryName(p.getCategoryName())
                    .stock(stock)
                    .unitsSold(units)
                    .daysCover(round2(daysCover))
                    .stockHealth(health)
                    .build());

            overUnder.add(AdminSalesAnalyticsDTO.InventoryDelta.builder()
                    .productId(pid)
                    .productName(p.getProductName())
                    .deltaUnits(round2(delta))
                    .status(status)
                    .build());
        }

        // Turnover proxy: daily units sold (already queried in the main flow as daily.units)
        List<AdminSalesAnalyticsDTO.InventoryTurnoverPoint> turnover = new ArrayList<>();
        // Caller will set from daily series on UI (we still populate a simple list to keep API self-contained)
        for (Object[] row : orderItemRepository.dailyUnitsSoldBetween(start, endExclusive)) {
            if (row == null || row.length < 2 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            long u = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            turnover.add(AdminSalesAnalyticsDTO.InventoryTurnoverPoint.builder().date(d).unitsSold(u).build());
        }

        return AdminSalesAnalyticsDTO.InventoryBlock.builder()
                .stockLevels(stockLevels)
                .overUnderStock(overUnder)
                .turnover(turnover)
                .build();
    }

    private AdminSalesAnalyticsDTO.CustomerBlock buildCustomers(
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime start,
            LocalDateTime endExclusive
    ) {
        int days = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;

        // First purchase for customers active in the window
        Map<String, LocalDate> firstPurchaseDateByEmail = new HashMap<>();
        for (Object[] row : orderRepository.firstPurchaseForActiveCustomersBetween(start, endExclusive)) {
            if (row == null || row.length < 2 || row[0] == null || row[1] == null) continue;
            String email = String.valueOf(row[0]);
            LocalDateTime ts = (LocalDateTime) row[1];
            firstPurchaseDateByEmail.put(email, ts.toLocalDate());
        }

        long totalCustomers = firstPurchaseDateByEmail.size();
        long newCustomers = firstPurchaseDateByEmail.values().stream().filter(d -> !d.isBefore(startDate)).count();
        long returningCustomers = totalCustomers - newCustomers;

        // Growth series: new customers by day + active customers by day
        Map<String, Long> newByDay = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) {
            String d = startDate.plusDays(i).toString();
            newByDay.put(d, 0L);
        }

        for (Map.Entry<String, LocalDate> e : firstPurchaseDateByEmail.entrySet()) {
            String d = e.getValue().toString();
            if (newByDay.containsKey(d)) newByDay.put(d, newByDay.get(d) + 1);
        }

        List<AdminSalesAnalyticsDTO.CustomerGrowthPoint> growth = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            String d = startDate.plusDays(i).toString();
            growth.add(AdminSalesAnalyticsDTO.CustomerGrowthPoint.builder()
                    .date(d)
                    .newCustomers(newByDay.getOrDefault(d, 0L))
                    .activeCustomers(null)
                    .build());
        }

        // Scatter: spend vs frequency
        List<AdminSalesAnalyticsDTO.CustomerScatterPoint> scatter = new ArrayList<>();
        for (Object[] row : orderRepository.customerSpendAndFrequencyBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            String email = String.valueOf(row[0]);
            long freq = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            BigDecimal spend = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            BigDecimal avg = freq > 0 ? spend.divide(BigDecimal.valueOf(freq), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            scatter.add(AdminSalesAnalyticsDTO.CustomerScatterPoint.builder()
                    .customer(email)
                    .orders(freq)
                    .totalSpend(nz(spend))
                    .avgOrder(avg)
                    .build());
        }
        scatter = scatter.stream()
                .sorted((a, b) -> nz(b.getTotalSpend()).compareTo(nz(a.getTotalSpend())))
                .limit(120)
                .toList();

        // Radar: simple, scaled metrics (0-100)
        double repeatRate = totalCustomers > 0 ? (double) returningCustomers / (double) totalCustomers * 100.0 : 0.0;
        double newRate = totalCustomers > 0 ? (double) newCustomers / (double) totalCustomers * 100.0 : 0.0;

        List<AdminSalesAnalyticsDTO.RadarMetric> radar = List.of(
                AdminSalesAnalyticsDTO.RadarMetric.builder().metric("Repeat") .value(round2(repeatRate)).build(),
                AdminSalesAnalyticsDTO.RadarMetric.builder().metric("New") .value(round2(newRate)).build(),
                AdminSalesAnalyticsDTO.RadarMetric.builder().metric("Frequency") .value(round2(Math.min(100.0, totalCustomers == 0 ? 0.0 : (double) scatter.stream().mapToLong(s -> s.getOrders() == null ? 0L : s.getOrders()).sum() / (double) totalCustomers * 25.0))).build(),
                AdminSalesAnalyticsDTO.RadarMetric.builder().metric("Spend") .value(round2(Math.min(100.0, scatter.isEmpty() ? 0.0 : nz(scatter.get(0).getTotalSpend()).doubleValue() / Math.max(1.0, avgSpend(scatter)) * 50.0))).build()
        );

        return AdminSalesAnalyticsDTO.CustomerBlock.builder()
                .totalCustomers(totalCustomers)
                .newCustomers(newCustomers)
                .returningCustomers(returningCustomers)
                .growth(growth)
                .behaviorRadar(radar)
                .valueVsFrequency(scatter)
                .build();
    }

    private static double avgSpend(List<AdminSalesAnalyticsDTO.CustomerScatterPoint> scatter) {
        if (scatter == null || scatter.isEmpty()) return 0.0;
        double sum = 0.0;
        int n = 0;
        for (AdminSalesAnalyticsDTO.CustomerScatterPoint p : scatter) {
            if (p == null) continue;
            sum += nz(p.getTotalSpend()).doubleValue();
            n++;
        }
        return n > 0 ? sum / n : 0.0;
    }

    private AdminSalesAnalyticsDTO.PaymentsBlock buildPayments(List<AdminSalesAnalyticsDTO.DailyPoint> daily, LocalDateTime start, LocalDateTime endExclusive) {
        List<AdminSalesAnalyticsDTO.PaymentSplit> methods = new ArrayList<>();
        for (Object[] row : orderRepository.paymentSplitBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            methods.add(AdminSalesAnalyticsDTO.PaymentSplit.builder()
                    .method(String.valueOf(row[0]))
                    .orders(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                    .revenue(nz((BigDecimal) row[2]))
                    .build());
        }

        List<AdminSalesAnalyticsDTO.DiscountSplit> split = new ArrayList<>();
        for (Object[] row : orderRepository.discountedSplitBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            split.add(AdminSalesAnalyticsDTO.DiscountSplit.builder()
                    .bucket(String.valueOf(row[0]))
                    .orders(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                    .revenue(nz((BigDecimal) row[2]))
                    .build());
        }

        List<AdminSalesAnalyticsDTO.ReturnPoint> returns = new ArrayList<>();
        for (Object[] row : orderRepository.dailyCancelledTotalsBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            String d = String.valueOf(row[0]);
            BigDecimal cancelled = nz((BigDecimal) row[1]);
            long cnt = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            returns.add(AdminSalesAnalyticsDTO.ReturnPoint.builder()
                    .date(d)
                    .refunds(cancelled.negate())
                    .cancelledOrders(cnt)
                    .build());
        }

        // Discount impact: discounts + margin proxy per day
        List<AdminSalesAnalyticsDTO.DiscountImpactPoint> impact = new ArrayList<>();
        if (daily != null) {
            for (AdminSalesAnalyticsDTO.DailyPoint p : daily) {
                BigDecimal rev = nz(p.getRevenue());
                BigDecimal disc = nz(p.getDiscounts());
                double marginProxy = (rev.add(disc).compareTo(BigDecimal.ZERO) > 0)
                        ? (1.0 - disc.divide(rev.add(disc), 8, RoundingMode.HALF_UP).doubleValue()) * 100.0
                        : 0.0;
                impact.add(AdminSalesAnalyticsDTO.DiscountImpactPoint.builder()
                        .date(p.getDate())
                        .discounts(disc)
                        .marginProxyPct(round2(Math.max(0.0, Math.min(100.0, marginProxy))))
                        .build());
            }
        }

        return AdminSalesAnalyticsDTO.PaymentsBlock.builder()
                .paymentMethods(methods)
                .discountedVsFullPrice(split)
                .returns(returns)
                .discountImpact(impact)
                .build();
    }

    private AdminSalesAnalyticsDTO.StaffStoreBlock buildStaffStore(LocalDateTime start, LocalDateTime endExclusive) {
        // Sales by channel derived from deliveryMethod
        Map<String, AdminSalesAnalyticsDTO.ChannelPoint> channel = new HashMap<>();
        channel.put("Online", AdminSalesAnalyticsDTO.ChannelPoint.builder().channel("Online").revenue(BigDecimal.ZERO).orders(0L).build());
        channel.put("POS", AdminSalesAnalyticsDTO.ChannelPoint.builder().channel("POS").revenue(BigDecimal.ZERO).orders(0L).build());

        // Reuse dailyRevenueByDeliveryMethodBetween but aggregate over the full window
        for (Object[] row : orderRepository.dailyRevenueByDeliveryMethodBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[1] == null) continue;
            DeliveryMethod m = (DeliveryMethod) row[1];
            BigDecimal v = nz((BigDecimal) row[2]);
            if (m == DeliveryMethod.STANDARD_DELIVERY) {
                AdminSalesAnalyticsDTO.ChannelPoint cp = channel.get("Online");
                cp.setRevenue(nz(cp.getRevenue()).add(v));
            }
            if (m == DeliveryMethod.IN_STORE_PICKUP) {
                AdminSalesAnalyticsDTO.ChannelPoint cp = channel.get("POS");
                cp.setRevenue(nz(cp.getRevenue()).add(v));
            }
        }

        // Orders per channel (cheaper: infer from totals split is not possible without a dedicated query; keep 0 when unknown)
        List<AdminSalesAnalyticsDTO.ChannelPoint> channelPoints = new ArrayList<>(channel.values());

        List<AdminSalesAnalyticsDTO.HourPoint> hours = new ArrayList<>();
        for (Object[] row : orderRepository.hourlyRevenueAndOrdersBetween(start, endExclusive)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            Integer h = ((Number) row[0]).intValue();
            hours.add(AdminSalesAnalyticsDTO.HourPoint.builder()
                    .hour(h)
                    .revenue(nz((BigDecimal) row[1]))
                    .orders(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                    .build());
        }

        return AdminSalesAnalyticsDTO.StaffStoreBlock.builder()
                .salesByChannel(channelPoints)
                .peakTimes(hours)
                .build();
    }

    private List<String> buildInsights(
            AdminSalesAnalyticsDTO.KpiBlock kpis,
            List<AdminSalesAnalyticsDTO.CategoryContribution> categories,
            AdminSalesAnalyticsDTO.InventoryBlock inventory,
            AdminSalesAnalyticsDTO.CustomerBlock customers,
            AdminSalesAnalyticsDTO.PaymentsBlock payments,
            List<AdminSalesAnalyticsDTO.ProductPerformance> topProducts
    ) {
        List<String> insights = new ArrayList<>();

        double revChg = kpis != null && kpis.getTotalSalesRevenue() != null && kpis.getTotalSalesRevenue().getChangePct() != null
                ? kpis.getTotalSalesRevenue().getChangePct() : 0.0;
        double ordChg = kpis != null && kpis.getOrdersCount() != null && kpis.getOrdersCount().getChangePct() != null
                ? kpis.getOrdersCount().getChangePct() : 0.0;

        if (Math.abs(revChg) > 1.0) {
            String driver = Math.abs(ordChg) > 1.0 ? (ordChg < 0 ? "fewer orders" : "more orders") : "stable order volume";
            insights.add("Sales " + (revChg < 0 ? "dropped" : "grew") + " " + round2(Math.abs(revChg)) + "% vs last period, driven by " + driver + ".");
        }

        // Discount impact
        if (kpis != null && kpis.getDiscountGiven() != null && kpis.getNetSales() != null) {
            BigDecimal disc = nz(kpis.getDiscountGiven().getValue());
            BigDecimal net = nz(kpis.getNetSales().getValue());
            if (net.add(disc).compareTo(BigDecimal.ZERO) > 0) {
                double discRate = disc.divide(net.add(disc), 6, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
                if (discRate > 5.0) insights.add("Discounting intensity is " + round2(discRate) + "% of pre-discount sales; consider tightening promos on low-margin items.");
            }
        }

        // Category concentration
        if (categories != null && !categories.isEmpty()) {
            AdminSalesAnalyticsDTO.CategoryContribution top = categories.get(0);
            insights.add("Top category is “" + (top.getCategoryName() == null ? "(unknown)" : top.getCategoryName()) + "” contributing " + top.getRevenue() + " in revenue.");
        }

        // Understock callouts
        if (inventory != null && inventory.getStockLevels() != null) {
            List<AdminSalesAnalyticsDTO.InventoryItem> low = inventory.getStockLevels().stream()
                    .filter(i -> i != null && "low".equals(i.getStockHealth()))
                    .limit(2)
                    .toList();
            if (!low.isEmpty()) {
                insights.add("Low stock risk: “" + low.get(0).getProductName() + "” has ~" + low.get(0).getDaysCover() + " days cover left.");
            }
        }

        // Low realized rate (proxy for heavy discounting)
        if (topProducts != null && !topProducts.isEmpty()) {
            AdminSalesAnalyticsDTO.ProductPerformance p = topProducts.stream()
                    .filter(x -> x != null && x.getRealizedRate() != null)
                    .min((a, b) -> Double.compare(a.getRealizedRate(), b.getRealizedRate()))
                    .orElse(null);
            if (p != null && p.getDiscountProxyPct() != null && p.getDiscountProxyPct() > 10.0) {
                insights.add("“" + p.getProductName() + "” shows heavy discount pressure (proxy: " + p.getDiscountProxyPct() + "% off list vs realized sales).");
            }
        }

        // New vs returning
        if (customers != null && customers.getTotalCustomers() != null && customers.getTotalCustomers() > 0) {
            insights.add("Customer mix: " + customers.getNewCustomers() + " new vs " + customers.getReturningCustomers() + " returning customers in this period.");
        }

        return insights.stream().filter(s -> s != null && !s.isBlank()).limit(8).toList();
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
