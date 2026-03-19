import { useState, useEffect } from 'react'
import { Package, ChevronDown, ChevronUp, XCircle, Printer } from 'lucide-react'
import { orderApi, paymentApi } from '../../services/api'
import OrderTimeline from '../../components/ui/OrderTimeline'
import toast from 'react-hot-toast'
import styles from './OrdersPage.module.css'

function fmt(n) {
  return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '—'
}

const STATUS_MAP = {
  PENDING:       { label:'Chờ xác nhận', cls:'badge-yellow' },
  CONFIRMED:     { label:'Đã xác nhận',  cls:'badge-blue'   },
  MANUFACTURING: { label:'Đang sản xuất',cls:'badge-blue'   },
  SHIPPING:      { label:'Đang giao',    cls:'badge-blue'   },
  DELIVERED:     { label:'Đã giao',      cls:'badge-green'  },
  CANCELLED:     { label:'Đã huỷ',       cls:'badge-red'    },
}

export default function OrdersPage() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [tabStatus,setTabStatus]= useState('all')

  const fetchOrders = () => {
    orderApi.getMyOrders()
      .then(r => setOrders(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải đơn hàng'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchOrders() }, [])

  const handleCancel = async (orderId) => {
    if (!confirm('Huỷ đơn hàng này?')) return
    try {
      await orderApi.cancel(orderId)
      toast.success('Đã huỷ đơn hàng')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    }
  }

  const TABS = [
    { key:'all',           label:'Tất cả' },
    { key:'PENDING',       label:'Chờ xác nhận' },
    { key:'CONFIRMED',     label:'Đã xác nhận'  },
    { key:'MANUFACTURING', label:'Sản xuất'      },
    { key:'SHIPPING',      label:'Đang giao'     },
    { key:'DELIVERED',     label:'Hoàn thành'    },
    { key:'CANCELLED',     label:'Đã huỷ'        },
  ]

  const filtered = tabStatus === 'all'
    ? orders
    : orders.filter(o => o.status === tabStatus)

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Đơn hàng của tôi</h1>
          <p>{orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Status tabs */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t.key}
              className={`${styles.tab} ${tabStatus === t.key ? styles.tabActive : ''}`}
              onClick={() => setTabStatus(t.key)}>
              {t.label}
              {t.key !== 'all' && (
                <span className={styles.tabCount}>
                  {orders.filter(o => o.status === t.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:'80px'}}>
            <span className="spinner"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Package size={48} strokeWidth={1}/>
            <h3>Không có đơn hàng nào</h3>
            <p>Hãy đặt hàng để xem lịch sử tại đây</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map(order => {
              const s = STATUS_MAP[order.status] ?? { label: order.status, cls: 'badge-gray' }
              const isExpanded = expanded === order.orderId

              return (
                <div key={order.orderId} className={styles.orderCard}>
                  {/* Header */}
                  <div className={styles.orderHeader}
                    onClick={() => setExpanded(isExpanded ? null : order.orderId)}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>#{order.orderId}</span>
                      <span className={`badge ${s.cls}`}>{s.label}</span>
                      <span className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={styles.orderTotal}>{fmt(order.finalAmount)}</span>
                      {isExpanded
                        ? <ChevronUp size={18} style={{color:'var(--gray-4)'}}/>
                        : <ChevronDown size={18} style={{color:'var(--gray-4)'}}/>}
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div className={styles.orderBody}>
                      {/* Timeline */}
                      <div className={styles.timelineWrap}>
                        <p className={styles.sectionLabel}>Trạng thái đơn hàng</p>
                        <OrderTimeline order={order}/>
                      </div>

                      {/* Order info */}
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <span>Địa chỉ giao hàng</span>
                          <p>{order.shippingAddress}</p>
                        </div>
                        {order.discountCode && (
                          <div className={styles.infoItem}>
                            <span>Mã giảm giá</span>
                            <p>{order.discountCode} (-{fmt(order.discountAmount)})</p>
                          </div>
                        )}
                        {order.note && (
                          <div className={styles.infoItem}>
                            <span>Ghi chú</span>
                            <p>{order.note}</p>
                          </div>
                        )}
                        <div className={styles.infoItem}>
                          <span>Tổng tiền</span>
                          <p style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',fontWeight:600}}>
                            {fmt(order.finalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      {order.items?.length > 0 && (
                        <div className={styles.itemList}>
                          <p className={styles.sectionLabel}>Sản phẩm</p>
                          {order.items.map(item => (
                            <div key={item.orderItemId} className={styles.itemRow}>
                              <span className={`badge ${item.itemType==='CUSTOM_GLASSES'?'badge-blue':'badge-yellow'}`}>
                                {item.itemType==='CUSTOM_GLASSES' ? 'Thiết kế' : 'Làm sẵn'}
                              </span>
                              <span style={{flex:1,fontSize:'14px'}}>
                                {item.designName ?? item.productName ?? `Sản phẩm #${item.orderItemId}`}
                              </span>
                              <span style={{fontSize:'13px',color:'var(--gray-5)'}}>
                                x{item.quantity}
                              </span>
                              <span style={{fontFamily:'var(--font-display)'}}>
                                {fmt(item.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className={styles.orderActions}>
                        {['PENDING','CONFIRMED'].includes(order.status) && (
                          <button className="btn btn-ghost btn-sm"
                            style={{color:'var(--red)',borderColor:'var(--red)',border:'1.5px solid'}}
                            onClick={() => handleCancel(order.orderId)}>
                            <XCircle size={15}/> Huỷ đơn hàng
                          </button>
                        )}
                        {order.status === 'DELIVERED' && (
                          <a href="/returns" className="btn btn-outline btn-sm">
                            Yêu cầu đổi/trả
                          </a>
                        )}
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => printOrder(order)}
                          title="In đơn hàng">
                          <Printer size={15}/> In đơn
                        </button>
                      </div>
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

// ── Hàm in đơn hàng ──
export function printOrder(order) {
  function fmt(n) { return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '—' }
  const STATUS = {
    PENDING:'Chờ xác nhận',CONFIRMED:'Đã xác nhận',MANUFACTURING:'Đang sản xuất',
    SHIPPING:'Đang giao',DELIVERED:'Đã giao',CANCELLED:'Đã huỷ'
  }
  const html = `
<html><head><meta charset="utf-8"><title>Đơn hàng #${order.orderId}</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 14px; color: #1a1a2e; padding: 40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 32px; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; }
  .brand  { font-size: 22px; font-weight: 700; }
  .brand p{ font-size: 12px; font-weight: 400; color: #666; margin-top: 4px; }
  .order-id { font-size: 18px; font-weight: 700; color: #1a1a2e; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #666; margin-bottom: 10px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-item p:first-child { font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a1a2e; color: white; padding: 10px 14px; text-align: left; font-size: 12px; }
  td { padding: 10px 14px; border-bottom: 1px solid #eee; }
  .total-row { background: #f0f4ff; font-weight: 700; }
  .badge { display:inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 16px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <div class="brand">GlassStore<p>Kính mắt cao cấp — Thiết kế theo đôi mắt bạn</p></div>
  <div>
    <div class="order-id">Đơn hàng #${order.orderId}</div>
    <p style="color:#666;font-size:13px;margin-top:4px">${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
    <span class="badge" style="background:#e8f5e9;color:#2e7d32;margin-top:6px">${STATUS[order.status] ?? order.status}</span>
  </div>
</div>

<div class="section">
  <div class="section-title">Thông tin đơn hàng</div>
  <div class="info-grid">
    <div class="info-item"><p>Địa chỉ giao hàng</p><p>${order.shippingAddress ?? '—'}</p></div>
    <div class="info-item"><p>Mã giảm giá</p><p>${order.discountCode ?? 'Không có'}</p></div>
    ${order.note ? `<div class="info-item"><p>Ghi chú</p><p>${order.note}</p></div>` : ''}
  </div>
</div>

<div class="section">
  <div class="section-title">Sản phẩm</div>
  <table>
    <thead><tr><th>Loại</th><th>Sản phẩm</th><th>Số lượng</th><th>Thành tiền</th></tr></thead>
    <tbody>
      ${(order.items ?? []).map(i => `
      <tr>
        <td>${i.itemType === 'CUSTOM_GLASSES' ? 'Thiết kế' : 'Làm sẵn'}</td>
        <td>${i.designName ?? i.productName ?? `#${i.orderItemId}`}</td>
        <td>${i.quantity}</td>
        <td>${fmt(i.subtotal)}</td>
      </tr>`).join('')}
      ${order.discountAmount ? `<tr><td colspan="3" style="text-align:right;color:#2e7d32">Giảm giá (${order.discountCode}):</td><td style="color:#2e7d32">-${fmt(order.discountAmount)}</td></tr>` : ''}
      <tr class="total-row"><td colspan="3">TỔNG CỘNG</td><td>${fmt(order.finalAmount)}</td></tr>
    </tbody>
  </table>
</div>

<div class="footer">
  Cảm ơn bạn đã mua hàng tại GlassStore · Bảo hành 12 tháng · Đổi trả 30 ngày<br/>
  📞 1800 1234 · ✉️ hello@glassstore.vn · 📍 123 Đường Lê Lợi, Q.1, TP.HCM
</div>
</body></html>`
  const w = window.open('', '_blank', 'width=800,height=600')
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 500)
}