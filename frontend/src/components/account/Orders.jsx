import CommonBtn from "../ui/CommonBtn"
import { FiEye } from "react-icons/fi"
import { Link } from "react-router-dom"
import useOrders from "../../api/hooks/useOrders"

function Orders() {
  const { orders, loading, error } = useOrders();

  const getStatusPill = (status) => {
    const s = String(status || '').toUpperCase()
    if (s === 'CANCELLED') return 'bg-rose-50 text-rose-700 ring-rose-600/20'
    if (s === 'DELIVERED') return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    if (s === 'SHIPPED') return 'bg-sky-50 text-sky-700 ring-sky-600/20'
    if (s === 'PROCESSING') return 'bg-amber-50 text-amber-700 ring-amber-600/20'
    return 'bg-neutral-50 text-neutral-700 ring-black/10'
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Orders</h2>
        <p className="text-sm text-neutral-600">View your recent purchases</p>
      </div>

      {/* Make table horizontally scrollable on mobile */}
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        {loading && <div className="p-6 text-sm text-neutral-600">Loading orders...</div>}
        {error && <div className="p-6 text-sm text-rose-700">Failed to load orders</div>}
        {!loading && !error && (
          <table className="min-w-full divide-y divide-black/10">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 bg-white">
              {orders.map((order) => {
                const total = order.billing?.summary?.total ?? 0
                const orderId = order.orderNumber ? order.orderNumber : order.id
                return (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900">#{orderId}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{order.placed}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusPill(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                      Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <Link to={`/orders/${orderId}`} className="inline-block">
                        <CommonBtn
                          fullWidth={false}
                          noShadow
                          bgClass="bg-emerald-600 text-white hover:bg-emerald-700"
                          containerClassName="inline-block"
                          className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-1.5 text-sm font-semibold"
                        >
                          <FiEye className="text-base" />
                          <span>View</span>
                        </CommonBtn>
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-sm text-neutral-600">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Orders
