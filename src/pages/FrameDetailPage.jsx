import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Eye, ArrowLeft, Pencil, Heart, Star } from 'lucide-react'
import { productApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import ReviewSection from '../components/ui/ReviewSection'
import toast from 'react-hot-toast'
import styles from './FrameDetailPage.module.css'
import { fmtCurrency } from '../utils/format'

const BADGE_COLORS = {
  AVAILABLE:    { bg: '#DCFCE7', color: '#166534', label: 'Con hang'  },
  DISCONTINUED: { bg: '#FEE2E2', color: '#991B1B', label: 'Ngung ban' },
  OUT_OF_STOCK: { bg: '#FEF3C7', color: '#92400E', label: 'Het hang'  },
}

export default function FrameDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user, isCustomer } = useAuth()
  const wishlist = useWishlist()

  const [frame,   setFrame]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('info')

  useEffect(() => {
    productApi.getFrame(id)
      .then(r => setFrame(r.data.data))
      .catch(() => { toast.error('Khong tim thay san pham'); navigate('/shop') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
      <span className="spinner" />
    </div>
  )
  if (!frame) return null

  const badge  = BADGE_COLORS[frame.status] ?? BADGE_COLORS.AVAILABLE
  const wished = wishlist?.has(frame.frameId, 'frame') ?? false
  const canBuy = frame.status === 'AVAILABLE' && (frame.stockQuantity ?? 0) > 0

  const specs = [
    { label: 'Thuong hieu', value: frame.brand    },
    { label: 'Mau sac',     value: frame.color    },
    { label: 'Chat lieu',   value: frame.material },
    { label: 'Kieu dang',   value: frame.shape    },
    { label: 'Ton kho',     value: frame.stockQuantity != null ? `${frame.stockQuantity} cai` : null },
  ].filter(s => s.value)

  const handleWishlist = () => {
    if (!user) { toast.error('Vui long dang nhap de luu yeu thich'); return }
    wishlist?.toggle({
      id: frame.frameId, type: 'frame',
      name: frame.name, brand: frame.brand,
      price: frame.price, imageUrl: frame.imageUrl,
    })
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ padding: '40px 24px 80px' }}>

        {/* Back */}
        <Link to="/shop" className={styles.back}>
          <ArrowLeft size={16} /> Quay lai cua hang
        </Link>

        {/* Main layout */}
        <div className={styles.main}>

          {/* Hình ảnh */}
          <div className={styles.imgBox}>
            {frame.imageUrl ? (
              <img src={frame.imageUrl} alt={frame.name} className={styles.img} />
            ) : (
              <div className={styles.imgPlaceholder}>
                <Eye size={64} strokeWidth={1} style={{ color: 'var(--gray-3)' }} />
                <p>Chua co hinh anh</p>
              </div>
            )}
            <span className={styles.statusBadge}
              style={{ background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>

            {/* Wishlist */}
            {user && (
              <button onClick={handleWishlist} style={{
                position: 'absolute', top: 14, right: 14,
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.95)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: '150ms',
              }}>
                <Heart size={18} style={{
                  fill:  wished ? '#DC2626' : 'none',
                  color: wished ? '#DC2626' : '#9CA3AF',
                }} />
              </button>
            )}
          </div>

          {/* Thong tin */}
          <div className={styles.info}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              {frame.brand && <p className={styles.brand} style={{ margin: 0 }}>{frame.brand}</p>}
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>
                #{frame.frameId}
              </span>
            </div>

            <h1 className={styles.name}>{frame.name}</h1>
            <p className={styles.price}>{fmtCurrency(frame.price)}</p>

            {/* Specs */}
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
                canBuy ? (
                  <>
                    {/* Thiet ke kính day du */}
                    <button
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/design?frameId=${frame.frameId}`)}
                    >
                      <Pencil size={18} /> Thiet ke kinh voi gong nay
                    </button>

                    {/* Phan cach */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      color: '#9CA3AF', fontSize: 13, margin: '2px 0',
                    }}>
                      <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                      hoac
                      <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                    </div>

                    {/* Chi mua gong */}
                    <button
                      className="btn btn-outline btn-lg"
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/design?frameId=${frame.frameId}&frameOnly=true`)}
                    >
                      Chi mua gong (khong kem trong)
                    </button>

                    <p className={styles.hint} style={{ textAlign: 'center' }}>
                      "Thiet ke" = chon trong + ho so mat · "Chi gong" = mua gong nguyen
                    </p>
                  </>
                ) : frame.status === 'OUT_OF_STOCK' ? (
                  <button
                    className="btn btn-outline btn-lg"
                    style={{ width: '100%', color: '#D97706', borderColor: '#D97706' }}
                    onClick={() => navigate(`/pre-order?productId=${frame.frameId}&type=frame`)}
                  >
                    Dat truoc khi co hang
                  </button>
                ) : (
                  <div style={{
                    padding: 16, background: '#FEE2E2', borderRadius: 12,
                    color: '#991B1B', fontSize: 14, textAlign: 'center',
                  }}>
                    San pham da ngung kinh doanh
                  </div>
                )
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}>
                    Dang nhap de dat hang
                  </Link>
                  <Link to="/register" className="btn btn-outline btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}>
                    Dang ky mien phi
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1.5px solid #E5E7EB',
          marginTop: 56, marginBottom: 32,
        }}>
          {[
            ['info',    'Thong tin san pham'],
            ['reviews', 'Danh gia & Nhan xet'],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '12px 28px', fontSize: 15,
              fontWeight: tab === k ? 700 : 500,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === k ? '2.5px solid #1a1a2e' : '2.5px solid transparent',
              color: tab === k ? '#111' : '#9CA3AF',
              marginBottom: -1.5, transition: '150ms',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {k === 'reviews' && <Star size={14} />}
              {l}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'info' ? (
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {specs.map(s => (
                <div key={s.label} style={{
                  padding: '14px 18px', background: '#F9FAFB',
                  borderRadius: 12, border: '1px solid #E5E7EB',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#111' }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              padding: '18px 20px', background: '#EFF6FF',
              borderRadius: 12, border: '1px solid #BFDBFE',
            }}>
              <p style={{ fontWeight: 700, color: '#1D4ED8', margin: '0 0 10px', fontSize: 14 }}>
                Quy trinh dat kinh tai GlassStore
              </p>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#3B82F6', lineHeight: 2 }}>
                <li>Chon gong nay → nhan "Thiet ke kinh voi gong nay"</li>
                <li>Chon loai trong kinh phu hop</li>
                <li>Nhap ho so mat (so do mat)</li>
                <li>Xac nhan va thanh toan</li>
                <li>San xuat trong 3-5 ngay · Giao hang tan nha</li>
              </ol>
            </div>
          </div>
        ) : (
          /* ReviewSection voi dung prop type va id */
          <ReviewSection type="frame" id={frame.frameId} />
        )}

      </div>
    </div>
  )
}