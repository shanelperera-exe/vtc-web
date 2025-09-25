import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import ProductsByCategory from './pages/ProductsByCategory';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import AccountDetails from './components/account/AccountDetails';
import Orders from './components/account/Orders';
import Addresses from './components/account/Addresses';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import RequireAdmin from './components/admin/RequireAdmin';
import AdminPanel from './components/admin/AdminPanel';
import PlaceholderSection from './components/admin/sections/PlaceholderSection';
import AdminOrders from './components/admin/orders/AdminOrders';
import AdminOrderDetails from './components/admin/orders/AdminOrderDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/:category" element={<ProductsByCategory />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />}>
          <Route index element={<Navigate to="accountdetails" replace />} />
          <Route path="accountdetails" element={<AccountDetails />} />
          <Route path="orders" element={<Orders />} />
          <Route path="addresses" element={<Addresses />} />
        </Route>
        <Route path="/order/:orderId" element={<OrderDetails />} />
        {/* Admin protected, nested routes */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminPanel />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="sales" element={<PlaceholderSection title="Sales" />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetails />} />
            <Route path="products" element={<PlaceholderSection title="Products" />} />
            <Route path="tags" element={<PlaceholderSection title="Tags" />} />
            <Route path="analytics" element={<PlaceholderSection title="Analytics" />} />
            <Route path="members" element={<PlaceholderSection title="Members" />} />
            <Route path="settings" element={<PlaceholderSection title="Settings" />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
