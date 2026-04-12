import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Tag, MapPin, CreditCard,
  Smartphone, CheckCircle, Copy, Zap
} from 'lucide-react'
import { cartApi, orderApi, discountApi, paymentApi } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './CheckoutPage.module.css'
import { fmtCurrency } from '../../utils/format'

// ── MBBank QR config ─────────────────────────────────────────────────────────
const MB_ACCOUNT = '0785680242'
const MB_NAME    = 'GlassStore'
const MB_BANK_ID = 'MB'

function buildVietQR(amount, content) {
  return `https://img.vietqr.io/image/${MB_BANK_ID}-${MB_ACCOUNT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(MB_NAME)}`
}

// ── Payment methods ───────────────────────────────────────────────────────────
const METHODS = [
  {
    id: 'VNPAY',
    label: 'VNPay',
    sub: 'ATM / Visa / QR — xac nhan tu dong',
    icon: Zap,
    badge: 'Khuyen dung',
    badgeColor: '#166534',
    badgeBg: '#DCFCE7',
  },
  {
    id: 'BANK',
    label: 'Chuyen khoan MBBank',
    sub: 'Quet QR — xac nhan thu cong',
    icon: Smartphone,
  },
  {
    id: 'COD',
    label: 'Thanh toan khi nhan hang',
    sub: 'COD — tien mat',
    icon: ShoppingBag,
  },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [cart,       setCart]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [address,    setAddress]    = useState('')
  const [note,       setNote]       = useState('')
  const [method,     setMethod]     = useState('VNPAY')
  const [discount,   setDiscount]   = useState(null)
  const [code,       setCode]       = useState('')
  const [checking,   setChecking]   = useState(false)
  const [placing,    setPlacing]    = useState(false)
  const [orderId,    setOrderId]    = useState(null)
  const [step,       setStep]       = useState(1)   // 1=form, 2=QR (chi MBBank)

  useEffect(() => {
    cartApi.get()
      .then(r => setCart(r.data.data))
      .catch(() => toast.error('Khong the tai gio hang'))
      .finally(() => setLoading(false))
  }, [])

  const total       = cart?.totalAmount ?? 0
  const discountAmt = discount ? calcDiscount(discount, total) : 0
  const finalAmount = Math.max(0, total - discountAmt)

  function calcDiscount(d, total) {
    if (d.discountType === 'PERCENTAGE') {
      let amt = total * d.discountValue / 100
      if (d.maxDiscountAmount) amt = Math.min(amt, d.maxDiscountAmount)
      return amt
    }
    return Math.min(d.discountValue, total)
  }

  const checkCode = async () => {
    if (!code.trim()) return
    setChecking(true)
    try {
      const res = await discountApi.checkCode(code.trim())
      setDiscount(res.data.data)
      toast.success('Ma hop le!')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Ma khong hop le')
      setDiscount(null)
    } finally { setChecking(false) }
  }

  const placeOrder = async () => {
    if (!address.trim()) { toast.error('Vui long nhap dia chi giao hang'); return }
    setPlacing(true)
    try {
      // Buoc 1: Dat hang → tao Order
      const res = await orderApi.place({
        shippingAddress: address.trim(),
        note: note.trim(),
        discountCode: discount?.code ?? null,
      })
      const newOrderId = res.data.data?.orderId
      setOrderId(newOrderId)

      if (method === 'VNPAY') {
        // Buoc 2: Tao URL VNPay → redirect
        await handleVNPay(newOrderId)
      } else if (method === 'BANK') {
        // Hien QR MBBank
        setStep(2)
      } else {
        // COD — done
        toast.success('Dat hang thanh cong!')
        navigate('/orders')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Co loi xay ra')
    } finally { setPlacing(false) }
  }

  const handleVNPay = async (oid) => {
    try {
      const res = await paymentApi.createVNPay(oid)
      const url = res.data.data?.paymentUrl
      if (!url) throw new Error('Khong nhan duoc URL thanh toan')
      // Redirect toan trang den cong VNPay
      window.location.href = url
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Khong the tao URL thanh toan VNPay')
    }
  }

  const paymentContent = `GLASSSTORE DH${orderId}`
  const copyContent = () => {
    navigator.clipboard.writeText(paymentContent)
    toast.success('Da copy noi dung chuyen khoan!')
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <span className="spinner" />
    </div>
  )

  // ── Step 2: QR MBBank (giu nguyen logic cu) ──────────────────────────────
  if (step === 2 && orderId) {
    return (
      <div className="page-enter">
        <div className={styles.header}>
          <div className="container">
            <h1>Thanh toan don hang #{orderId}</h1>
            <p>Quet ma QR de chuyen khoan — don hang se duoc xac nhan sau khi nhan duoc tien</p>
          </div>
        </div>
        <div className="container section-sm">
          <div className={styles.qrWrap}>
            <div className={styles.qrCard}>
              <div className={styles.qrHeader}>
                <Smartphone size={20} /> Thanh toan qua MBBank
              </div>
              <div className={styles.qrImgWrap}>
                <img
                  src={buildVietQR(finalAmount, paymentContent)}
                  alt="QR MBBank"
                  className={styles.qrImg}
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
              <div className={styles.bankInfo}>
                <div className={styles.bankRow}><span>Ngan hang</span><strong>MB Bank</strong></div>
                <div className={styles.bankRow}><span>So tai khoan</span><strong>{MB_ACCOUNT}</strong></div>
                <div className={styles.bankRow}><span>Chu tai khoan</span><strong>{MB_NAME}</strong></div>
                <div className={styles.bankRow}>
                  <span>So tien</span>
                  <strong style={{ color: '#16A34A', fontSize: '1.1rem' }}>{fmtCurrency(finalAmount)}</strong>
                </div>
                <div className={`${styles.bankRow} ${styles.contentRow}`}>
                  <span>Noi dung CK</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: '#1D4ED8' }}>{paymentContent}</strong>
                    <button className={styles.copyBtn} onClick={copyContent} title="Copy">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.qrNote}>
                Vui long nhap dung noi dung <strong>{paymentContent}</strong> de chung toi xac nhan don hang tu dong
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button className="btn btn-outline" style={{ flex: 1 }}
                  onClick={() => navigate('/orders')}>
                  Xem don hang
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }}
                  onClick={() => { toast.success('Cam on! Don hang se duoc xac nhan som.'); navigate('/orders') }}>
                  <CheckCircle size={16} /> Da thanh toan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: Form dat hang ─────────────────────────────────────────────────
  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Dat hang</h1>
          <p>{cart?.items?.length ?? 0} san pham trong gio</p>
        </div>
      </div>

      <div className="container section-sm">
        <div className={styles.layout}>

          {/* ── Left: form ── */}
          <div className={styles.formCol}>

            {/* Dia chi */}
            <div className={styles.section}>
              <h3><MapPin size={18} /> Dia chi giao hang</h3>
              <textarea className="form-input" rows={3}
                value={address} onChange={e => setAddress(e.target.value)}
                placeholder="So nha, duong, phuong/xa, quan/huyen, tinh/thanh pho" />
              <textarea className="form-input" rows={2}
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Ghi chu don hang (tuy chon)"
                style={{ marginTop: 10 }} />
            </div>

            {/* Ma giam gia */}
            <div className={styles.section}>
              <h3><Tag size={18} /> Ma giam gia</h3>
              <div className={styles.codeRow}>
                <input className="form-input" value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Nhap ma giam gia"
                  onKeyDown={e => e.key === 'Enter' && checkCode()} />
                <button className="btn btn-outline" onClick={checkCode} disabled={checking}>
                  {checking ? <span className="spinner" /> : 'Ap dung'}
                </button>
              </div>
              {discount && (
                <div className={styles.discountTag}>
                  Ap dung: {discount.code} — Giam {discount.discountType === 'PERCENTAGE'
                    ? `${discount.discountValue}%` : fmtCurrency(discount.discountValue)}
                </div>
              )}
            </div>

            {/* Phuong thuc thanh toan */}
            <div className={styles.section}>
              <h3><CreditCard size={18} /> Phuong thuc thanh toan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {METHODS.map(m => {
                  const Icon = m.icon
                  const active = method === m.id
                  return (
                    <div
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                        border: active ? '2px solid #1a1a2e' : '1.5px solid #E5E7EB',
                        background: active ? '#F8F9FF' : '#fff',
                        transition: '150ms',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: active ? '#1a1a2e' : '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={18} color={active ? '#fff' : '#6B7280'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{m.label}</p>
                        <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0' }}>{m.sub}</p>
                      </div>
                      {m.badge && (
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 20,
                          background: m.badgeBg, color: m.badgeColor, fontWeight: 600,
                        }}>
                          {m.badge}
                        </span>
                      )}
                      {/* Radio dot */}
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        border: active ? '5px solid #1a1a2e' : '2px solid #D1D5DB',
                        background: '#fff', transition: '150ms',
                      }} />
                    </div>
                  )
                })}
              </div>

              {/* Note VNPay */}
              {method === 'VNPAY' && (
                <div style={{
                  marginTop: 12, padding: '10px 14px', background: '#EFF6FF',
                  borderRadius: 8, border: '1px solid #BFDBFE', fontSize: 13, color: '#1D4ED8'
                }}>
                  Ban se duoc chuyen den cong thanh toan VNPay an toan.
                  Ho tro: ATM, Visa/Master, QR Pay. The test sandbox: <strong>9704198526191432198</strong>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: summary ── */}
          <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
              <h3>Tom tat don hang</h3>
              <div className={styles.items}>
                {cart?.items?.map(item => (
                  <div key={item.cartItemId} className={styles.item}>
                    <div>
                      <p className={styles.itemName}>
                        {item.designName ?? item.productName ?? 'San pham'}
                      </p>
                      <p className={styles.itemType}>
                        {item.itemType === 'CUSTOM_GLASSES' ? 'Kinh thiet ke' : 'Kinh lam san'}
                        {' · '}x{item.quantity}
                      </p>
                    </div>
                    <span className={styles.itemPrice}>
                      {fmtCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.divider} />

              <div className={styles.summaryRow}>
                <span>Tam tinh</span><span>{fmtCurrency(total)}</span>
              </div>
              {discount && (
                <div className={styles.summaryRow} style={{ color: '#16A34A' }}>
                  <span>Giam gia ({discount.code})</span>
                  <span>-{fmtCurrency(discountAmt)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Phi van chuyen</span>
                <span style={{ color: '#16A34A' }}>Mien phi</span>
              </div>

              <div className={styles.divider} />

              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Tong cong</span>
                <span>{fmtCurrency(finalAmount)}</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 20 }}
                onClick={placeOrder}
                disabled={placing}
              >
                {placing
                  ? <span className="spinner" />
                  : method === 'VNPAY'
                    ? <><Zap size={16} /> Thanh toan qua VNPay</>
                    : method === 'BANK'
                      ? <><Smartphone size={16} /> Dat hang & Chuyen khoan</>
                      : <><ShoppingBag size={16} /> Dat hang COD</>
                }
              </button>

              <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 10 }}>
                Bang cach dat hang, ban dong y voi dieu khoan su dung cua GlassStore
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}