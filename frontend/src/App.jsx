import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Wishlist from './pages/Wishlist';
import ProductDetails from './pages/ProductDetails';
import ProductsByCategory from './pages/ProductsByCategory';
import Checkout from './pages/Checkout';
import ShoppingCart from './pages/ShoppingCart';
import Account from './pages/Account';
import About from './pages/About';
import AccountDetails from './components/account/AccountDetails';
import Orders from './components/account/Orders';
import Addresses from './components/account/Addresses';
import OrderDetails from './pages/OrderDetails';
import OrderConfirmed from './pages/OrderConfirmed';
import AdminRoutes from './admin/routes/AdminRoutes';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Contact from './pages/Contact';
import Help from './pages/Help';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext.jsx'
import { NotificationProvider } from './components/ui/Notification';
import LoadingOverlay from './components/ui/LoadingOverlay';
import PrivateRoute from './components/auth/PrivateRoute';
import LegacyProductRedirect from './routes/LegacyProductRedirect.jsx';
import SiteLayout from './components/layout/SiteLayout.jsx';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <LoadingOverlay />
            <Routes>
              <Route element={<SiteLayout />}> 
                <Route path="/" element={<Home />} />
                {/* Product detail by SKU (also accepts numeric id as fallback) */}
                <Route path="/product/:sku" element={<ProductDetails />} />
                {/* Backward-compat: if any old links use numeric id path, redirect to SKU URL if possible */}
                <Route path="/product-id/:id" element={<LegacyProductRedirect />} />
                <Route path="/category/:category" element={<ProductsByCategory />} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/cart" element={<ShoppingCart />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/help" element={<Help />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>}>
                  <Route index element={<Navigate to="accountdetails" replace />} />
                  <Route path="accountdetails" element={<AccountDetails />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="addresses" element={<Addresses />} />
                </Route>
                <Route path="/orders/:orderNumber" element={<OrderDetails />} />
                <Route path="/order-confirmed/:orderNumber" element={<OrderConfirmed />} />
              </Route>
              {/* Keep admin login route accessible from main site in case of cross-domain redirects */}
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
