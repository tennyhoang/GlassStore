import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, ShoppingBag, Truck, Package,
         RotateCcw, CreditCard, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import styles from './NotificationBell.module.css'

// Icon theo type
function NotifIcon({ type }) {
  const map = {
    ORDER_PLACED:       { icon: ShoppingBag, color: '#1565c0', bg: '#e3f2fd' },
    ORDER_CONFIRMED:    { icon: Check,       color: '#2e7d32', bg: '#e8f5e9' },
    ORDER_MANUFACTURING:{ icon: Package,     color: '#6a1b9a', bg: '#f3e5f5' },
    ORDER_SHIPPING:     { icon: Truck,       color: '#0277bd', bg: '#e1f5fe' },
    ORDER_DELIVERED:    { icon: Check,       color: '#2e7d32', bg: '#e8f5e9' },
    ORDER_CANCELLED:    { icon: Info,        color: '#c62828', bg: '#ffebee' },
    RETURN_APPROVED:    { icon: RotateCcw,   color: '#2e7d32', bg: '#e8f5e9' },
    RETURN_REJECTED:    { icon: RotateCcw,   color: '#c62828', bg: '#ffebee' },
    PAYMENT_SUCCESS:    { icon: CreditCard,  color: '#2e7d32', bg: '#e8f5e9' },
    SYSTEM:             { icon: Info,        color: '#f57f17', bg: '#fff8e1' },
  }
  const cfg = map[type] ?? map.SYSTEM
  const Icon = cfg.icon
  return (
    <div className={styles.notifIcon}
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={14} strokeWidth={2}/>
    </div>
  )
}

// Format thời gian
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days} ngày trước`
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

export default function NotificationBell() {
  const [open,    setOpen]    = useState(false)
  const [notifs,  setNotifs]  = useState([])
  const [unread,  setUnread]  = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate  = useNavigate()
  const ref       = useRef()

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Poll unread count mỗi 30s
  useEffect(() => {
    const fetchUnread = () => {
      api.get('/notifications/unread')
        .then(r => setUnread(r.data.data ?? 0))
        .catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch danh sách khi mở
  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open) {
      setLoading(true)
      try {
        const res = await api.get('/notifications')
        setNotifs(res.data.data ?? [])
      } catch {}
      finally { setLoading(false) }
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setUnread(0)
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    } catch {}
  }

  const handleClick = async (notif) => {
    // Đánh dấu đã đọc
    if (!notif.read) {
      api.patch(`/notifications/${notif.notificationId}/read`).catch(() => {})
      setNotifs(prev => prev.map(n =>
        n.notificationId === notif.notificationId ? { ...n, read: true } : n))
      setUnread(u => Math.max(0, u - 1))
    }
    // Điều hướng
    if (notif.refId) {
      const orderTypes = ['ORDER_PLACED','ORDER_CONFIRMED','ORDER_MANUFACTURING','ORDER_SHIPPING','ORDER_DELIVERED','ORDER_CANCELLED','PAYMENT_SUCCESS']
      const returnTypes = ['RETURN_APPROVED','RETURN_REJECTED']
      if (orderTypes.includes(notif.type)) navigate('/orders')
      if (returnTypes.includes(notif.type)) navigate('/returns')
    }
    setOpen(false)
  }

  return (
    <div className={styles.wrap} ref={ref}>
      {/* Bell button */}
      <button className={styles.bell} onClick={handleOpen}>
        <Bell size={20} strokeWidth={1.5}/>
        {unread > 0 && (
          <span className={styles.badge}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.dropHeader}>
            <span className={styles.dropTitle}>Thông báo</span>
            {unread > 0 && (
              <button className={styles.readAllBtn} onClick={markAllRead}>
                <CheckCheck size={14}/> Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className={styles.list}>
            {loading ? (
              <div className={styles.loading}><span className="spinner"/></div>
            ) : notifs.length === 0 ? (
              <div className={styles.empty}>
                <Bell size={32} strokeWidth={1}/>
                <p>Chưa có thông báo nào</p>
              </div>
            ) : notifs.map(n => (
              <button key={n.notificationId}
                className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
                onClick={() => handleClick(n)}>
                <NotifIcon type={n.type}/>
                <div className={styles.itemContent}>
                  <p className={styles.itemTitle}>{n.title}</p>
                  <p className={styles.itemMsg}>{n.message}</p>
                  <span className={styles.itemTime}>{timeAgo(n.createdAt)}</span>
                </div>
                {!n.read && <span className={styles.unreadDot}/>}
              </button>
            ))}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className={styles.dropFooter}>
              <span style={{fontSize:'12px',color:'var(--gray-4)'}}>
                {notifs.length} thông báo
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
