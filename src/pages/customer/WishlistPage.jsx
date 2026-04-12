import { Link } from 'react-router-dom'
import { Heart, Eye, Trash2, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import styles from './WishlistPage.module.css'
import { fmtCurrency, fmtDate } from '../../utils/format'


export default function WishlistPage() {
  const { items, toggle, clear } = useWishlist()

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <h1>Yêu thích</h1>
              <p>{items.length} sản phẩm đã lưu</p>
            </div>
            {items.length > 0 && (
              <button className="btn btn-ghost btn-sm"
                onClick={() => { if(confirm('Xoá tất cả yêu thích?')) clear() }}>
                <Trash2 size={15}/> Xoá tất cả
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {items.length === 0 ? (
          <div className={styles.empty}>
            <Heart size={48} strokeWidth={1}/>
            <h3>Chưa có sản phẩm yêu thích</h3>
            <p>Nhấn ❤️ trên sản phẩm để lưu vào danh sách yêu thích</p>
            <Link to="/shop" className="btn btn-primary">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => (
              <div key={`${item.type}-${item.id}`} className={styles.card}>
                {/* Image */}
                <div className={styles.imgWrap}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className={styles.img}/>
                    : <div className={styles.imgPlaceholder}><Eye size={32} strokeWidth={1}/></div>
                  }
                  <span className={`badge ${item.type==='frame'?'badge-blue':'badge-yellow'} ${styles.typeBadge}`}>
                    {item.type==='frame' ? 'Gọng kính' : 'Kính làm sẵn'}
                  </span>
                  <button className={styles.heartBtn} onClick={() => toggle(item)} title="Xoá yêu thích">
                    <Heart size={18} style={{fill:'#e53935',color:'#e53935'}}/>
                  </button>
                </div>

                {/* Info */}
                <div className={styles.info}>
                  {item.brand && <p className={styles.brand}>{item.brand}</p>}
                  <h4 className={styles.name}>{item.name}</h4>
                  <p className={styles.price}>{fmtCurrency(item.price)}</p>
                  <p className={styles.saved}>
                    Đã lưu: {fmtDate(item.savedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                  {item.type === 'frame' ? (
                    <Link to={`/frames/${item.id}`} className="btn btn-outline btn-sm" style={{flex:1,justifyContent:'center'}}>
                      <Eye size={14}/> Xem chi tiết
                    </Link>
                  ) : (
                    <Link to="/shop" className="btn btn-outline btn-sm" style={{flex:1,justifyContent:'center'}}>
                      <ShoppingBag size={14}/> Xem sản phẩm
                    </Link>
                  )}
                  <Link to="/design" className="btn btn-primary btn-sm" style={{flex:1,justifyContent:'center'}}>
                    Thiết kế ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
