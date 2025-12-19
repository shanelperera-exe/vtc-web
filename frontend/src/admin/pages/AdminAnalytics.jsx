import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

import { getAdminSalesAnalytics } from "../../api/adminAnalyticsApi";
import SectionHeader from "../components/analytics/SectionHeader";
import ChartCard from "../components/analytics/ChartCard";
import {
  formatCurrencyLKR,
  formatCompactNumber,
  formatDayLabel,
} from "../components/analytics/formatters";

import {
  FiActivity,
  FiUsers,
  FiPackage,
  FiCreditCard,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";

const RANGE_OPTIONS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

/**
 * Admin Analytics Tab
 * Holds non-sales-focused analytics (inventory, customers, payments, operational timing, computed insights).
 * Data is sourced from the existing real backend analytics endpoint.
 */
export default function AdminAnalytics() {
  const [days, setDays] = React.useState(30);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminSalesAnalytics({ days });
        if (!ignore) setData(res);
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load analytics");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [days]);

  const currency = data?.currency || "LKR";
  const inventory = data?.inventory;
  const customers = data?.customers;
  const payments = data?.payments;
  const staffStore = data?.staffStore;

  const hasStockLevels = (inventory?.stockLevels || []).length > 0;
  const hasOverUnder = (inventory?.overUnderStock || []).length > 0;
  const hasTurnover = (inventory?.turnover || []).length > 0;
  const hasCustomerSegment =
    Number(customers?.newCustomers || 0) +
      Number(customers?.returningCustomers || 0) >
    0;
  const hasCustomerGrowth = (customers?.growth || []).length > 0;
  const hasBehaviorRadar = (customers?.behaviorRadar || []).length > 0;
  const hasValueVsFrequency = (customers?.valueVsFrequency || []).length > 0;
  const hasPaymentMethods = (payments?.paymentMethods || []).length > 0;
  const hasDiscountedVsFull =
    (payments?.discountedVsFullPrice || []).length > 0;
  const hasReturns = (payments?.returns || []).length > 0;
  const hasDiscountImpact = (payments?.discountImpact || []).length > 0;
  const hasSalesByChannel = (staffStore?.salesByChannel || []).length > 0;
  const hasPeakTimes = (staffStore?.peakTimes || []).length > 0;
  const hasInsights = (data?.insights || []).length > 0;

  return (
    <div className="w-full mb-16">
      <div className="mt-8 mb-4 px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl sm:text-6xl font-semibold text-gray-900 flex items-center gap-3">
              <span>Analytics</span>
            </h1>
            <div className="mt-1 text-sm text-gray-600">
              Easy-to-read signals for stock, customers, payments, and
              operations.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-1 flex">
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.days}
                  onClick={() => setDays(o.days)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    days === o.days
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8">
        {loading ? (
          <div className="text-sm text-gray-500 mb-4">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-600 mb-4">{error}</div>
        ) : null}

        {/* Inventory */}
        <div className="mb-10">
          <SectionHeader
            eyebrow="Stock"
            title={
              <span className="inline-flex items-center gap-2">
                <FiPackage className="h-5 w-5 text-green-700" />
                Inventory & stock insights
              </span>
            }
            subtitle="Spot low stock, overstock, and slow-moving items."
          />

          <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-6">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiPackage className="h-4 w-4 text-green-700" />
                    Stock levels (selected best sellers)
                  </span>
                }
                subtitle="Red = low stock, amber = slow-moving, green = healthy."
              >
                <div className="h-72">
                  {hasStockLevels ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(inventory?.stockLevels || []).map((p) => ({
                          ...p,
                          name:
                            (p?.productName || "").slice(0, 18) +
                            ((p?.productName || "").length > 18 ? "…" : ""),
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          angle={-18}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Bar
                          dataKey="stock"
                          name="Stock"
                          fill="currentColor"
                          radius={[8, 8, 0, 0]}
                        >
                          {(inventory?.stockLevels || []).map((row, i) => (
                            <Cell
                              key={row?.productId || i}
                              fill="currentColor"
                              className={stockHealthClass(row?.stockHealth)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No stock-level data available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-6">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiTrendingUp className="h-4 w-4 text-green-700" />
                    Overstock vs understock (delta)
                  </span>
                }
                subtitle="Positive = overstock, negative = understock vs a 3-week target cover."
              >
                <div className="h-72">
                  {hasOverUnder ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(inventory?.overUnderStock || [])
                          .slice(0, 10)
                          .map((p) => ({
                            ...p,
                            name:
                              (p?.productName || "").slice(0, 20) +
                              ((p?.productName || "").length > 20 ? "…" : ""),
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          angle={-18}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <ReferenceLine
                          y={0}
                          stroke="currentColor"
                          className="text-gray-300"
                        />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Bar
                          dataKey="deltaUnits"
                          name="Delta"
                          fill="currentColor"
                          radius={[8, 8, 8, 8]}
                        >
                          {(inventory?.overUnderStock || [])
                            .slice(0, 10)
                            .map((row, i) => (
                              <Cell
                                key={row?.productId || i}
                                fill="currentColor"
                                className={
                                  row?.status === "under"
                                    ? "text-red-500"
                                    : row?.status === "over"
                                    ? "text-amber-500"
                                    : "text-green-500"
                                }
                              />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No over/under-stock data available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-12">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiActivity className="h-4 w-4 text-green-700" />
                    Inventory turnover (velocity proxy)
                  </span>
                }
                subtitle="Uses units sold per day as a turnover proxy (no historical stock ledger stored)."
              >
                <div className="h-64">
                  {hasTurnover ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={inventory?.turnover || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          tickFormatter={formatDayLabel}
                          interval={Math.max(
                            0,
                            Math.floor((inventory?.turnover?.length || 30) / 10)
                          )}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Area
                          type="monotone"
                          dataKey="unitsSold"
                          name="Units"
                          fill="currentColor"
                          stroke="currentColor"
                          className="text-teal-500"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No turnover data available." />
                  )}
                </div>
              </ChartCard>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="mb-10">
          <SectionHeader
            eyebrow="Customer intelligence"
            title={
              <span className="inline-flex items-center gap-2">
                <FiUsers className="h-5 w-5 text-green-700" />
                Customer analytics
              </span>
            }
            subtitle="Understand customer growth and repeat buying patterns."
          />

          <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiUsers className="h-4 w-4 text-green-700" />
                    New vs Returning
                  </span>
                }
                subtitle="Are we growing the customer base or relying on repeat buyers?"
              >
                <div className="h-72">
                  {hasCustomerSegment ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Legend />
                        <Pie
                          data={[
                            {
                              name: "New",
                              value: customers?.newCustomers || 0,
                            },
                            {
                              name: "Returning",
                              value: customers?.returningCustomers || 0,
                            },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={3}
                          cornerRadius={12}
                        >
                          <Cell
                            fill="currentColor"
                            className="text-indigo-500"
                          />
                          <Cell
                            fill="currentColor"
                            className="text-emerald-500"
                          />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No customer mix data available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-8">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiTrendingUp className="h-4 w-4 text-green-700" />
                    Customer growth over time
                  </span>
                }
                subtitle="Tracks new-customer acquisition (active-customer tracking requires per-day email rollup)."
              >
                <div className="h-72">
                  {hasCustomerGrowth ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={(customers?.growth || []).map((p) => ({
                          ...p,
                          dayLabel: formatDayLabel(p?.date),
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="dayLabel"
                          tick={{ fontSize: 10 }}
                          interval={Math.max(
                            0,
                            Math.floor((customers?.growth?.length || 30) / 10)
                          )}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="newCustomers"
                          name="New customers"
                          stroke="currentColor"
                          className="text-purple-600"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No customer growth data available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-4">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiActivity className="h-4 w-4 text-green-700" />
                    Behavior radar
                  </span>
                }
                subtitle="High-level behavioral shape (scaled metrics)."
              >
                <div className="h-72">
                  {hasBehaviorRadar ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={customers?.behaviorRadar || []}>
                        <PolarGrid />
                        <PolarAngleAxis
                          dataKey="metric"
                          tick={{ fontSize: 10 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Radar
                          dataKey="value"
                          name="Index"
                          stroke="currentColor"
                          fill="currentColor"
                          className="text-teal-500"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No behavior radar data available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-8">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiTrendingUp className="h-4 w-4 text-green-700" />
                    Order value vs frequency (CLV insight)
                  </span>
                }
                subtitle="Clusters high-frequency / high-value customers for retention targeting."
              >
                <div className="h-72">
                  {hasValueVsFrequency ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="orders"
                          name="Orders"
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="avgOrder"
                          name="Avg order"
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          content={<ScatterTooltip currency={currency} />}
                        />
                        <Legend />
                        <Scatter
                          name="Customers"
                          data={(customers?.valueVsFrequency || []).map(
                            (p) => ({
                              ...p,
                              avgOrder: Number(p?.avgOrder || 0),
                            })
                          )}
                          fill="currentColor"
                          className="text-indigo-500"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No customer value/frequency data available." />
                  )}
                </div>
              </ChartCard>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="mb-10">
          <SectionHeader
            eyebrow="Payments"
            title={
              <span className="inline-flex items-center gap-2">
                <FiCreditCard className="h-5 w-5 text-green-700" />
                Payments, discounts & returns
              </span>
            }
            subtitle="Understand how customers pay and how promotions affect revenue."
          />

          <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiCreditCard className="h-4 w-4 text-green-700" />
                    Payment method split
                  </span>
                }
                subtitle="How customers pay (based on recorded order payment method)."
              >
                <div className="h-72">
                  {hasPaymentMethods ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Legend />
                        <Pie
                          data={(payments?.paymentMethods || []).map((m) => ({
                            name: humanPayment(m?.method),
                            value: Number(m?.revenue || 0),
                          }))}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={3}
                          cornerRadius={12}
                        >
                          {(payments?.paymentMethods || []).map((m, i) => (
                            <Cell
                              key={m?.method || i}
                              fill="currentColor"
                              className={pieColorClass(i)}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No payment method data available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-4">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiTrendingUp className="h-4 w-4 text-green-700" />
                    Discounted vs full-price sales
                  </span>
                }
                subtitle="Do promos drive revenue or cannibalize margin?"
              >
                <div className="h-72">
                  {hasDiscountedVsFull ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={payments?.discountedVsFullPrice || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="bucket"
                          tick={{ fontSize: 10 }}
                          tickFormatter={humanDiscountBucket}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          fill="currentColor"
                          radius={[8, 8, 0, 0]}
                        >
                          {(payments?.discountedVsFullPrice || []).map(
                            (r, i) => (
                              <Cell
                                key={r?.bucket || i}
                                fill="currentColor"
                                className={
                                  r?.bucket === "discounted"
                                    ? "text-amber-500"
                                    : "text-green-500"
                                }
                              />
                            )
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No discounted/full-price breakdown available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-4">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiCreditCard className="h-4 w-4 text-green-700" />
                    Returns & refunds (proxy)
                  </span>
                }
                subtitle="Uses cancelled orders as a proxy; values are shown negative."
              >
                <div className="h-72">
                  {hasReturns ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={payments?.returns || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          tickFormatter={formatDayLabel}
                          interval={Math.max(
                            0,
                            Math.floor((payments?.returns?.length || 30) / 10)
                          )}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <ReferenceLine
                          y={0}
                          stroke="currentColor"
                          className="text-gray-300"
                        />
                        <Line
                          type="monotone"
                          dataKey="refunds"
                          name="Refunds"
                          stroke="currentColor"
                          className="text-red-500"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No returns/refunds data available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-12">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiTrendingUp className="h-4 w-4 text-green-700" />
                    Discounts vs margin impact (proxy)
                  </span>
                }
                subtitle="Shows daily discount totals vs a margin proxy derived from discount intensity."
              >
                <div className="h-64">
                  {hasDiscountImpact ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={payments?.discountImpact || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          tickFormatter={formatDayLabel}
                          interval={Math.max(
                            0,
                            Math.floor(
                              (payments?.discountImpact?.length || 30) / 10
                            )
                          )}
                        />
                        <YAxis yAxisId="disc" tick={{ fontSize: 10 }} />
                        <YAxis
                          yAxisId="m"
                          orientation="right"
                          domain={[0, 100]}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Legend />
                        <Bar
                          yAxisId="disc"
                          dataKey="discounts"
                          name="Discounts"
                          fill="currentColor"
                          className="text-amber-500"
                          radius={[8, 8, 0, 0]}
                        />
                        <Line
                          yAxisId="m"
                          type="monotone"
                          dataKey="marginProxyPct"
                          name="Margin proxy %"
                          stroke="currentColor"
                          className="text-emerald-600"
                          strokeWidth={2}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No discount impact data available." />
                  )}
                </div>
              </ChartCard>
            </div>
          </div>
        </div>

        {/* Ops timing */}
        <div className="mb-10">
          <SectionHeader
            eyebrow="Operational timing"
            title={
              <span className="inline-flex items-center gap-2">
                <FiClock className="h-5 w-5 text-green-700" />
                Store & peak performance
              </span>
            }
            subtitle="When demand spikes, and which channel is carrying performance."
          />

          <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiActivity className="h-4 w-4 text-green-700" />
                    Sales per channel
                  </span>
                }
                subtitle="Useful for staffing and pickup scheduling."
              >
                <div className="h-72">
                  {hasSalesByChannel ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={staffStore?.salesByChannel || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          fill="currentColor"
                          radius={[8, 8, 0, 0]}
                        >
                          {(staffStore?.salesByChannel || []).map((r, i) => (
                            <Cell
                              key={r?.channel || i}
                              fill="currentColor"
                              className={
                                r?.channel === "Online"
                                  ? "text-indigo-500"
                                  : "text-teal-500"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No channel sales data available." />
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-8">
              <ChartCard
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiClock className="h-4 w-4 text-green-700" />
                    Peak performance times
                  </span>
                }
                subtitle="Revenue and orders by hour-of-day (based on order timestamps)."
              >
                <div className="h-72">
                  {hasPeakTimes ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={staffStore?.peakTimes || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="rev" tick={{ fontSize: 10 }} />
                        <YAxis
                          yAxisId="ord"
                          orientation="right"
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          content={<TooltipCard currency={currency} />}
                        />
                        <Legend />
                        <Line
                          yAxisId="rev"
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="currentColor"
                          className="text-green-600"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          yAxisId="ord"
                          type="monotone"
                          dataKey="orders"
                          name="Orders"
                          stroke="currentColor"
                          className="text-blue-600"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState text="No peak time data available." />
                  )}
                </div>
              </ChartCard>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mb-10">
          <SectionHeader
            eyebrow="What should we do next?"
            title={
              <span className="inline-flex items-center gap-2">
                <FiTrendingUp className="h-5 w-5 text-green-700" />
                Smart insights
              </span>
            }
            subtitle="Simple, actionable notes based on performance signals."
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {hasInsights ? (
              (data.insights || []).map((txt, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4"
                >
                  <div className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                    <FiTrendingUp className="h-3.5 w-3.5" />
                    Insight
                  </div>
                  <div className="mt-2 text-sm text-gray-800 leading-relaxed">
                    {txt}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">
                No insights available for this window.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="h-full w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center px-6">
      <div className="text-sm text-gray-600 text-center">{text}</div>
    </div>
  );
}

function TooltipCard({ active, payload, label, currency }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg px-3 py-2">
      <div className="text-[11px] font-semibold text-gray-700">{label}</div>
      <div className="mt-1 space-y-0.5">
        {payload.map((p) => {
          const key = `${p?.name}-${p?.dataKey}`;
          const val = p?.value;
          const isMoney = /revenue|discount|refund|total/i.test(
            String(p?.dataKey || p?.name || "")
          );
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-6 text-[11px]"
            >
              <span className="text-gray-600">{p?.name || p?.dataKey}</span>
              <span className="font-semibold text-gray-900">
                {isMoney
                  ? formatCurrencyLKR(val, currency)
                  : formatCompactNumber(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScatterTooltip({ active, payload, currency }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg px-3 py-2">
      <div className="text-[11px] font-semibold text-gray-700">Customer</div>
      <div className="mt-1 text-[11px] text-gray-700">{p?.customer}</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <div className="text-gray-500">Orders</div>
          <div className="font-semibold text-gray-900">
            {formatCompactNumber(p?.orders)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Avg order</div>
          <div className="font-semibold text-gray-900">
            {formatCurrencyLKR(p?.avgOrder, currency)}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-gray-500">Total spend</div>
          <div className="font-semibold text-gray-900">
            {formatCurrencyLKR(p?.totalSpend, currency)}
          </div>
        </div>
      </div>
    </div>
  );
}

function humanPayment(method) {
  if (!method) return "Unknown";
  if (method === "CASH_ON_DELIVERY") return "Cash";
  if (method === "CARD") return "Card";
  return String(method);
}

function humanDiscountBucket(bucket) {
  return bucket === "discounted" ? "Discounted" : "Full price";
}

function pieColorClass(i) {
  const colors = [
    "text-indigo-500",
    "text-teal-500",
    "text-amber-500",
    "text-purple-500",
    "text-blue-500",
    "text-rose-500",
  ];
  return colors[i % colors.length];
}

function stockHealthClass(health) {
  if (health === "low") return "text-red-500";
  if (health === "slow") return "text-amber-500";
  return "text-green-500";
}
