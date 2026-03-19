import { useState, useEffect } from 'react'
import { orderApi, manufacturingApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'

function fmt(n) { return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '—' }

const STATUS_MAP = {
  PENDING:       { label:'Chờ xác nhận', cls:'badge-yellow' },
  CONFIRMED:     { label:'Đã xác nhận',  cls:'badge-blue' },
  MANUFACTURING: { label:'Sản xuất',     cls:'badge-blue' },
  SHIPPING:      { label:'Giao hàng',    cls:'badge-blue' },
  DELIVERED:     { label:'Hoàn thành',   cls:'badge-green' },
  CANCELLED:     { label:'Đã huỷ',       cls:'badge-red' },
}
const ORDER_STATUSES = ['PENDING','CONFIRMED','MANUFACTURING','SHIPPING','DELIVERED','CANCELLED']

export default function StaffOrdersPage() {
  const { isAdmin, isStaff } = useAuth()
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    setLoading(true)
    orderApi.getByStatus(statusFilter)
      .then(r => setOrders(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải đơn hàng'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchOrders() }, [statusFilter])

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, { status: newStatus })
      toast.success('Đã cập nhật trạng thái')
      fetchOrders()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra') }
  }

  const createMfg = async (orderId) => {
    try {
      await manufacturingApi.create(orderId)
      toast.success('Đã tạo lệnh sản xuất')
      fetchOrders()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra') }
  }

  const cancelOrder = async (orderId) => {
    if (!confirm('Huỷ đơn hàng này?')) return
    try {
      await orderApi.cancel(orderId)
      toast.success('Đã huỷ đơn hàng')
      fetchOrders()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra') }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Quản lý đơn hàng</h2>
        <p>{orders.length} đơn</p>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        {ORDER_STATUSES.map(s => (
          <button key={s}
            className={`${styles.filterTab} ${statusFilter === s ? styles.filterActive : ''}`}
            onClick={() => setStatusFilter(s)}>
            {STATUS_MAP[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}><span className="spinner"/></div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>Không có đơn hàng nào</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th>
                <th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.orderId}>
                  <td><strong>#{o.orderId}</strong></td>
                  <td>{o.customerName}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{fontFamily:'var(--font-display)'}}>{fmt(o.finalAmount)}</td>
                  <td><span className={`badge ${STATUS_MAP[o.status]?.cls}`}>{STATUS_MAP[o.status]?.label}</span></td>
                  <td>
                    <div className={styles.actions}>
                      {o.status === 'PENDING' && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(o.orderId, 'CONFIRMED')}>Xác nhận</button>
                      )}
                      {o.status === 'CONFIRMED' && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => createMfg(o.orderId)}>Tạo lệnh SX</button>
                      )}
                      {['PENDING','CONFIRMED'].includes(o.status) && (
                        <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}}
                          onClick={() => cancelOrder(o.orderId)}>Huỷ</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
