import React, { useState, useEffect } from "react";
import { FiSearch, FiChevronDown, FiCheck, FiClock, FiRefreshCw, FiTruck, FiCheckCircle, FiXCircle, FiEye, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// Correct path to useOrders hook
import useOrders from "../../../api/hooks/useOrders";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  // Use the orders hook in admin mode to list all orders
  const { orders: hookOrders, loading, error, reload } = useOrders({ admin: true });
  useEffect(() => {
    // Map hook orders (already simplified?) to local shape if needed
    if (!hookOrders) return;
    const mapped = hookOrders.map((o) => {
      const id = String(o.id);
      const orderNumber = o.orderNumber ? String(o.orderNumber) : undefined;
      const first = o.customerFirstName || o.firstName || o.customer?.firstName;
      const last = o.customerLastName || o.lastName || o.customer?.lastName;
      const customerName = [first, last].filter(Boolean).join(' ') || o.customerName || (o.customer && o.customer.name) || 'Unknown';
      const userCode = o.userCode || o.customerUserCode || o.customerCode || o.customer?.userCode || undefined;
      const total = o.billing?.summary?.total ?? (o.items || []).reduce((s, it) => s + (Number(it.price || it.unitPrice || 0) * (it.quantity || it.qty || 1)), 0);
      const payment = o.billing?.payment || null; // from transformOrder
      const status = o.status || (o.items && o.items[0]?.status?.text) || 'Unknown';
      return {
        id,
        orderNumber,
        customerName,
        userCode,
        placed: o.placed || '',
        placedTime: o.placedTime || '',
        total,
        payment,
        status
      };
    });
    setOrders(mapped);
  }, [hookOrders]);

  const updateStatus = (id, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const filteredOrders = orders.filter((order) => {
    const q = String(search || '').toLowerCase();
    const idStr = String(order.id || '').toLowerCase();
    const noStr = String(order.orderNumber || '').toLowerCase();
    const customerStr = String(order.customerName || '').toLowerCase();
    const codeStr = String(order.userCode || '').toLowerCase();
    const matchesSearch = idStr.includes(q) || noStr.includes(q) || customerStr.includes(q) || codeStr.includes(q);

    const matchesStatus =
      statusFilter === "All" ? true : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-3 bg-white">

      {/* Loading / Error */}
      {loading && (
        <div className="px-4 py-2 text-sm text-gray-600">Loading orders...</div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between">
          <span className="font-semibold">Failed to load orders</span>
          <button onClick={reload} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">
            <FiRefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Search by Order No. or Customer"
            className="w-full h-11 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50"
            size={18}
            style={{ strokeWidth: 2 }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            title="Reload orders"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wide">
              <th className="p-4">Order No.</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Total (LKR)</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-black/5 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="p-4 font-semibold text-gray-900">
                    {order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{order.customerName || 'Unknown'}</span>
                      {order.userCode && (
                        <span className="text-xs text-gray-500">{order.userCode}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">
                    {order.placed || order.placedTime ? (
                      <span>{[order.placed, order.placedTime].filter(Boolean).join(' ')}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {(() => {
                      const type = order.payment?.type || '';
                      const cardType = (order.payment?.cardType || '').toString().toUpperCase();
                      if (type.toLowerCase().includes('cash')) {
                        return (
                          <span className="inline-flex items-center gap-2">
                            <FiDollarSign className="w-4 h-4 text-black/60" />
                            <span className="text-sm">Cash on Delivery</span>
                          </span>
                        );
                      }
                      // card logo mapping
                      const brand = cardType === 'VISA' ? 'visa' : cardType === 'MASTERCARD' ? 'mastercard' : cardType === 'AMEX' ? 'amex' : null;
                      const brandLogo = brand === 'visa'
                        ? 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/visa.sxIq5Dot.svg'
                        : brand === 'mastercard'
                        ? 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/mastercard.1c4_lyMp.svg'
                        : brand === 'amex'
                        ? 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/assets/amex.Csr7hRoy.svg'
                        : null;
                      const last4 = order.payment?.last4 || order.payment?.cardLast4 || '';
                      return (
                        <span className="inline-flex items-center gap-2">
                          {brandLogo ? (
                            <img src={brandLogo} alt={cardType || 'Card'} className="h-5" />
                          ) : (
                            <span className="text-xs font-medium">{order.payment?.type || 'Card'}</span>
                          )}
                          {last4 && <span className="text-xs">•••• {last4}</span>}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4 font-semibold text-gray-900">Rs. {Number(order.total || 0).toFixed(2)}</td>
                  <td className="p-4">
                    {(() => {
                      const getIconForStatus = (s) => {
                        if (!s) return FiCheck;
                        const st = s.toLowerCase();
                        if (st.includes('pending')) return FiClock;
                        if (st.includes('processing')) return FiRefreshCw;
                        if (st.includes('shipped')) return FiTruck;
                        if (st.includes('delivered')) return FiCheckCircle;
                        if (st.includes('cancel')) return FiXCircle;
                        return FiCheck;
                      };
                      const Icon = getIconForStatus(order.status);
                      const sLower = String(order.status || '').toLowerCase();
                      const badgeClasses = sLower.includes('pending')
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : sLower.includes('placed')
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : sLower.includes('processing')
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : sLower.includes('shipped')
                              ? 'bg-violet-50 text-violet-800 border-violet-200'
                              : sLower.includes('delivered')
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : sLower.includes('cancel')
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-gray-50 text-gray-700 border-black/10';
                      return (
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClasses}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {order.status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => navigate(`/admin/orders/${order.orderNumber || order.id}`)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-900 hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-10 text-center text-gray-500" colSpan="7">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersList;

const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const options = [
    { label: "All", Icon: FiCheck },
    { label: "Pending", Icon: FiClock },
    { label: "Processing", Icon: FiRefreshCw },
    { label: "Shipped", Icon: FiTruck },
    { label: "Delivered", Icon: FiCheckCircle },
    { label: "Cancelled", Icon: FiXCircle },
  ];

  return (
    <div className="relative">
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <span className="font-medium text-sm">{value}</span>
          <motion.span variants={iconVariants}>
            <FiChevronDown className="w-4 h-4 text-black/60" />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-70%" }}
          className="flex flex-col gap-1 p-2 bg-white shadow-sm absolute top-[120%] left-[50%] w-36 rounded-xl border border-black/10 overflow-hidden z-50"
        >
          {options.map((opt) => (
            <Option key={opt.label} setOpen={setOpen} Icon={opt.Icon} text={opt.label} onClick={() => { onChange(opt.label); setOpen(false); }} />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

const Option = ({ text, Icon, setOpen, onClick }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={onClick}
      className="flex items-center gap-2 w-full p-2 text-xs font-semibold whitespace-nowrap text-slate-700 transition-colors cursor-pointer rounded-lg hover:bg-gray-50 hover:text-black"
    >
      <motion.span variants={actionIconVariants} className="text-sm">
        <Icon />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  );
};

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.06,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      when: "afterChildren",
    },
  },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
};
