import { useState, useEffect } from 'react'
import { Plus, PackageX, ChevronDown, ChevronUp } from 'lucide-react'
import api, { orderApi } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './ReturnPage.module.css'

const RETURN_TYPES = [
  { value: 'EXCHANGE', label: '🔄 Đổi sản phẩm' },
  { value: 'REFUND',   label: '💰 Hoàn tiền' },
  { value: 'WARRANTY', label: '🛡️ Bảo hành' },
]

const STATUS_MAP = {
  PENDING:   { label: 'Chờ xử lý',  cls: 'badge-yellow' },
  APPROVED:  { label: 'Đã duyệt',   cls: 'badge-blue'   },
  REJECTED:  { label: 'Từ chối',    cls: 'badge-red'    },
  COMPLETED: { label: 'Hoàn tất',   cls: 'badge-green'  },
}

const TYPE_MAP = {
  EXCHANGE: '🔄 Đổi sản phẩm',
  REFUND:   '💰 Hoàn tiền',
  WARRANTY: '🛡️ Bảo hành',
}

export default function ReturnPage() {
  const [returns,  setReturns]  = useState([])
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const fetchReturns = () => {
    api.get('/returns/me')
      .then(r => setReturns(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Lấy đơn hàng DELIVERED để chọn khi tạo yêu cầu
    orderApi.getMyOrders()
      .then(r => setOrders((r.data.data ?? []).filter(o => o.status === 'DELIVERED')))
      .catch(() => {})
    fetchReturns()
  }, [])

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <h1>Đổi / Trả hàng</h1>
              <p>Yêu cầu đổi, trả hoặc bảo hành sản phẩm</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
              <Plus size={15}/> Tạo yêu cầu
            </button>
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {/* Form tạo yêu cầu */}
        {showForm && (
          <CreateReturnForm
            orders={orders}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); fetchReturns() }}
          />
        )}

        {/* Danh sách yêu cầu */}
        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:'60px'}}>
            <span className="spinner"/>
          </div>
        ) : returns.length === 0 ? (
          <div className={styles.empty}>
            <PackageX size={48} strokeWidth={1}/>
            <h3>Chưa có yêu cầu đổi/trả</h3>
            <p>Bạn có thể tạo yêu cầu đổi/trả với các đơn hàng đã giao</p>
          </div>
        ) : (
          <div className={styles.list}>
            {returns.map(r => (
              <div key={r.returnId} className={styles.returnCard}>
                <div className={styles.cardHeader}
                  onClick={() => setExpanded(expanded === r.returnId ? null : r.returnId)}>
                  <div className={styles.cardMeta}>
                    <span className={styles.returnId}>#{r.returnId}</span>
                    <span className={styles.orderRef}>Đơn #{r.orderId}</span>
                    <span className={`badge ${STATUS_MAP[r.status]?.cls}`}>
                      {STATUS_MAP[r.status]?.label}
                    </span>
                    <span className={styles.typeBadge}>{TYPE_MAP[r.returnType]}</span>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={styles.date}>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {expanded === r.returnId
                      ? <ChevronUp size={18} style={{color:'var(--gray-4)'}}/>
                      : <ChevronDown size={18} style={{color:'var(--gray-4)'}}/>}
                  </div>
                </div>

                {expanded === r.returnId && (
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <span>Lý do yêu cầu:</span>
                      <p>{r.reason}</p>
                    </div>
                    {r.staffNote && (
                      <div className={`${styles.infoRow} ${styles.staffNote}`}>
                        <span>Phản hồi từ nhân viên:</span>
                        <p>{r.staffNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Form tạo yêu cầu ── */
function CreateReturnForm({ orders, onClose, onSaved }) {
  const [form, setForm] = useState({
    orderId:    '',
    returnType: 'EXCHANGE',
    reason:     '',
  })
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.orderId)       { toast.error('Vui lòng chọn đơn hàng');    return }
    if (!form.reason.trim()) { toast.error('Vui lòng nhập lý do yêu cầu'); return }
    if (form.reason.length < 20) { toast.error('Lý do phải ít nhất 20 ký tự'); return }
    try {
      setBusy(true)
      await api.post('/returns', {
        orderId:    Number(form.orderId),
        returnType: form.returnType,
        reason:     form.reason.trim(),
      })
      toast.success('Đã gửi yêu cầu đổi/trả!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Tạo yêu cầu đổi / trả</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Đóng</button>
      </div>

      {orders.length === 0 ? (
        <div className={styles.noOrders}>
          <p>Bạn chưa có đơn hàng đã giao để yêu cầu đổi/trả.</p>
          <p style={{fontSize:'13px',color:'var(--gray-4)',marginTop:'4px'}}>
            Chỉ đơn hàng có trạng thái <strong>"Đã giao"</strong> mới có thể đổi/trả.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Chọn đơn hàng */}
          <div className="form-group">
            <label className="form-label">Đơn hàng cần đổi/trả <span style={{color:'red'}}>*</span></label>
            <select className="form-input" value={form.orderId} onChange={set('orderId')}>
              <option value="">-- Chọn đơn hàng --</option>
              {orders.map(o => (
                <option key={o.orderId} value={o.orderId}>
                  Đơn #{o.orderId} — {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                  {' '}({new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(o.finalAmount)})
                </option>
              ))}
            </select>
          </div>

          {/* Loại yêu cầu */}
          <div className="form-group">
            <label className="form-label">Loại yêu cầu <span style={{color:'red'}}>*</span></label>
            <div className={styles.typeGrid}>
              {RETURN_TYPES.map(t => (
                <label key={t.value}
                  className={`${styles.typeCard} ${form.returnType === t.value ? styles.typeActive : ''}`}>
                  <input type="radio" name="returnType" value={t.value}
                    checked={form.returnType === t.value}
                    onChange={() => setForm(f => ({ ...f, returnType: t.value }))}/>
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lý do */}
          <div className="form-group">
            <label className="form-label">Lý do yêu cầu <span style={{color:'red'}}>*</span></label>
            <textarea className="form-input" rows={4}
              value={form.reason} onChange={set('reason')}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải (tối thiểu 20 ký tự)..."
              style={{resize:'vertical'}}/>
            <span style={{fontSize:'12px',color: form.reason.length < 20 ? 'var(--gray-4)' : '#2e7d32'}}>
              {form.reason.length}/20 ký tự tối thiểu
            </span>
          </div>

          {/* Lưu ý */}
          <div className={styles.notice}>
            <strong>Lưu ý:</strong> Yêu cầu sẽ được nhân viên xem xét trong 1-3 ngày làm việc.
            Sản phẩm cần còn nguyên vẹn, chưa qua sử dụng quá nhiều.
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:'8px'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <span className="spinner"/> : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
