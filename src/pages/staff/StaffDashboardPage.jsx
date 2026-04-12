import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, Users, Package, DollarSign, ArrowUp, ArrowDown } from 'lucide-react'
import { orderApi, productApi } from '../../services/api'
import api from '../../services/api'
import styles from './StaffDashboardPage.module.css'
import { fmtCurrency, fmtDate } from '../../utils/format'
import Skeleton from '../../components/ui/Skeleton'


export default function StaffDashboardPage() {
  const [stats,   setStats]   = useState(null)
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      // Lấy tất cả đơn hàng các trạng thái
      orderApi.getByStatus('PENDING').then(r => r.data.data ?? []),
      orderApi.getByStatus('CONFIRMED').then(r => r.data.data ?? []),
      orderApi.getByStatus('MANUFACTURING').then(r => r.data.data ?? []),
      orderApi.getByStatus('SHIPPING').then(r => r.data.data ?? []),
      orderApi.getByStatus('DELIVERED').then(r => r.data.data ?? []),
      orderApi.getByStatus('CANCELLED').then(r => r.data.data ?? []),
    ]).then(([pending, confirmed, manufacturing, shipping, delivered, cancelled]) => {
      const allOrders = [...pending, ...confirmed, ...manufacturing, ...shipping, ...delivered, ...cancelled]

      // Tính doanh thu từ đơn DELIVERED
      const revenue = delivered.reduce((s, o) => s + (o.finalAmount ?? 0), 0)

      // Recent orders = 10 đơn mới nhất
      const recent = allOrders
        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)

      setOrders(recent)
      setStats({
        totalRevenue:   revenue,
        totalOrders:    allOrders.length,
        pending:        pending.length,
        confirmed:      confirmed.length,
        manufacturing:  manufacturing.length,
        shipping:       shipping.length,
        delivered:      delivered.length,
        cancelled:      cancelled.length,
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="container" style={{paddingTop:'40px'}}>
      <Skeleton.StatGrid />
      <div style={{marginTop:'24px'}}><Skeleton.Table rows={6} cols={5} /></div>
    </div>
  )

  const cards = [
    {
      label: 'Doanh thu (đã giao)',
      value: fmtCurrency(stats?.totalRevenue),
      icon: DollarSign,
      color: '#2e7d32',
      bg: '#e8f5e9',
    },
    {
      label: 'Tổng đơn hàng',
      value: stats?.totalOrders,
      icon: ShoppingBag,
      color: '#1565c0',
      bg: '#e3f2fd',
    },
    {
      label: 'Đang xử lý',
      value: (stats?.pending ?? 0) + (stats?.confirmed ?? 0) + (stats?.manufacturing ?? 0),
      icon: Package,
      color: '#f57f17',
      bg: '#fff8e1',
    },
    {
      label: 'Đang giao hàng',
      value: stats?.shipping ?? 0,
      icon: TrendingUp,
      color: '#6a1b9a',
      bg: '#f3e5f5',
    },
  ]

  const STATUS_MAP = {
    PENDING:       { label:'Chờ xác nhận', cls:'badge-yellow' },
    CONFIRMED:     { label:'Đã xác nhận',  cls:'badge-blue'   },
    MANUFACTURING: { label:'Sản xuất',     cls:'badge-blue'   },
    SHIPPING:      { label:'Giao hàng',    cls:'badge-blue'   },
    DELIVERED:     { label:'Hoàn thành',   cls:'badge-green'  },
    CANCELLED:     { label:'Đã huỷ',       cls:'badge-red'    },
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Dashboard</h2>
          <p>Tổng quan hoạt động kinh doanh</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className={styles.cardGrid}>
        {cards.map((c, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{background: c.bg, color: c.color}}>
              <c.icon size={22} strokeWidth={1.5}/>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>{c.label}</p>
              <p className={styles.statValue}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order status breakdown */}
      <div className={styles.row2}>
        {/* Biểu đồ tròn bằng CSS */}
        <div className={styles.section}>
          <h4>Phân bổ đơn hàng theo trạng thái</h4>
          <div className={styles.statusList}>
            {[
              { label:'Chờ xác nhận', count: stats?.pending,       color:'#f57f17' },
              { label:'Đã xác nhận',  count: stats?.confirmed,     color:'#1565c0' },
              { label:'Sản xuất',     count: stats?.manufacturing, color:'#6a1b9a' },
              { label:'Giao hàng',    count: stats?.shipping,      color:'#0277bd' },
              { label:'Hoàn thành',   count: stats?.delivered,     color:'#2e7d32' },
              { label:'Đã huỷ',       count: stats?.cancelled,     color:'#c62828' },
            ].map((s, i) => {
              const pct = stats?.totalOrders > 0
                ? Math.round((s.count / stats.totalOrders) * 100) : 0
              return (
                <div key={i} className={styles.statusRow}>
                  <div className={styles.statusDot} style={{background: s.color}}/>
                  <span className={styles.statusLabel}>{s.label}</span>
                  <div className={styles.statusBar}>
                    <div className={styles.statusFill}
                      style={{width: `${pct}%`, background: s.color}}/>
                  </div>
                  <span className={styles.statusCount}>{s.count}</span>
                  <span className={styles.statusPct}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Đơn hàng gần đây */}
        <div className={styles.section}>
          <h4>Đơn hàng gần đây</h4>
          <div className={styles.recentOrders}>
            {orders.length === 0 ? (
              <p style={{color:'var(--gray-4)',textAlign:'center',padding:'20px'}}>Chưa có đơn hàng</p>
            ) : orders.map(o => (
              <div key={o.orderId} className={styles.orderRow}>
                <div>
                  <span className={styles.orderId}>#{o.orderId}</span>
                  <span className={styles.orderCustomer}>{o.customerName}</span>
                </div>
                <div className={styles.orderRight}>
                  <span className={`badge ${STATUS_MAP[o.status]?.cls ?? 'badge-gray'}`}>
                    {STATUS_MAP[o.status]?.label ?? o.status}
                  </span>
                  <span className={styles.orderAmount}>{fmtCurrency(o.finalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tóm tắt nhanh */}
      <div className={styles.section} style={{marginTop:'0'}}>
        <h4>Tóm tắt</h4>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <p className={styles.summaryLabel}>Tỷ lệ hoàn thành</p>
            <p className={styles.summaryValue} style={{color:'#2e7d32'}}>
              {stats?.totalOrders > 0
                ? Math.round((stats.delivered / stats.totalOrders) * 100)
                : 0}%
            </p>
          </div>
          <div className={styles.summaryItem}>
            <p className={styles.summaryLabel}>Tỷ lệ huỷ</p>
            <p className={styles.summaryValue} style={{color:'#c62828'}}>
              {stats?.totalOrders > 0
                ? Math.round((stats.cancelled / stats.totalOrders) * 100)
                : 0}%
            </p>
          </div>
          <div className={styles.summaryItem}>
            <p className={styles.summaryLabel}>Đơn đã giao</p>
            <p className={styles.summaryValue}>{stats?.delivered ?? 0}</p>
          </div>
          <div className={styles.summaryItem}>
            <p className={styles.summaryLabel}>Doanh thu TB / đơn</p>
            <p className={styles.summaryValue}>
              {stats?.delivered > 0
                ? fmtCurrency(Math.round(stats.totalRevenue / stats.delivered))
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
