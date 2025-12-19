import React from "react";
import OrdersList from "../components/orders/OrderList";

const AdminOrders = () => {
    return (
        <div className="w-full">
            <div className="mt-8 mb-4 px-6 sm:px-8">
                <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900">Orders</h1>
                <p className="mt-1 text-sm text-gray-600">Search, filter, and view order details.</p>
            </div>
            <div className="px-6 sm:px-8">
                <OrdersList />
            </div>
        </div>
    );
};

export default AdminOrders;
