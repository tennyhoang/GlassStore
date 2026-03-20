import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Eye, Heart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './ProductCard.module.css'

function fmt(n) {
  if (!n) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

export default function ProductCard({ item, type = 'frame' }) {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const wishlist = useWishlist()
  const { user } = useAuth()

  // Safe — không crash nếu context chưa sẵn sàng
  const wished = wishlist ? wishlist.has(item?.frameId ?? item?.productId, type) : false

  const id    = item?.frameId ?? item?.productId
  const name  = item?.name  ?? ''
  const brand = item?.brand ?? ''
  const price = item?.price ?? 0

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!user) { toast.error('Vui lòng đăng nhập để lưu yêu thích'); return }
    if (wishlist) wishlist.toggle({ id, type, name, brand, price, imageUrl: item?.imageUrl })
  }

  const handleAddCart = (e) => {
    e.preventDefault()
    if (!user) { toast.error('Vui lòng đăng nhập'); return }
    addItem({ itemType: type === 'ready' ? 'READY_MADE' : 'FRAME', productId: id, quantity: 1 })
    toast.success('Đã thêm vào giỏ hàng!')
  }

  return (
    <Link to={type === 'frame' ? `/frames/${id}` : '#'} className={styles.card}>
      {/* Image */}
      <div className={styles.imgWrap}>
        {item?.imageUrl
          ? <img src={item.imageUrl} alt={name} className={styles.img}/>
          : <div className={styles.imgPlaceholder}><Eye size={28} strokeWidth={1}/></div>
        }
        {item?.status === 'DISCONTINUED' && (
          <span className={`badge badge-gray ${styles.statusBadge}`}>Ngừng bán</span>
        )}
        <button className={styles.heartBtn} onClick={handleWishlist}>
          <Heart size={16} style={{
            fill:  wished ? '#e53935' : 'none',
            color: wished ? '#e53935' : 'var(--gray-3)'
          }}/>
        </button>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2px'}}>
          {brand && <p className={styles.brand} style={{margin:0}}>{brand}</p>}
          <span style={{fontSize:'10px',color:'var(--gray-3)',fontWeight:600}}>ID: {id}</span>
        </div>
        <h4 className={styles.name}>{name}</h4>
        <div className={styles.footer}>
          <span className={styles.price}>{fmt(price)}</span>
          {type === 'ready' && item?.status !== 'OUT_OF_STOCK' && (
            <button className={`btn btn-primary btn-sm ${styles.addBtn}`}
              onClick={handleAddCart}>
              <ShoppingBag size={13}/> Thêm
            </button>
          )}
          {item?.status === 'OUT_OF_STOCK' && (
            <button className={`btn btn-outline btn-sm ${styles.addBtn}`}
              style={{color:'#e65100',borderColor:'#e65100',fontSize:'11px'}}
              onClick={e => { e.preventDefault(); navigate(`/pre-order?productId=${id}&type=${type}`) }}>
              Đặt trước
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}