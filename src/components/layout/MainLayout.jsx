import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import styles from './MainLayout.module.css'

export default function MainLayout() {
  const { pathname } = useLocation()
  return (
    <div className={styles.wrap}>
      <Navbar />
      <main className={styles.main} style={{ paddingTop: 'var(--nav-h)' }}>
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div>
              <h4 className={styles.footerBrand}>GlassStore</h4>
              <p>Kính mắt cao cấp — Thiết kế theo đôi mắt bạn.</p>
            </div>
            <div>
              <p className={styles.footerLabel}>Sản phẩm</p>
              <a href="/shop">Gọng kính</a>
              <a href="/shop">Tròng kính</a>
              <a href="/shop">Kính làm sẵn</a>
            </div>
            <div>
              <p className={styles.footerLabel}>Dịch vụ</p>
              <a href="/eye-profiles">Đo mắt</a>
              <a href="/design">Thiết kế kính</a>
              <a href="/orders">Theo dõi đơn</a>
            </div>
            <div>
              <p className={styles.footerLabel}>Công ty</p>
              <a href="/about">Về chúng tôi</a>
              <a href="/about#contact">Liên hệ</a>
            </div>
            <div>
              <p className={styles.footerLabel}>Liên hệ</p>
              <p>📍 TP. Hồ Chí Minh</p>
              <p>📞 1800 1234</p>
              <p>✉️ hello@glassstore.vn</p>
            </div>
          </div>
          <hr className="divider" />
          <p className={styles.footerCopy}>© 2024 GlassStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
