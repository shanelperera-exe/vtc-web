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
        <div className="px-4 py-2 text-sm text-red-600 flex items-center justify-between">
          <span>Failed to load orders</span>
          <button onClick={reload} className="underline">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by Order No. or Customer"
            className="px-3 pr-10 py-2 border-3 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
            size={20}
            style={{ strokeWidth: 1.8 }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
          <button
            onClick={reload}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white text-black border-2"
            title="Reload orders"
          >
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-2 border-gray-900 overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
              <th className="p-3">Order No.</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Total (LKR)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">
                    {order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{order.customerName || 'Unknown'}</span>
                      {order.userCode && (
                        <span className="text-xs text-gray-500">{order.userCode}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {order.placed || order.placedTime ? (
                      <span>{[order.placed, order.placedTime].filter(Boolean).join(' ')}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {(() => {
                      const type = order.payment?.type || '';
                      const cardType = (order.payment?.cardType || '').toString().toUpperCase();
                      if (type.toLowerCase().includes('cash')) {
                        return (
                          <span className="inline-flex items-center gap-2">
                            <FiDollarSign />
                            <span>Cash on Delivery</span>
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
                  <td className="p-3">Rs. {Number(order.total || 0).toFixed(2)}</td>
                  <td className="p-3">
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
                        ? 'bg-yellow-100 text-yellow-700'
                        : sLower.includes('placed')
                          ? 'bg-teal-100 text-teal-800'
                          : sLower.includes('processing')
                            ? 'bg-blue-100 text-blue-700'
                            : sLower.includes('shipped')
                              ? 'bg-purple-100 text-purple-700'
                              : sLower.includes('delivered')
                                ? 'bg-green-100 text-green-700'
                                : sLower.includes('cancel')
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-red-100 text-red-700';
                      return (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClasses}`}>
                          <Icon className="inline-block mr-2 text-sm" />
                          {order.status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="flex items-center gap-2 px-3 py-1 text-sm font-medium bg-[#00bf63] text-black border-2 border-black hover:bg-black hover:text-white"
                    >
                      <FiEye />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan="7">
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
          className="flex items-center gap-2 px-3 py-2 text-black bg-white border-2"
        >
          <span className="font-medium text-sm">{value}</span>
          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-70%" }}
          className="flex flex-col gap-1 p-2 bg-white shadow-xl absolute top-[120%] left-[50%] w-32 border-2 border-black overflow-hidden z-50"
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
      className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap text-slate-700 transition-colors cursor-pointer hover:bg-[#23f47d] hover:bg-opacity-20 hover:text-black"
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
