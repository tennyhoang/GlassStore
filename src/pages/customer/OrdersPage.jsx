import { useState, useMemo } from 'react'
import {
  Package, ChevronDown, ChevronUp, XCircle, Printer,
  MapPin, Phone, FileText, Tag, Truck, CheckCircle,
  Clock, Wrench, Check
} from 'lucide-react'
import { orderApi } from '../../services/api'
import { useOrders } from '../../hooks/useOrders'
import { fmtCurrency, fmtDate } from '../../utils/format'
import Skeleton from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import styles from './OrdersPage.module.css'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  PENDING:       { label: 'Cho xac nhan', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
  CONFIRMED:     { label: 'Da xac nhan',  color: '#1E40AF', bg: '#DBEAFE', border: '#93C5FD' },
  MANUFACTURING: { label: 'Dang san xuat',color: '#5B21B6', bg: '#EDE9FE', border: '#C4B5FD' },
  SHIPPING:      { label: 'Dang giao',    color: '#0369A1', bg: '#E0F2FE', border: '#7DD3FC' },
  DELIVERED:     { label: 'Da giao',      color: '#166534', bg: '#DCFCE7', border: '#86EFAC' },
  CANCELLED:     { label: 'Da huy',       color: '#991B1B', bg: '#FEE2E2', border: '#FCA5A5' },
}

const TABS = [
  { key: 'all',           label: 'Tat ca'       },
  { key: 'PENDING',       label: 'Cho xac nhan' },
  { key: 'CONFIRMED',     label: 'Da xac nhan'  },
  { key: 'MANUFACTURING', label: 'San xuat'      },
  { key: 'SHIPPING',      label: 'Dang giao'     },
  { key: 'DELIVERED',     label: 'Hoan thanh'    },
  { key: 'CANCELLED',     label: 'Da huy'        },
]

// cac buoc trang thai theo thu tu
const TIMELINE_STEPS = [
  { status: 'PENDING',       Icon: Clock,       label: 'Dat hang',    desc: 'Don hang da duoc tao' },
  { status: 'CONFIRMED',     Icon: Check,       label: 'Xac nhan',    desc: 'Nhan vien da xac nhan' },
  { status: 'MANUFACTURING', Icon: Wrench,      label: 'San xuat',    desc: 'Xuong dang gia cong kinh' },
  { status: 'SHIPPING',      Icon: Truck,       label: 'Giao hang',   desc: 'Shipper dang giao den ban' },
  { status: 'DELIVERED',     Icon: CheckCircle, label: 'Hoan thanh',  desc: 'Da giao thanh cong' },
]
const STATUS_ORDER = TIMELINE_STEPS.map(s => s.status)

// ── Sub-components ────────────────────────────────────────────────────────────

function OrderBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, color: '#374151', bg: '#F3F4F6', border: '#D1D5DB' }
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      display: 'inline-block', letterSpacing: '0.02em'
    }}>
      {s.label}
    </span>
  )
}

function Timeline({ order }) {
  if (order.status === 'CANCELLED') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px', background: '#FEF2F2',
        borderRadius: 10, border: '1px solid #FECACA'
      }}>
        <XCircle size={22} style={{ color: '#DC2626', flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 600, color: '#991B1B', margin: 0, fontSize: 14 }}>
            Don hang da bi huy
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#B91C1C' }}>
            Neu ban can ho tro, vui long lien he cua hang.
          </p>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', minWidth: 480,
        padding: '8px 0'
      }}>
        {TIMELINE_STEPS.map((step, i) => {
          const done   = i < currentIdx
          const active = i === currentIdx
          const { Icon } = step

          return (
            <div key={step.status} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* connector line */}
              {i < TIMELINE_STEPS.length - 1 && (
                <div style={{
                  position: 'absolute', top: 17, left: '50%', right: '-50%',
                  height: 2,
                  background: i < currentIdx ? '#22C55E' : '#E5E7EB',
                  zIndex: 0, transition: 'background 0.3s'
                }} />
              )}

              {/* circle */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', zIndex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#22C55E' : active ? '#16A34A' : '#F3F4F6',
                border: active ? '3px solid #15803D' : done ? 'none' : '2px solid #D1D5DB',
                flexShrink: 0,
                boxShadow: active ? '0 0 0 4px rgba(22,163,74,0.15)' : 'none',
                transition: 'all 0.3s'
              }}>
                {done
                  ? <Check size={16} color="#fff" strokeWidth={3} />
                  : <Icon size={16} color={active ? '#fff' : '#9CA3AF'} strokeWidth={1.5} />
                }
              </div>

              {/* label */}
              <div style={{ textAlign: 'center', marginTop: 8, padding: '0 4px' }}>
                <p style={{
                  fontSize: 12, fontWeight: active ? 700 : done ? 600 : 400,
                  color: active ? '#15803D' : done ? '#166534' : '#9CA3AF',
                  margin: 0, lineHeight: 1.3
                }}>
                  {step.label}
                </p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0', lineHeight: 1.3 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Shipment tracking info */}
      {order.shipmentStatus && order.status === 'SHIPPING' && (
        <div style={{
          marginTop: 12, padding: '10px 14px', background: '#EFF6FF',
          borderRadius: 8, border: '1px solid #BFDBFE', fontSize: 13
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1D4ED8' }}>
            <Truck size={14} />
            <span style={{ fontWeight: 600 }}>Trang thai van chuyen:</span>
            <span>{order.shipmentStatus}</span>
          </div>
          {order.shipmentNote && (
            <p style={{ margin: '4px 0 0', color: '#3B82F6', paddingLeft: 20 }}>
              {order.shipmentNote}
            </p>
          )}
        </div>
      )}

      {order.status === 'DELIVERED' && order.deliveredAt && (
        <div style={{
          marginTop: 12, padding: '10px 14px', background: '#F0FDF4',
          borderRadius: 8, border: '1px solid #BBF7D0', fontSize: 13,
          color: '#15803D', display: 'flex', alignItems: 'center', gap: 6
        }}>
          <CheckCircle size={14} />
          <span>Giao hang thanh cong luc <strong>{fmtDate(order.deliveredAt)}</strong></span>
        </div>
      )}
    </div>
  )
}

function ProductItem({ item }) {
  const name  = item.productName  ?? `San pham #${item.orderItemId}`
  const isCustom = item.itemType === 'CUSTOM_GLASSES'

  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 0',
      borderBottom: '0.5px solid var(--gray-2, #F3F4F6)',
      alignItems: 'flex-start'
    }}>
      {/* Icon san pham */}
      <div style={{
        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
        background: isCustom ? '#EDE9FE' : '#E0F2FE',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Package size={22} color={isCustom ? '#7C3AED' : '#0369A1'} strokeWidth={1.5} />
      </div>

      {/* Thong tin */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink, #111)' }}>
            {name}
          </span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
            background: isCustom ? '#EDE9FE' : '#E0F2FE',
            color: isCustom ? '#5B21B6' : '#0369A1'
          }}>
            {isCustom ? 'Kinh theo don' : 'Kinh lam san'}
          </span>
        </div>

        {/* Chi tiet kinh */}
        {(item.frameName || item.lensName || item.brand) && (
          <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
            {item.frameName && (
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                Gong: <strong style={{ color: '#374151' }}>{item.frameName}</strong>
              </span>
            )}
            {item.lensName && (
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                Trong: <strong style={{ color: '#374151' }}>{item.lensName}</strong>
              </span>
            )}
            {item.brand && (
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                Thuong hieu: <strong style={{ color: '#374151' }}>{item.brand}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* So luong + gia */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink, #111)' }}>
          {fmtCurrency(item.subtotal)}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF' }}>
          x{item.quantity} × {fmtCurrency(item.unitPrice)}
        </p>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, highlight }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={15} color="#6B7280" />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{label}</p>
        <p style={{
          margin: '2px 0 0', fontSize: 14,
          color: highlight ? '#16A34A' : 'var(--ink, #111)',
          fontWeight: highlight ? 600 : 400
        }}>
          {value}
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { orders, loading, refetch } = useOrders()
  const [expanded,  setExpanded]  = useState(null)
  const [tabStatus, setTabStatus] = useState('all')

  const filtered = useMemo(
    () => tabStatus === 'all' ? orders : orders.filter(o => o.status === tabStatus),
    [orders, tabStatus]
  )

  const handleCancel = async (orderId) => {
    if (!window.confirm('Huy don hang nay? Hanh dong nay khong the hoan tac.')) return
    try {
      await orderApi.cancel(orderId)
      toast.success('Da huy don hang')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Co loi xay ra')
    }
  }

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Don hang cua toi</h1>
          <p style={{ color: 'var(--gray-5)', fontSize: 15 }}>{orders.length} don hang</p>
        </div>
      </div>

      <div className="container section-sm">

        {/* Tab filter */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${tabStatus === t.key ? styles.tabActive : ''}`}
              onClick={() => setTabStatus(t.key)}
              style={{ fontSize: 14 }}
            >
              {t.label}
              {t.key !== 'all' && (
                <span className={styles.tabCount}>
                  {orders.filter(o => o.status === t.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <Skeleton.OrderList rows={4} />
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Package size={52} strokeWidth={1} />
            <h3>Khong co don hang nao</h3>
            <p>Hay dat hang de xem lich su tai day</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map(order => {
              const isOpen = expanded === order.orderId

              return (
                <div
                  key={order.orderId}
                  className={styles.orderCard}
                  style={{
                    border: isOpen
                      ? `1.5px solid ${STATUS_MAP[order.status]?.border ?? '#D1D5DB'}`
                      : undefined,
                    transition: 'border-color 0.2s'
                  }}
                >
                  {/* ── Header ──────────────────────────────────────────── */}
                  <div
                    className={styles.orderHeader}
                    onClick={() => toggle(order.orderId)}
                    style={{ padding: '18px 22px' }}
                  >
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId} style={{ fontSize: 16 }}>
                        #{order.orderId}
                      </span>
                      <OrderBadge status={order.status} />
                      <span className={styles.orderDate} style={{ fontSize: 13 }}>
                        {fmtDate(order.createdAt)}
                      </span>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={styles.orderTotal} style={{ fontSize: 17, fontWeight: 700 }}>
                        {fmtCurrency(order.finalAmount)}
                      </span>
                      {isOpen
                        ? <ChevronUp   size={20} style={{ color: '#9CA3AF' }} />
                        : <ChevronDown size={20} style={{ color: '#9CA3AF' }} />}
                    </div>
                  </div>

                  {/* ── Body ────────────────────────────────────────────── */}
                  {isOpen && (
                    <div
                      className={styles.orderBody}
                      style={{ padding: '22px 22px', gap: 24 }}
                    >

                      {/* Timeline trang thai */}
                      <div>
                        <p className={styles.sectionLabel}>Trang thai don hang</p>
                        <div style={{
                          background: '#FAFAFA', borderRadius: 12,
                          padding: '20px 16px', border: '0.5px solid #E5E7EB'
                        }}>
                          <Timeline order={order} />
                        </div>
                      </div>

                      {/* San pham */}
                      {order.items?.length > 0 && (
                        <div>
                          <p className={styles.sectionLabel}>
                            San pham ({order.items.length} kien)
                          </p>
                          <div style={{
                            border: '0.5px solid #E5E7EB', borderRadius: 12,
                            padding: '0 16px', overflow: 'hidden'
                          }}>
                            {order.items.map((item, i) => (
                              <div
                                key={item.orderItemId}
                                style={{ borderTop: i > 0 ? '0.5px solid #F3F4F6' : 'none' }}
                              >
                                <ProductItem item={item} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tong ket + thong tin 2 cot */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16
                      }}>
                        {/* Thong tin don */}
                        <div style={{
                          background: '#FAFAFA', borderRadius: 12,
                          padding: '16px 18px', border: '0.5px solid #E5E7EB',
                          display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                          <p className={styles.sectionLabel} style={{ margin: 0 }}>
                            Thong tin giao hang
                          </p>
                          <InfoRow icon={MapPin}   label="Dia chi"     value={order.shippingAddress} />
                          <InfoRow icon={Phone}    label="So dien thoai" value={order.customerPhone} />
                          {order.discountCode && (
                            <InfoRow
                              icon={Tag}
                              label="Ma giam gia"
                              value={`${order.discountCode} (-${fmtCurrency(order.discountAmount)})`}
                              highlight
                            />
                          )}
                          {order.note && (
                            <InfoRow icon={FileText} label="Ghi chu" value={order.note} />
                          )}
                        </div>

                        {/* Tong tien */}
                        <div style={{
                          background: '#FAFAFA', borderRadius: 12,
                          padding: '16px 18px', border: '0.5px solid #E5E7EB'
                        }}>
                          <p className={styles.sectionLabel} style={{ marginBottom: 12 }}>
                            Chi tiet thanh toan
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                              <span style={{ color: '#6B7280' }}>Tam tinh</span>
                              <span>{fmtCurrency(order.totalAmount)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                <span style={{ color: '#16A34A' }}>Giam gia</span>
                                <span style={{ color: '#16A34A' }}>-{fmtCurrency(order.discountAmount)}</span>
                              </div>
                            )}
                            <div style={{
                              display: 'flex', justifyContent: 'space-between',
                              fontSize: 17, fontWeight: 700,
                              borderTop: '1px solid #E5E7EB', paddingTop: 10, marginTop: 4
                            }}>
                              <span>Tong cong</span>
                              <span style={{ color: '#111' }}>{fmtCurrency(order.finalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={styles.orderActions}>
                        {['PENDING', 'CONFIRMED'].includes(order.status) && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#DC2626', borderColor: '#DC2626', border: '1.5px solid' }}
                            onClick={e => { e.stopPropagation(); handleCancel(order.orderId) }}
                          >
                            <XCircle size={15} /> Huy don hang
                          </button>
                        )}
                        {order.status === 'DELIVERED' && (
                          <a href="/returns" className="btn btn-outline btn-sm">
                            Yeu cau doi/tra
                          </a>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={e => { e.stopPropagation(); printOrder(order) }}
                        >
                          <Printer size={15} /> In don hang
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

// ── Print ─────────────────────────────────────────────────────────────────────

export function printOrder(order) {
  const STATUS_LABEL = {
    PENDING: 'Cho xac nhan', CONFIRMED: 'Da xac nhan',
    MANUFACTURING: 'Dang san xuat', SHIPPING: 'Dang giao',
    DELIVERED: 'Da giao', CANCELLED: 'Da huy',
  }

  const rows = (order.items ?? []).map(item => {
    const name  = item.productName ?? `San pham #${item.orderItemId}`
    const detail = [
      item.frameName && `Gong: ${item.frameName}`,
      item.lensName  && `Trong: ${item.lensName}`,
      item.brand     && `${item.brand}`,
    ].filter(Boolean).join(' | ')

    return `<tr>
      <td>
        <div style="font-weight:600">${name}</div>
        ${detail ? `<div style="font-size:12px;color:#666;margin-top:2px">${detail}</div>` : ''}
      </td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${fmtCurrency(item.unitPrice)}</td>
      <td style="text-align:right;font-weight:600">${fmtCurrency(item.subtotal)}</td>
    </tr>`
  }).join('')

  const discountRow = order.discountAmount > 0
    ? `<tr><td colspan="3" style="text-align:right;color:#16A34A">Giam gia (${order.discountCode ?? ''}):</td>
       <td style="text-align:right;color:#16A34A">-${fmtCurrency(order.discountAmount)}</td></tr>`
    : ''

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Don hang #${order.orderId} — GlassStore</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Arial', sans-serif; font-size:14px; color:#111; padding:40px; line-height:1.6; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:24px; border-bottom:2px solid #111; }
  .brand  { font-size:24px; font-weight:800; letter-spacing:-0.5px; }
  .brand-sub { font-size:12px; color:#666; font-weight:400; margin-top:2px; }
  .order-id { font-size:20px; font-weight:700; }
  .status-badge { display:inline-block; margin-top:6px; padding:4px 14px; border-radius:100px; font-size:12px; font-weight:600; background:#DCFCE7; color:#166534; }
  .section { margin-bottom:28px; }
  .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid #E5E7EB; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .info-item .label { font-size:11px; color:#9CA3AF; margin-bottom:3px; }
  .info-item .value { font-size:14px; font-weight:500; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th { background:#111; color:#fff; padding:11px 14px; text-align:left; font-size:12px; font-weight:600; }
  td { padding:12px 14px; border-bottom:1px solid #F3F4F6; vertical-align:top; }
  .total-section { margin-top:16px; border:1px solid #E5E7EB; border-radius:10px; padding:14px 18px; max-width:320px; margin-left:auto; }
  .total-row { display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px; }
  .final-row { display:flex; justify-content:space-between; font-size:18px; font-weight:700; border-top:2px solid #111; padding-top:12px; margin-top:8px; }
  .footer { margin-top:40px; text-align:center; font-size:12px; color:#9CA3AF; border-top:1px solid #E5E7EB; padding-top:20px; }
  @media print { body { padding:24px; } button { display:none; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">GlassStore</div>
      <div class="brand-sub">Cua hang kinh mat cao cap</div>
    </div>
    <div style="text-align:right">
      <div class="order-id">Don hang #${order.orderId}</div>
      <div style="font-size:13px;color:#666;margin-top:4px">${new Date(order.createdAt).toLocaleString('vi-VN')}</div>
      <span class="status-badge">${STATUS_LABEL[order.status] ?? order.status}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Thong tin giao hang</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Khach hang</div>
        <div class="value">${order.customerName ?? ''}</div>
      </div>
      <div class="info-item">
        <div class="label">So dien thoai</div>
        <div class="value">${order.customerPhone ?? '—'}</div>
      </div>
      <div class="info-item" style="grid-column:span 2">
        <div class="label">Dia chi giao hang</div>
        <div class="value">${order.shippingAddress ?? '—'}</div>
      </div>
      ${order.discountCode ? `
      <div class="info-item">
        <div class="label">Ma giam gia</div>
        <div class="value" style="color:#16A34A">${order.discountCode}</div>
      </div>` : ''}
      ${order.note ? `
      <div class="info-item">
        <div class="label">Ghi chu</div>
        <div class="value" style="color:#6B7280;font-style:italic">${order.note}</div>
      </div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Danh sach san pham</div>
    <table>
      <thead>
        <tr><th>San pham</th><th style="text-align:center;width:60px">SL</th><th style="text-align:right;width:130px">Don gia</th><th style="text-align:right;width:130px">Thanh tien</th></tr>
      </thead>
      <tbody>
        ${rows}
        ${discountRow}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row"><span style="color:#6B7280">Tam tinh</span><span>${fmtCurrency(order.totalAmount)}</span></div>
      ${order.discountAmount > 0 ? `<div class="total-row"><span style="color:#16A34A">Giam gia</span><span style="color:#16A34A">-${fmtCurrency(order.discountAmount)}</span></div>` : ''}
      <div class="final-row"><span>Tong cong</span><span>${fmtCurrency(order.finalAmount)}</span></div>
    </div>
  </div>

  <div class="footer">
    GlassStore — Bao hanh 12 thang | Doi tra trong 30 ngay<br>
    Cam on ban da tin tuong su dung dich vu cua chung toi
  </div>
</body>
</html>`

  const w = window.open('', '_blank', 'width=820,height=640')
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 600)
}