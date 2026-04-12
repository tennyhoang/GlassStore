import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Package, RotateCcw, Info, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './NotificationsPage.module.css'

const TYPE_CONFIG = {
  ORDER_UPDATE:  { icon: Package,   color: '#1565c0', bg: '#e3f2fd', label: 'Đơn hàng'  },
  RETURN_UPDATE: { icon: RotateCcw, color: '#f57f17', bg: '#fff8e1', label: 'Đổi/Trả'   },
  SYSTEM:        { icon: Info,      color: '#6a1b9a', bg: '#f3e5f5', label: 'Hệ thống'  },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return 'Vừa xong'
  if (diff < 3600)  return `${Math.floor(diff/60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`
  if (diff < 604800)return `${Math.floor(diff/86400)} ngày trước`
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all') // all | unread
  const navigate = useNavigate()

  const fetch = () => {
    api.get('/notifications')
      .then(r => setNotifs(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải thông báo'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifs(ns => ns.map(n => ({...n, read: true})))
      toast.success('Đã đọc tất cả thông báo')
    } catch { toast.error('Có lỗi xảy ra') }
  }

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifs(ns => ns.map(n => n.notificationId === id ? {...n, read: true} : n))
    } catch {}
  }

  const deleteOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifs(ns => ns.filter(n => n.notificationId !== id))
      toast.success('Đã xoá thông báo')
    } catch { toast.error('Có lỗi xảy ra') }
  }

  const handleClick = (n) => {
    if (!n.read) markRead(n.notificationId)
    if (n.type === 'ORDER_UPDATE')  navigate('/orders')
    if (n.type === 'RETURN_UPDATE') navigate('/returns')
  }

  const unreadCount = notifs.filter(n => !n.read).length
  const displayed   = filter === 'unread' ? notifs.filter(n => !n.read) : notifs

  // Group theo ngày
  const grouped = displayed.reduce((acc, n) => {
    const date = new Date(n.createdAt).toLocaleDateString('vi-VN')
    if (!acc[date]) acc[date] = []
    acc[date].push(n)
    return acc
  }, {})

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <h1>Thông báo</h1>
              <p>{unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}</p>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-outline btn-sm" onClick={markAllRead}>
                <CheckCheck size={15}/> Đọc tất cả
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {/* Filter tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
            onClick={() => setFilter('all')}>
            Tất cả ({notifs.length})
          </button>
          <button
            className={`${styles.tab} ${filter === 'unread' ? styles.tabActive : ''}`}
            onClick={() => setFilter('unread')}>
            Chưa đọc ({unreadCount})
          </button>
        </div>

        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:'60px'}}>
            <span className="spinner"/>
          </div>
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={48} strokeWidth={1}/>
            <h3>{filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}</h3>
            {filter === 'unread' && (
              <button className="btn btn-ghost btn-sm" onClick={() => setFilter('all')}>
                Xem tất cả
              </button>
            )}
          </div>
        ) : (
          <div className={styles.list}>
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <p className={styles.dateLabel}>{date}</p>
                {items.map(n => {
                  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM
                  const Icon = cfg.icon
                  return (
                    <div key={n.notificationId}
                      className={`${styles.notifCard} ${!n.read ? styles.unread : ''}`}
                      onClick={() => handleClick(n)}>
                      {/* Icon */}
                      <div className={styles.iconBox}
                        style={{background: cfg.bg, color: cfg.color}}>
                        <Icon size={18} strokeWidth={1.5}/>
                      </div>

                      {/* Content */}
                      <div className={styles.content}>
                        <div className={styles.topRow}>
                          <span className={styles.typeTag}
                            style={{background: cfg.bg, color: cfg.color}}>
                            {cfg.label}
                          </span>
                          <span className={styles.time}>{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className={styles.title}>{n.title}</p>
                        <p className={styles.message}>{n.message}</p>
                      </div>

                      {/* Actions */}
                      <div className={styles.actions} onClick={e => e.stopPropagation()}>
                        {!n.read && (
                          <button className={styles.actionBtn} title="Đánh dấu đã đọc"
                            onClick={() => markRead(n.notificationId)}>
                            <Check size={14}/>
                          </button>
                        )}
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Xoá" onClick={() => deleteOne(n.notificationId)}>
                          <Trash2 size={14}/>
                        </button>
                      </div>

                      {!n.read && <span className={styles.unreadDot}/>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
