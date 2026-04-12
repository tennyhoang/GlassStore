import { useState, useEffect } from 'react'
import { Package, Clock, ChevronDown } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'
import { fmtCurrency, fmtDate } from '../../utils/format'


const STATUS_MAP = {
  PENDING:        'Chờ xác nhận',
  CONFIRMED:      'Đã xác nhận',
  STOCK_RECEIVED: 'Hàng về kho',
  PROCESSING:     'Đang xử lý',
  READY:          'Sẵn sàng giao',
  DELIVERED:      'Đã giao',
  CANCELLED:      'Đã huỷ',
}

const BADGE_CLASS = {
  PENDING:'badge-yellow', CONFIRMED:'badge-blue',
  STOCK_RECEIVED:'badge-blue', PROCESSING:'badge-yellow',
  READY:'badge-green', DELIVERED:'badge-green', CANCELLED:'badge-red'
}

export default function StaffPreOrderPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('PENDING')
  const [noteModal, setNoteModal] = useState(null)
  const [note,    setNote]    = useState('')
  const [expectedDate, setExpectedDate] = useState('')

  const fetch = () => {
    api.get(`/pre-orders?status=${filter}`)
      .then(r => setOrders(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [filter])

  const updateStatus = async (id, action, withNote = false) => {
    if (withNote) {
      setNoteModal({ id, action })
      return
    }
    try {
      await api.patch(`/pre-orders/${id}/${action}`)
      toast.success('Đã cập nhật!')
      fetch()
    } catch { toast.error('Có lỗi xảy ra') }
  }

  const submitNote = async () => {
    if (!noteModal) return
    try {
      await api.patch(`/pre-orders/${noteModal.id}/${noteModal.action}`, {
        note: note || null,
        expectedDate: expectedDate ? expectedDate + 'T00:00:00' : null
      })
      toast.success('Đã cập nhật!')
      setNoteModal(null); setNote(''); setExpectedDate('')
      fetch()
    } catch { toast.error('Có lỗi xảy ra') }
  }

  const TABS = Object.entries(STATUS_MAP)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h2>Quản lý Pre-order</h2>
          <p>Đơn đặt trước sản phẩm hết hàng</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'20px',borderBottom:'1px solid var(--gray-2)',paddingBottom:0}}>
        {TABS.map(([key, label]) => (
          <button key={key}
            style={{padding:'10px 14px',fontSize:'13px',fontWeight:500,
              color: filter===key ? 'var(--ink)' : 'var(--gray-5)',
              borderBottom: filter===key ? '2px solid var(--ink)' : '2px solid transparent',
              marginBottom:'-1px'}}
            onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'60px'}}><span className="spinner"/></div>
      ) : orders.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px',color:'var(--gray-4)'}}>
          <Package size={40} strokeWidth={1}/>
          <p style={{marginTop:'12px'}}>Không có đơn nào</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th><th>Khách hàng</th><th>Sản phẩm</th>
                <th>SL</th><th>Tổng tiền</th><th>Đặt cọc</th>
                <th>Trạng thái</th><th>Ngày đặt</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.preOrderId}>
                  <td><strong>#{o.preOrderId}</strong></td>
                  <td>{o.customerName}</td>
                  <td>
                    <p style={{fontWeight:500}}>{o.productName}</p>
                    <span className={`badge ${o.productType==='FRAME'?'badge-blue':'badge-yellow'}`}>
                      {o.productType==='FRAME'?'Gọng':'Kính làm sẵn'}
                    </span>
                  </td>
                  <td>{o.quantity}</td>
                  <td style={{fontFamily:'var(--font-display)'}}>{fmtCurrency(o.totalAmount)}</td>
                  <td style={{color:'#e65100'}}>{fmtCurrency(o.depositAmount)}</td>
                  <td>
                    <span className={`badge ${BADGE_CLASS[o.status]}`}>
                      {STATUS_MAP[o.status]}
                    </span>
                  </td>
                  <td style={{fontSize:'13px',color:'var(--gray-5)'}}>
                    {fmtDate(o.createdAt)}
                  </td>
                  <td>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      {o.status === 'PENDING' && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(o.preOrderId, 'confirm', true)}>
                          Xác nhận
                        </button>
                      )}
                      {o.status === 'CONFIRMED' && (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => updateStatus(o.preOrderId, 'stock-received', true)}>
                          Hàng về kho
                        </button>
                      )}
                      {o.status === 'STOCK_RECEIVED' && (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => updateStatus(o.preOrderId, 'processing')}>
                          Xử lý
                        </button>
                      )}
                      {o.status === 'PROCESSING' && (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => updateStatus(o.preOrderId, 'ready')}>
                          Sẵn sàng giao
                        </button>
                      )}
                      {o.status === 'READY' && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(o.preOrderId, 'delivered')}>
                          Đã giao
                        </button>
                      )}
                      {!['DELIVERED','CANCELLED'].includes(o.status) && (
                        <button className="btn btn-ghost btn-sm"
                          style={{color:'var(--red)'}}
                          onClick={() => updateStatus(o.preOrderId, 'cancel', true)}>
                          Huỷ
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

      {/* Note Modal */}
      {noteModal && (
        <div className={styles.overlay} onClick={() => setNoteModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {noteModal.action === 'confirm' ? 'Xác nhận đơn' :
               noteModal.action === 'stock-received' ? 'Cập nhật hàng về kho' : 'Huỷ đơn'}
            </h3>
            {noteModal.action === 'confirm' && (
              <div className="form-group" style={{marginBottom:'12px'}}>
                <label className="form-label">Ngày dự kiến có hàng</label>
                <input className="form-input" type="date"
                  value={expectedDate} onChange={e => setExpectedDate(e.target.value)}/>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Ghi chú cho khách hàng</label>
              <textarea className="form-input" rows={3}
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Nhập ghi chú..."/>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'16px'}}>
              <button className="btn btn-ghost" onClick={() => setNoteModal(null)}>Huỷ</button>
              <button className="btn btn-primary" onClick={submitNote}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}