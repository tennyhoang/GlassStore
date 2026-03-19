import { useState, useEffect } from 'react'
import { shipmentApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'

const SHP_STATUSES = ['PENDING','PICKED_UP','DELIVERING','DELIVERED','FAILED']
const SHP_NEXT  = { PENDING:'PICKED_UP', PICKED_UP:'DELIVERING', DELIVERING:'DELIVERED' }
const SHP_LABEL = { PENDING:'Chờ giao', PICKED_UP:'Đã lấy', DELIVERING:'Đang giao', DELIVERED:'Hoàn thành', FAILED:'Thất bại' }
const SHP_CLS   = { PENDING:'badge-yellow', PICKED_UP:'badge-blue', DELIVERING:'badge-blue', DELIVERED:'badge-green', FAILED:'badge-red' }

export default function StaffShipmentsPage() {
  const { isShipper, user } = useAuth()
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    const p = isShipper ? shipmentApi.getMyShipments() : shipmentApi.getByStatus(statusFilter)
    p.then(r => setItems(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [statusFilter])

  const updateStatus = async (id, next) => {
    try {
      await shipmentApi.updateStatus(id, { status: next })
      toast.success('Đã cập nhật trạng thái')
      fetch()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra') }
  }

  const assignShipper = async (id) => {
    const accountId = prompt('Nhập Account ID của shipper:')
    if (!accountId) return
    try {
      await shipmentApi.assign(id, accountId)
      toast.success('Đã gán shipper')
      fetch()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra') }
  }

  return (
    <div>
      <div className={styles.pageHeader}><h2>Giao hàng</h2></div>
      {!isShipper && (
        <div className={styles.filterTabs}>
          {SHP_STATUSES.map(s => (
            <button key={s} className={`${styles.filterTab} ${statusFilter===s?styles.filterActive:''}`}
              onClick={() => setStatusFilter(s)}>{SHP_LABEL[s]}</button>
          ))}
        </div>
      )}
      {loading ? <div className={styles.loading}><span className="spinner"/></div>
      : items.length === 0 ? <div className={styles.empty}>Không có đơn giao hàng nào</div>
      : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Mã</th><th>Đơn hàng</th><th>Khách hàng</th><th>Địa chỉ</th><th>Shipper</th><th>TT</th><th>Thao tác</th></tr></thead>
            <tbody>
              {items.map(s => (
                <tr key={s.shipmentId}>
                  <td><strong>#{s.shipmentId}</strong></td>
                  <td>#{s.orderId}</td>
                  <td>{s.customerName}</td>
                  <td style={{maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.shippingAddress}</td>
                  <td>{s.shipperUsername ?? <span style={{color:'var(--gray-4)'}}>Chưa gán</span>}</td>
                  <td><span className={`badge ${SHP_CLS[s.status]}`}>{SHP_LABEL[s.status]}</span></td>
                  <td>
                    <div className={styles.actions}>
                      {!s.shipperUsername && !isShipper && (
                        <button className="btn btn-outline btn-sm" onClick={() => assignShipper(s.shipmentId)}>Gán shipper</button>
                      )}
                      {isShipper && SHP_NEXT[s.status] && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(s.shipmentId, SHP_NEXT[s.status])}>
                          → {SHP_LABEL[SHP_NEXT[s.status]]}
                        </button>
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
