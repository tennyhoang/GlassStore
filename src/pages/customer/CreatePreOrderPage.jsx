import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Package, AlertTriangle } from 'lucide-react'
import { productApi } from '../../services/api'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './CreatePreOrderPage.module.css'

function fmt(n) {
  return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '—'
}

export default function CreatePreOrderPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const productId = Number(params.get('productId'))
  const type      = params.get('type') ?? 'frame'

  const [product,  setProduct]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [qty,      setQty]      = useState(1)
  const [address,  setAddress]  = useState('')
  const [note,     setNote]     = useState('')
  const [placing,  setPlacing]  = useState(false)

  useEffect(() => {
    if (!productId) return
    const fetcher = type === 'frame'
      ? productApi.getFrame(productId)
      : api.get(`/ready-made-glasses/${productId}`)
    fetcher
      .then(r => setProduct(r.data.data))
      .catch(() => toast.error('Không tìm thấy sản phẩm'))
      .finally(() => setLoading(false))
  }, [productId])

  const totalAmount   = (product?.price ?? 0) * qty
  const depositAmount = Math.ceil(totalAmount * 0.3)

  const handleSubmit = async () => {
    if (!address.trim()) { toast.error('Vui lòng nhập địa chỉ'); return }
    setPlacing(true)
    try {
      await api.post('/pre-orders', {
        frameId:   type === 'frame' ? productId : null,
        productId: type !== 'frame' ? productId : null,
        quantity:  qty,
        shippingAddress: address,
        note,
      })
      toast.success('Đặt trước thành công!')
      navigate('/pre-orders')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setPlacing(false) }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'100px'}}><span className="spinner"/></div>

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Đặt trước sản phẩm</h1>
          <p>Sản phẩm hiện hết hàng — đặt trước để nhận sớm nhất khi có hàng</p>
        </div>
      </div>

      <div className="container section-sm">
        <div className={styles.layout}>
          {/* Form */}
          <div>
            {/* Cảnh báo */}
            <div className={styles.warning}>
              <AlertTriangle size={18} style={{color:'#e65100',flexShrink:0}}/>
              <div>
                <p style={{fontWeight:600,color:'#e65100'}}>Sản phẩm đang hết hàng</p>
                <p style={{fontSize:'13px',color:'#795548',marginTop:'4px'}}>
                  Đặt trước để giữ chỗ. Bạn cần đặt cọc <strong>30%</strong> tổng giá trị.
                  Hàng sẽ được giao sớm nhất khi có trong kho.
                </p>
              </div>
            </div>

            {/* Số lượng */}
            <div className={styles.section}>
              <h3>Số lượng</h3>
              <div className={styles.qtyRow}>
                <button className="btn btn-outline btn-sm"
                  onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
                <span className={styles.qtyNum}>{qty}</span>
                <button className="btn btn-outline btn-sm"
                  onClick={() => setQty(q => q+1)}>+</button>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className={styles.section}>
              <h3>Địa chỉ giao hàng</h3>
              <textarea className="form-input" rows={3}
                value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường, quận, tỉnh/thành"/>
              <textarea className="form-input" rows={2}
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                style={{marginTop:'10px'}}/>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.summaryCard}>
            <div className={styles.productInfo}>
              <Package size={32} strokeWidth={1} style={{color:'var(--gray-4)'}}/>
              <div>
                <p style={{fontWeight:700}}>{product?.name}</p>
                <p style={{fontSize:'13px',color:'var(--gray-5)'}}>{product?.brand}</p>
              </div>
            </div>
            <hr style={{border:'none',borderTop:'1px solid var(--gray-2)',margin:'16px 0'}}/>
            <div className={styles.sumRow}>
              <span>Giá</span><span>{fmt(product?.price)}</span>
            </div>
            <div className={styles.sumRow}>
              <span>Số lượng</span><span>x{qty}</span>
            </div>
            <div className={styles.sumRow}>
              <span>Tổng tiền</span>
              <span style={{fontFamily:'var(--font-display)',fontSize:'1.1rem'}}>{fmt(totalAmount)}</span>
            </div>
            <div className={styles.depositRow}>
              <span>Đặt cọc ngay (30%)</span>
              <span style={{color:'#e65100',fontWeight:700}}>{fmt(depositAmount)}</span>
            </div>
            <div className={styles.depositNote}>
              Phần còn lại <strong>{fmt(totalAmount - depositAmount)}</strong> thanh toán khi nhận hàng
            </div>
            <button className="btn btn-primary"
              style={{width:'100%',marginTop:'20px'}}
              onClick={handleSubmit} disabled={placing}>
              {placing ? <span className="spinner"/> : '📦 Xác nhận đặt trước'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}