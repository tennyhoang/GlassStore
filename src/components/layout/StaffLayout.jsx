import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Wrench, Truck, Package, RotateCcw, Tag, Users, TrendingUp, LogOut, Eye } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './StaffLayout.module.css'

const navItems = [
  { to: '/staff',               icon: LayoutDashboard, label: 'Dashboard',        roles: ['STAFF','ADMIN','OPERATION','SHIPPER'] },
  { to: '/staff/orders',        icon: ShoppingBag, label: 'Đơn hàng',       roles: ['STAFF','ADMIN'] },
  { to: '/staff/manufacturing', icon: Wrench,      label: 'Sản xuất',       roles: ['OPERATION','STAFF','ADMIN'] },
  { to: '/staff/shipments',     icon: Truck,       label: 'Giao hàng',      roles: ['SHIPPER','STAFF','ADMIN'] },
  { to: '/staff/returns',       icon: RotateCcw,    label: 'Đổi/Trả',         roles: ['STAFF','ADMIN'] },
  { to: '/staff/reports',       icon: TrendingUp,   label: 'Báo cáo',         roles: ['ADMIN'] },
  { to: '/staff/users',         icon: Users,        label: 'Người dùng',      roles: ['ADMIN'] },
  { to: '/staff/discounts',     icon: Tag,          label: 'Khuyến mãi',      roles: ['ADMIN'] },
  { to: '/staff/products',      icon: Package,     label: 'Sản phẩm',       roles: ['STAFF','ADMIN'] },
]

export default function StaffLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }
  const accessible = navItems.filter(n => n.roles.includes(user?.role))

  return (
    <div className={styles.wrap}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Eye size={20} strokeWidth={1.5} />
          <span>GlassStore</span>
        </div>
        <div className={styles.sidebarRole}>
          <span className="badge badge-blue">{user?.role}</span>
          <span className={styles.sidebarUser}>{user?.username}</span>
        </div>
        <nav className={styles.sidebarNav}>
          {accessible.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className={styles.sidebarLogout}>
          <LogOut size={16} /> Đăng xuất
        </button>
      </aside>
      <main className={styles.main}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
