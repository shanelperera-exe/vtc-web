import React from "react";
import OrdersList from "../components/orders/OrderList";

const AdminOrders = () => {
    return (
        <div className="w-full">
            <div className="mt-8 mb-4 px-8">
                <h1 className="text-6xl font-semibold text-black">Orders</h1>
            </div>
            <div className="px-8">
                <OrdersList/>
            </div>
        </div>
    );
};

export default AdminOrders;
