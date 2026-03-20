import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout
import MainLayout  from './components/layout/MainLayout'
import StaffLayout from './components/layout/StaffLayout'

// Public pages
import HomePage        from './pages/HomePage'
import ShopPage        from './pages/ShopPage'
import FrameDetailPage from './pages/FrameDetailPage'
import AboutPage       from './pages/AboutPage'
import LoginPage       from './pages/auth/LoginPage'
import RegisterPage    from './pages/auth/RegisterPage'

// Customer pages
import EyeProfilePage   from './pages/customer/EyeProfilePage'
import DesignPage       from './pages/customer/DesignPage'
import CartPage         from './pages/customer/CartPage'
import CheckoutPage     from './pages/customer/CheckoutPage'
import OrdersPage       from './pages/customer/OrdersPage'
import MyGlassesPage    from './pages/customer/MyGlassesPage'
import ProfilePage      from './pages/customer/ProfilePage'
import WishlistPage     from './pages/customer/WishlistPage'
import NotificationsPage from './pages/customer/NotificationsPage'
import MyReviewsPage    from './pages/customer/MyReviewsPage'
import ReturnPage       from './pages/customer/ReturnPage'
import PreOrderPage     from './pages/customer/PreOrderPage'
import CreatePreOrderPage from './pages/customer/CreatePreOrderPage'
import StaffPreOrderPage from './pages/staff/StaffPreOrderPage'

// Staff pages
import StaffDashboardPage     from './pages/staff/StaffDashboardPage'
import StaffOrdersPage        from './pages/staff/StaffOrdersPage'
import StaffManufacturingPage from './pages/staff/StaffManufacturingPage'
import StaffShipmentsPage     from './pages/staff/StaffShipmentsPage'
import StaffProductsPage      from './pages/staff/StaffProductsPage'
import StaffReturnsPage       from './pages/staff/StaffReturnsPage'
import StaffDiscountPage      from './pages/staff/StaffDiscountPage'
import StaffUsersPage         from './pages/staff/StaffUsersPage'
import StaffReportPage        from './pages/staff/StaffReportPage'

// Guards
function RequireAuth({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* ── Public + Customer ── */}
      <Route element={<MainLayout />}>
        <Route index             element={<HomePage />} />
        <Route path="shop"       element={<ShopPage />} />
        <Route path="frames/:id" element={<FrameDetailPage />} />
        <Route path="about"      element={<AboutPage />} />
        <Route path="login"      element={<LoginPage />} />
        <Route path="register"   element={<RegisterPage />} />

        {/* Customer only */}
        <Route path="eye-profiles" element={
          <RequireAuth roles={['CUSTOMER']}><EyeProfilePage /></RequireAuth>
        }/>
        <Route path="design" element={
          <RequireAuth roles={['CUSTOMER']}><DesignPage /></RequireAuth>
        }/>
        <Route path="cart" element={
          <RequireAuth roles={['CUSTOMER']}><CartPage /></RequireAuth>
        }/>
        <Route path="checkout" element={
          <RequireAuth roles={['CUSTOMER']}><CheckoutPage /></RequireAuth>
        }/>
        <Route path="orders" element={
          <RequireAuth roles={['CUSTOMER']}><OrdersPage /></RequireAuth>
        }/>
        <Route path="my-glasses" element={
          <RequireAuth roles={['CUSTOMER']}><MyGlassesPage /></RequireAuth>
        }/>
        <Route path="profile" element={
          <RequireAuth roles={['CUSTOMER']}><ProfilePage /></RequireAuth>
        }/>
        <Route path="wishlist" element={
          <RequireAuth roles={['CUSTOMER']}><WishlistPage /></RequireAuth>
        }/>
        <Route path="reviews" element={
          <RequireAuth roles={['CUSTOMER']}><MyReviewsPage /></RequireAuth>
        }/>
        <Route path="returns" element={
          <RequireAuth roles={['CUSTOMER']}><ReturnPage /></RequireAuth>
        }/>
        <Route path="pre-orders" element={
          <RequireAuth roles={['CUSTOMER']}><PreOrderPage /></RequireAuth>
        }/>
        <Route path="pre-order" element={
          <RequireAuth roles={['CUSTOMER']}><CreatePreOrderPage /></RequireAuth>
        }/>
        <Route path="notifications" element={
          <RequireAuth roles={['CUSTOMER','STAFF','ADMIN','OPERATION','SHIPPER']}>
            <NotificationsPage />
          </RequireAuth>
        }/>
      </Route>

      {/* ── Staff / Admin / Operation / Shipper ── */}
      <Route path="staff" element={
        <RequireAuth roles={['STAFF','ADMIN','OPERATION','SHIPPER']}>
          <StaffLayout />
        </RequireAuth>
      }>
        <Route index                  element={<StaffDashboardPage />} />
        <Route path="orders"          element={<StaffOrdersPage />} />
        <Route path="manufacturing"   element={<StaffManufacturingPage />} />
        <Route path="shipments"       element={<StaffShipmentsPage />} />
        <Route path="products"        element={<StaffProductsPage />} />
        <Route path="returns"         element={<StaffReturnsPage />} />
        <Route path="discounts"       element={<StaffDiscountPage />} />
        <Route path="users"           element={<StaffUsersPage />} />
        <Route path="reports"         element={<StaffReportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}