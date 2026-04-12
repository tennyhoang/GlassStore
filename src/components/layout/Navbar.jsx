import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, Eye, LogOut, Settings } from 'lucide-react'
import NotificationBell from '../ui/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout, isCustomer, isStaff, isOperation, isShipper } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [userOpen,    setUserOpen]    = useState(false)
  const [scrolled,    setScrolled]    = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => { logout(); setUserOpen(false); navigate('/') }

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <Eye size={22} strokeWidth={1.5} />
          <span>GlassStore</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.links}>
          <NavLink to="/"    end className={({isActive}) => isActive ? styles.active : ''}>Trang chủ</NavLink>
          <NavLink to="/about">Về chúng tôi</NavLink>
          <NavLink to="/shop"    className={({isActive}) => isActive ? styles.active : ''}>Cửa hàng</NavLink>
          {isCustomer && <>
            <NavLink to="/eye-profiles" className={({isActive}) => isActive ? styles.active : ''}>Hồ sơ mắt</NavLink>
            <NavLink to="/design"       className={({isActive}) => isActive ? styles.active : ''}>Thiết kế kính</NavLink>
          </>}
          {(isStaff || isOperation || isShipper) && (
            <NavLink to="/staff" className={({isActive}) => isActive ? styles.active : ''}>Quản lý</NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {isCustomer && (
            <>
            <NotificationBell />
            <Link to="/cart" className={styles.cartBtn}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
            </Link>
            </>
          )}

          {user && <NotificationBell />}

          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setUserOpen(o => !o)}>
                <span className={styles.avatar}>{user.username?.[0]?.toUpperCase()}</span>
                <span className={styles.userName}>{user.username}</span>
              </button>
              {userOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{user.username}</p>
                    <span className={`badge badge-blue`}>{user.role}</span>
                  </div>
                  <hr className="divider" />
                  {isCustomer && <>
                    <Link to="/profile"       onClick={() => setUserOpen(false)} className={styles.dropItem}>Thông tin tài khoản</Link>
                    <Link to="/wishlist"      onClick={() => setUserOpen(false)} className={styles.dropItem}>Yêu thích</Link>
                    <Link to="/notifications" onClick={() => setUserOpen(false)} className={styles.dropItem}>Thông báo</Link>
                    <Link to="/orders"        onClick={() => setUserOpen(false)} className={styles.dropItem}>Đơn hàng của tôi</Link>
                    <Link to="/reviews"       onClick={() => setUserOpen(false)} className={styles.dropItem}>Đánh giá của tôi</Link>
                    <Link to="/pre-orders"    onClick={() => setUserOpen(false)} className={styles.dropItem}>Đơn đặt trước</Link>
                    <Link to="/returns"       onClick={() => setUserOpen(false)} className={styles.dropItem}>Đổi / Trả hàng</Link>
                    <Link to="/my-glasses"    onClick={() => setUserOpen(false)} className={styles.dropItem}>Kính của tôi</Link>
                    <hr className="divider" />
                  </>}
                  <button onClick={handleLogout} className={`${styles.dropItem} ${styles.logout}`}>
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login"    className="btn btn-ghost btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className={styles.mobileToggle} onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <NavLink to="/"    end onClick={() => setMenuOpen(false)}>Trang chủ</NavLink>
          <NavLink to="/about">Về chúng tôi</NavLink>
          <NavLink to="/shop"    onClick={() => setMenuOpen(false)}>Cửa hàng</NavLink>
          {isCustomer && <>
            <NavLink to="/eye-profiles" onClick={() => setMenuOpen(false)}>Hồ sơ mắt</NavLink>
            <NavLink to="/design"       onClick={() => setMenuOpen(false)}>Thiết kế kính</NavLink>
            <NavLink to="/cart"         onClick={() => setMenuOpen(false)}>Giỏ hàng ({itemCount})</NavLink>
            <NavLink to="/orders"       onClick={() => setMenuOpen(false)}>Đơn hàng</NavLink>
          </>}
          {(isStaff||isOperation||isShipper) && (
            <NavLink to="/staff" onClick={() => setMenuOpen(false)}>Quản lý</NavLink>
          )}
          {!user && <>
            <NavLink to="/login"    onClick={() => setMenuOpen(false)}>Đăng nhập</NavLink>
            <NavLink to="/register" onClick={() => setMenuOpen(false)}>Đăng ký</NavLink>
          </>}
          {user && <button onClick={handleLogout}>Đăng xuất</button>}
        </div>
      )}
    </header>
  )
}