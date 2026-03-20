import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Eye, ArrowLeft } from 'lucide-react'
import { productApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ReviewSection from '../components/ui/ReviewSection'
import toast from 'react-hot-toast'
import styles from './FrameDetailPage.module.css'

function fmt(n) {
  return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '—'
}

const BADGE_COLORS = {
  AVAILABLE:    { bg:'#e8f5e9', color:'#2e7d32', label:'Còn hàng'  },
  DISCONTINUED: { bg:'#fce4ec', color:'#c62828', label:'Ngừng bán' },
  OUT_OF_STOCK: { bg:'#fff3e0', color:'#e65100', label:'Hết hàng'  },
}

export default function FrameDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isCustomer, user } = useAuth()
  const [frame,   setFrame]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productApi.getFrame(id)
      .then(r => setFrame(r.data.data))
      .catch(() => { toast.error('Không tìm thấy sản phẩm'); navigate('/shop') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{display:'flex',justifyContent:'center',padding:'100px'}}>
      <span className="spinner"/>
    </div>
  )
  if (!frame) return null

  const badge = BADGE_COLORS[frame.status] ?? BADGE_COLORS.AVAILABLE

  const specs = [
    { label:'Thương hiệu', value: frame.brand    },
    { label:'Màu sắc',     value: frame.color    },
    { label:'Chất liệu',   value: frame.material },
    { label:'Kiểu dáng',   value: frame.shape    },
    { label:'Tồn kho',     value: frame.stockQuantity != null ? `${frame.stockQuantity} cái` : null },
  ].filter(s => s.value)

  return (
    <div className="page-enter">
      <div className="container" style={{padding:'40px 24px 80px'}}>

        {/* Back */}
        <Link to="/shop" className={styles.back}>
          <ArrowLeft size={16}/> Quay lại cửa hàng
        </Link>

        {/* Main */}
        <div className={styles.main}>

          {/* Hình ảnh */}
          <div className={styles.imgBox}>
            {frame.imageUrl ? (
              <img src={frame.imageUrl} alt={frame.name} className={styles.img}/>
            ) : (
              <div className={styles.imgPlaceholder}>
                <Eye size={64} strokeWidth={1} style={{color:'var(--gray-3)'}}/>
                <p>Chưa có hình ảnh</p>
              </div>
            )}
            <span className={styles.statusBadge}
              style={{background: badge.bg, color: badge.color}}>
              {badge.label}
            </span>
          </div>

          {/* Thông tin */}
          <div className={styles.info}>

            {/* Brand + ID */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px'}}>
              {frame.brand && (
                <p className={styles.brand} style={{margin:0}}>{frame.brand}</p>
              )}
              <span style={{fontSize:'12px',color:'var(--gray-4)',fontWeight:600,letterSpacing:'.05em'}}>
                MÃ SP: #{frame.frameId}
              </span>
            </div>

            <h1 className={styles.name}>{frame.name}</h1>
            <p className={styles.price}>{fmt(frame.price)}</p>

            {/* Thông số */}
            <div className={styles.specs}>
              {specs.map(s => (
                <div key={s.label} className={styles.specItem}>
                  <span className={styles.specLabel}>{s.label}</span>
                  <span className={styles.specValue}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              {user ? (
                <>
                  <button className="btn btn-primary btn-lg"
                    onClick={() => navigate(`/design?frameId=${frame.frameId}`)}>
                    <Eye size={18}/> Thiết kế với gọng này
                  </button>
                  <p className={styles.hint}>
                    Chọn gọng này → tiếp tục chọn tròng và hồ sơ mắt
                  </p>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Đăng nhập để đặt hàng
                  </Link>
                  <Link to="/register" className="btn btn-outline btn-lg">
                    Đăng ký miễn phí
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection frameId={frame.frameId}/>

      </div>
    </div>
  )
}