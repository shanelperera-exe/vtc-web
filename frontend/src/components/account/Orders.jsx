import CommonBtn from "../ui/CommonBtn"
import { Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { orders } from "../../assets/data"

function Orders() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-extrabold text-gray-900">Orders</h2>
        <p className="mt-1 text-sm text-gray-500">View your recent purchases</p>
      </div>

      <div className="overflow-hidden border-3 border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-md font-semibold text-gray-700">Order #</th>
              <th className="px-4 py-3 text-left text-md font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-md font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-md font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.map((order) => {
              const total = order.billing?.summary?.total ?? 0
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{order.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{order.placed}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <Link to={`/order/${order.id}`} className="inline-block">
                      <CommonBtn
                        fullWidth={false}
                        bgClass="bg-[#0bd964] text-black hover:bg-[#0bd964]/80"
                        containerClassName="inline-block"
                        className="inline-flex items-center gap-1 px-1 py-0.5 text-sm"
                      >
                        <Eye className="h-5 w-5" />
                        <span>View</span>
                      </CommonBtn>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Orders
