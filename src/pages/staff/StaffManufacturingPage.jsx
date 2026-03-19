import { useState, useEffect } from 'react'
import { manufacturingApi } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'

const MFG_STATUSES = ['PENDING','IN_PROGRESS','COMPLETED']
const MFG_NEXT = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED' }
const MFG_LABEL = { PENDING:'Chờ SX', IN_PROGRESS:'Đang SX', COMPLETED:'Hoàn thành' }
const MFG_CLS   = { PENDING:'badge-yellow', IN_PROGRESS:'badge-blue', COMPLETED:'badge-green' }

export default function StaffManufacturingPage() {
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    manufacturingApi.getByStatus(statusFilter)
      .then(r => setItems(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [statusFilter])

  const updateStatus = async (id, next) => {
    try {
      await manufacturingApi.updateStatus(id, { status: next })
      toast.success('Đã cập nhật trạng thái')
      fetch()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra') }
  }

  return (
    <div>
      <div className={styles.pageHeader}><h2>Lệnh sản xuất</h2></div>
      <div className={styles.filterTabs}>
        {MFG_STATUSES.map(s => (
          <button key={s} className={`${styles.filterTab} ${statusFilter===s?styles.filterActive:''}`}
            onClick={() => setStatusFilter(s)}>{MFG_LABEL[s]}</button>
        ))}
      </div>
      {loading ? <div className={styles.loading}><span className="spinner"/></div>
      : items.length === 0 ? <div className={styles.empty}>Không có lệnh sản xuất nào</div>
      : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Mã</th><th>Đơn hàng</th><th>Khách hàng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {items.map(m => (
                <tr key={m.manufacturingId}>
                  <td><strong>#{m.manufacturingId}</strong></td>
                  <td>#{m.orderId}</td>
                  <td>{m.customerName}</td>
                  <td><span className={`badge ${MFG_CLS[m.status]}`}>{MFG_LABEL[m.status]}</span></td>
                  <td>
                    {MFG_NEXT[m.status] && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => updateStatus(m.manufacturingId, MFG_NEXT[m.status])}>
                        → {MFG_LABEL[MFG_NEXT[m.status]]}
                      </button>
                    )}
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
