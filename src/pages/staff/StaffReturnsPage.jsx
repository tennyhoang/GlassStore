import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, PackageCheck } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'

const STATUSES = ['PENDING','APPROVED','REJECTED','COMPLETED']
const STATUS_MAP = {
  PENDING:   { label:'Chờ xử lý', cls:'badge-yellow' },
  APPROVED:  { label:'Đã duyệt',  cls:'badge-blue'   },
  REJECTED:  { label:'Từ chối',   cls:'badge-red'    },
  COMPLETED: { label:'Hoàn tất',  cls:'badge-green'  },
}
const TYPE_MAP = {
  EXCHANGE: '🔄 Đổi SP',
  REFUND:   '💰 Hoàn tiền',
  WARRANTY: '🛡️ Bảo hành',
}

export default function StaffReturnsPage() {
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // { id, action }
  const [note,    setNote]    = useState('')

  const fetch = () => {
    setLoading(true)
    api.get(`/returns?status=${statusFilter}`)
      .then(r => setItems(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [statusFilter])

  const handleAction = async () => {
    if (!modal) return
    const { id, action } = modal
    try {
      await api.patch(`/returns/${id}/${action}`, { note: note.trim() || undefined })
      const label = action === 'approve' ? 'Đã duyệt' : action === 'reject' ? 'Đã từ chối' : 'Đã hoàn tất'
      toast.success(label)
      setModal(null); setNote(''); fetch()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Yêu cầu đổi / trả</h2>
        <p style={{fontSize:'14px',color:'var(--gray-5)'}}>{items.length} yêu cầu</p>
      </div>

      <div className={styles.filterTabs}>
        {STATUSES.map(s => (
          <button key={s}
            className={`${styles.filterTab} ${statusFilter===s?styles.filterActive:''}`}
            onClick={() => setStatusFilter(s)}>
            {STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {loading ? <div className={styles.loading}><span className="spinner"/></div>
      : items.length === 0 ? <div className={styles.empty}>Không có yêu cầu nào</div>
      : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã YC</th>
                <th>Đơn hàng</th>
                <th>Khách hàng</th>
                <th>Loại</th>
                <th>Lý do</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.returnId}>
                  <td><strong>#{r.returnId}</strong></td>
                  <td>#{r.orderId}</td>
                  <td>{r.customerName}</td>
                  <td>{TYPE_MAP[r.returnType] ?? r.returnType}</td>
                  <td style={{maxWidth:'200px'}}>
                    <p style={{fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis',
                      whiteSpace:'nowrap',color:'var(--gray-5)'}}>
                      {r.reason}
                    </p>
                  </td>
                  <td style={{fontSize:'13px',color:'var(--gray-5)'}}>
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_MAP[r.status]?.cls}`}>
                      {STATUS_MAP[r.status]?.label}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {r.status === 'PENDING' && <>
                        <button className="btn btn-primary btn-sm"
                          onClick={() => { setModal({id:r.returnId,action:'approve'}); setNote('') }}>
                          <CheckCircle size={14}/> Duyệt
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}}
                          onClick={() => { setModal({id:r.returnId,action:'reject'}); setNote('') }}>
                          <XCircle size={14}/> Từ chối
                        </button>
                      </>}
                      {r.status === 'APPROVED' && (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => { setModal({id:r.returnId,action:'complete'}); setNote('') }}>
                          <PackageCheck size={14}/> Hoàn tất
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

      {/* Modal ghi chú */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>
              {modal.action === 'approve' ? '✅ Duyệt yêu cầu'
              : modal.action === 'reject' ? '❌ Từ chối yêu cầu'
              : '📦 Hoàn tất xử lý'}
            </h3>
            <p style={{fontSize:'14px',color:'var(--gray-5)',margin:'8px 0 20px'}}>
              Yêu cầu #{modal.id}
            </p>
            <div className="form-group">
              <label className="form-label">Ghi chú phản hồi cho khách (tuỳ chọn)</label>
              <textarea className="form-input" rows={3}
                value={note} onChange={e => setNote(e.target.value)}
                placeholder={
                  modal.action === 'approve' ? 'VD: Yêu cầu đã được duyệt, chúng tôi sẽ liên hệ...'
                  : modal.action === 'reject' ? 'VD: Sản phẩm không đủ điều kiện đổi/trả vì...'
                  : 'VD: Đã xử lý xong, sản phẩm mới sẽ được giao trong...'
                }
                style={{resize:'vertical'}}/>
            </div>
            <div className={styles.modalBtns}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Huỷ</button>
              <button
                className={`btn ${modal.action === 'reject' ? 'btn-outline' : 'btn-primary'}`}
                style={modal.action === 'reject' ? {color:'var(--red)',borderColor:'var(--red)'} : {}}
                onClick={handleAction}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
