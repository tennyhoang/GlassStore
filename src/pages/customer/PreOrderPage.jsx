import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './PreOrderPage.module.css'
import { fmtCurrency, fmtDate } from '../../utils/format'


const STATUS_MAP = {
  PENDING:        { label:'Chờ xác nhận',   color:'#f57f17', bg:'#fff8e1', icon: Clock },
  CONFIRMED:      { label:'Đã xác nhận',    color:'#1565c0', bg:'#e3f2fd', icon: CheckCircle },
  STOCK_RECEIVED: { label:'Hàng về kho',    color:'#6a1b9a', bg:'#f3e5f5', icon: Package },
  PROCESSING:     { label:'Đang xử lý',     color:'#e65100', bg:'#fff3e0', icon: Package },
  READY:          { label:'Sẵn sàng giao',  color:'#2e7d32', bg:'#e8f5e9', icon: Truck },
  DELIVERED:      { label:'Đã giao',        color:'#2e7d32', bg:'#e8f5e9', icon: CheckCircle },
  CANCELLED:      { label:'Đã huỷ',         color:'#c62828', bg:'#ffebee', icon: XCircle },
}

const STEPS = ['PENDING','CONFIRMED','STOCK_RECEIVED','PROCESSING','READY','DELIVERED']

export default function PreOrderPage() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/pre-orders/me')
      .then(r => setOrders(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải đơn đặt trước'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!confirm('Huỷ đơn đặt trước này?')) return
    try {
      await api.patch(`/pre-orders/${id}/cancel`)
      toast.success('Đã huỷ đơn')
      setOrders(os => os.map(o => o.preOrderId === id ? {...o, status:'CANCELLED'} : o))
    } catch { toast.error('Có lỗi xảy ra') }
  }

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Đơn đặt trước</h1>
          <p>Theo dõi trạng thái sản phẩm đặt trước của bạn</p>
        </div>
      </div>

      <div className="container section-sm">
        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:'80px'}}>
            <span className="spinner"/>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <Package size={48} strokeWidth={1}/>
            <h3>Chưa có đơn đặt trước nào</h3>
            <p>Khi sản phẩm hết hàng, bạn có thể đặt trước để nhận hàng sớm nhất</p>
            <a href="/shop" className="btn btn-primary">Xem sản phẩm</a>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map(order => {
              const s = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
              const Icon = s.icon
              const isExpanded = expanded === order.preOrderId
              const stepIdx = STEPS.indexOf(order.status)

              return (
                <div key={order.preOrderId} className={styles.card}>
                  <div className={styles.cardHeader}
                    onClick={() => setExpanded(isExpanded ? null : order.preOrderId)}>
                    <div className={styles.cardLeft}>
                      <span className={styles.orderId}>Pre-order #{order.preOrderId}</span>
                      <span className={styles.badge}
                        style={{background: s.bg, color: s.color}}>
                        <Icon size={13}/> {s.label}
                      </span>
                    </div>
                    <div className={styles.cardRight}>
                      <span className={styles.amount}>{fmtCurrency(order.totalAmount)}</span>
                      {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.cardBody}>
                      {/* Timeline */}
                      {order.status !== 'CANCELLED' && (
                        <div className={styles.timeline}>
                          {STEPS.map((step, i) => (
                            <div key={step} className={styles.timelineStep}>
                              <div className={`${styles.dot}
                                ${i < stepIdx ? styles.dotDone : ''}
                                ${i === stepIdx ? styles.dotActive : ''}
                              `}/>
                              {i < STEPS.length - 1 && (
                                <div className={`${styles.line} ${i < stepIdx ? styles.lineDone : ''}`}/>
                              )}
                              <span className={styles.stepLabel}>
                                {STATUS_MAP[step]?.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Info */}
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <span>Sản phẩm</span>
                          <p>{order.productName} ({order.productType === 'FRAME' ? 'Gọng kính' : 'Kính làm sẵn'})</p>
                        </div>
                        <div className={styles.infoItem}>
                          <span>Số lượng</span>
                          <p>{order.quantity}</p>
                        </div>
                        <div className={styles.infoItem}>
                          <span>Tiền đặt cọc (30%)</span>
                          <p style={{color:'#e65100',fontWeight:600}}>{fmtCurrency(order.depositAmount)}</p>
                        </div>
                        <div className={styles.infoItem}>
                          <span>Tổng tiền</span>
                          <p style={{fontWeight:600}}>{fmtCurrency(order.totalAmount)}</p>
                        </div>
                        {order.shippingAddress && (
                          <div className={styles.infoItem}>
                            <span>Địa chỉ giao</span>
                            <p>{order.shippingAddress}</p>
                          </div>
                        )}
                        {order.expectedDate && (
                          <div className={styles.infoItem}>
                            <span>Ngày dự kiến có hàng</span>
                            <p>{fmtDate(order.expectedDate)}</p>
                          </div>
                        )}
                        {order.staffNote && (
                          <div className={styles.infoItem}>
                            <span>Ghi chú từ nhân viên</span>
                            <p style={{color:'#1565c0'}}>{order.staffNote}</p>
                          </div>
                        )}
                        <div className={styles.infoItem}>
                          <span>Ngày đặt</span>
                          <p>{fmtDate(order.createdAt)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      {['PENDING','CONFIRMED'].includes(order.status) && (
                        <div style={{display:'flex',justifyContent:'flex-end',marginTop:'16px'}}>
                          <button className="btn btn-ghost btn-sm"
                            style={{color:'var(--red)',border:'1.5px solid var(--red)'}}
                            onClick={() => handleCancel(order.preOrderId)}>
                            <XCircle size={14}/> Huỷ đơn
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}