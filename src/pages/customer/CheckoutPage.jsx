import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Tag, MapPin, CreditCard, Smartphone, CheckCircle, Copy } from 'lucide-react'
import { cartApi, orderApi, discountApi } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './CheckoutPage.module.css'

function fmt(n) {
  return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '0 ₫'
}

// ── MBBank QR config ──
const MB_ACCOUNT = '0785680242'
const MB_NAME    = 'GlassStore'
const MB_BANK_ID = 'MB'   // BIN MBBank cho VietQR

function buildVietQR(amount, content) {
  // VietQR API - miễn phí, không cần đăng ký
  return `https://img.vietqr.io/image/${MB_BANK_ID}-${MB_ACCOUNT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(MB_NAME)}`
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [cart,     setCart]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [address,  setAddress]  = useState('')
  const [note,     setNote]     = useState('')
  const [method,   setMethod]   = useState('BANK') // BANK | COD
  const [discount, setDiscount] = useState(null)
  const [code,     setCode]     = useState('')
  const [checking, setChecking] = useState(false)
  const [placing,  setPlacing]  = useState(false)
  const [orderId,  setOrderId]  = useState(null)  // sau khi đặt thành công
  const [step,     setStep]     = useState(1)      // 1=form, 2=QR payment

  useEffect(() => {
    cartApi.get()
      .then(r => setCart(r.data.data))
      .catch(() => toast.error('Không thể tải giỏ hàng'))
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
      toast.success('Mã hợp lệ!')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Mã không hợp lệ')
      setDiscount(null)
    } finally { setChecking(false) }
  }

  const placeOrder = async () => {
    if (!address.trim()) { toast.error('Vui lòng nhập địa chỉ giao hàng'); return }
    setPlacing(true)
    try {
      const res = await orderApi.place({
        shippingAddress: address.trim(),
        note: note.trim(),
        discountCode: discount?.code ?? null,
      })
      const newOrderId = res.data.data?.orderId
      setOrderId(newOrderId)
      if (method === 'BANK') {
        setStep(2) // Hiện QR
      } else {
        toast.success('Đặt hàng thành công!')
        navigate('/orders')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setPlacing(false) }
  }

  const paymentContent = `GLASSSTORE DH${orderId}`

  const copyContent = () => {
    navigator.clipboard.writeText(paymentContent)
    toast.success('Đã copy nội dung chuyển khoản!')
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'80px'}}><span className="spinner"/></div>

  // ── Step 2: QR Payment ──
  if (step === 2 && orderId) {
    return (
      <div className="page-enter">
        <div className={styles.header}>
          <div className="container">
            <h1>Thanh toán đơn hàng #{orderId}</h1>
            <p>Quét mã QR để chuyển khoản — đơn hàng sẽ được xác nhận sau khi thanh toán</p>
          </div>
        </div>
        <div className="container section-sm">
          <div className={styles.qrWrap}>
            <div className={styles.qrCard}>
              <div className={styles.qrHeader}>
                <Smartphone size={20}/> Thanh toán qua MBBank
              </div>

              {/* QR Code từ VietQR */}
              <div className={styles.qrImgWrap}>
                <img
                  src={buildVietQR(finalAmount, paymentContent)}
                  alt="QR MBBank"
                  className={styles.qrImg}
                  onError={e => { e.target.style.display='none' }}
                />
              </div>

              {/* Thông tin chuyển khoản */}
              <div className={styles.bankInfo}>
                <div className={styles.bankRow}>
                  <span>Ngân hàng</span>
                  <strong>MB Bank (MBBank)</strong>
                </div>
                <div className={styles.bankRow}>
                  <span>Số tài khoản</span>
                  <strong>{MB_ACCOUNT}</strong>
                </div>
                <div className={styles.bankRow}>
                  <span>Chủ tài khoản</span>
                  <strong>{MB_NAME}</strong>
                </div>
                <div className={styles.bankRow}>
                  <span>Số tiền</span>
                  <strong style={{color:'#2e7d32',fontSize:'1.1rem'}}>{fmt(finalAmount)}</strong>
                </div>
                <div className={`${styles.bankRow} ${styles.contentRow}`}>
                  <span>Nội dung CK</span>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <strong style={{color:'#1565c0'}}>{paymentContent}</strong>
                    <button className={styles.copyBtn} onClick={copyContent} title="Copy">
                      <Copy size={14}/>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.qrNote}>
                ⚠️ Vui lòng nhập đúng nội dung <strong>{paymentContent}</strong> để chúng tôi xác nhận đơn hàng tự động
              </div>

              <div style={{display:'flex',gap:'8px',marginTop:'20px'}}>
                <button className="btn btn-outline" style={{flex:1}}
                  onClick={() => navigate('/orders')}>
                  Xem đơn hàng
                </button>
                <button className="btn btn-primary" style={{flex:1}}
                  onClick={() => { toast.success('Cảm ơn! Đơn hàng sẽ được xác nhận sớm.'); navigate('/orders') }}>
                  <CheckCircle size={16}/> Đã thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: Form đặt hàng ──
  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Đặt hàng</h1>
          <p>{cart?.items?.length ?? 0} sản phẩm trong giỏ</p>
        </div>
      </div>

      <div className="container section-sm">
        <div className={styles.layout}>
          {/* Left: form */}
          <div className={styles.formCol}>
            {/* Địa chỉ */}
            <div className={styles.section}>
              <h3><MapPin size={18}/> Địa chỉ giao hàng</h3>
              <textarea className="form-input" rows={3}
                value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"/>
              <textarea className="form-input" rows={2}
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Ghi chú đơn hàng (tuỳ chọn)"
                style={{marginTop:'10px'}}/>
            </div>

            {/* Mã giảm giá */}
            <div className={styles.section}>
              <h3><Tag size={18}/> Mã giảm giá</h3>
              <div className={styles.codeRow}>
                <input className="form-input" value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá"
                  onKeyDown={e => e.key === 'Enter' && checkCode()}/>
                <button className="btn btn-outline" onClick={checkCode} disabled={checking}>
                  {checking ? <span className="spinner"/> : 'Áp dụng'}
                </button>
              </div>
              {discount && (
                <div className={styles.discountTag}>
                  ✅ {discount.code} — Giảm {discount.discountType === 'PERCENTAGE'
                    ? `${discount.discountValue}%` : fmt(discount.discountValue)}
                </div>
              )}
            </div>

            {/* Phương thức thanh toán */}
            <div className={styles.section}>
              <h3><CreditCard size={18}/> Phương thức thanh toán</h3>
              <div className={styles.methodGrid}>
                <div className={`${styles.methodCard} ${method==='BANK'?styles.methodActive:''}`}
                  onClick={() => setMethod('BANK')}>
                  <Smartphone size={20}/>
                  <div>
                    <p>Chuyển khoản MBBank</p>
                    <span>Quét QR — xác nhận ngay</span>
                  </div>
                </div>
                <div className={`${styles.methodCard} ${method==='COD'?styles.methodActive:''}`}
                  onClick={() => setMethod('COD')}>
                  <ShoppingBag size={20}/>
                  <div>
                    <p>Thanh toán khi nhận hàng</p>
                    <span>COD — tiền mặt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
              <h3>Tóm tắt đơn hàng</h3>
              <div className={styles.items}>
                {cart?.items?.map(item => (
                  <div key={item.cartItemId} className={styles.item}>
                    <div>
                      <p className={styles.itemName}>
                        {item.designName ?? item.productName ?? 'Sản phẩm'}
                      </p>
                      <p className={styles.itemType}>
                        {item.itemType === 'CUSTOM_GLASSES' ? 'Kính thiết kế' : 'Kính làm sẵn'}
                        {' · '}x{item.quantity}
                      </p>
                    </div>
                    <span className={styles.itemPrice}>{fmt(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.divider}/>
              <div className={styles.summaryRow}>
                <span>Tạm tính</span><span>{fmt(total)}</span>
              </div>
              {discount && (
                <div className={styles.summaryRow} style={{color:'#2e7d32'}}>
                  <span>Giảm giá ({discount.code})</span>
                  <span>-{fmt(discountAmt)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển</span><span style={{color:'#2e7d32'}}>Miễn phí</span>
              </div>
              <div className={styles.divider}/>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Tổng cộng</span>
                <span>{fmt(finalAmount)}</span>
              </div>

              <button className="btn btn-primary" style={{width:'100%',marginTop:'20px'}}
                onClick={placeOrder} disabled={placing}>
                {placing ? <span className="spinner"/> : method === 'BANK' ? '🏦 Đặt hàng & Thanh toán' : '📦 Đặt hàng COD'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}