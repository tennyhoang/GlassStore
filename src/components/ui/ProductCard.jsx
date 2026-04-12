import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Eye, Heart } from 'lucide-react'
import { useCart }     from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth }     from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './ProductCard.module.css'
import { fmtCurrency } from '../../utils/format'

import PropTypes from 'prop-types'

export default function ProductCard({ item, type = 'frame' }) {
  const { addItem } = useCart()
  const navigate    = useNavigate()
  const wishlist    = useWishlist()
  const { user }    = useAuth()

  const wished = wishlist ? wishlist.has(item?.frameId ?? item?.productId, type) : false

  const id    = item?.frameId ?? item?.productId
  const name  = item?.name    ?? ''
  const brand = item?.brand   ?? ''
  const price = item?.price   ?? 0
  const stock = item?.stockQuantity ?? 0
  const isOutOfStock   = item?.status === 'OUT_OF_STOCK' || stock === 0
  const isDiscontinued = item?.status === 'DISCONTINUED'

  // Thong tin phu (shape, material, color)
  const detail = [item?.shape, item?.material, item?.color]
    .filter(Boolean).join(' · ')

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!user) { toast.error('Vui long dang nhap de luu yeu thich'); return }
    if (wishlist) wishlist.toggle({ id, type, name, brand, price, imageUrl: item?.imageUrl })
  }

  const handleAddCart = (e) => {
    e.preventDefault()
    if (!user) { toast.error('Vui long dang nhap'); return }
    addItem({ readyMadeGlassesId: id, quantity: 1 })
    toast.success('Da them vao gio hang!')
  }

  return (
    <Link
      to={type === 'frame' ? `/frames/${id}` : '#'}
      className={styles.card}
      aria-label={`${name} - ${fmtCurrency(price)}`}
    >
      {/* Anh san pham */}
      <div className={styles.imgWrap}>
        {item?.imageUrl
          ? <img src={item.imageUrl} alt={name} className={styles.img} loading="lazy" />
          : <div className={styles.imgPlaceholder}><Eye size={28} strokeWidth={1} /></div>
        }

        {/* Status badge */}
        {isDiscontinued && (
          <span className={styles.statusBadge} style={{ background: '#374151', color: '#fff' }}>
            Ngung ban
          </span>
        )}
        {isOutOfStock && !isDiscontinued && (
          <span className={styles.statusBadge} style={{ background: '#FEF3C7', color: '#92400E' }}>
            Het hang
          </span>
        )}
        {!isOutOfStock && !isDiscontinued && stock > 0 && stock <= 5 && (
          <span className={styles.statusBadge} style={{ background: '#FEE2E2', color: '#991B1B' }}>
            Con {stock} cai
          </span>
        )}

        {/* Nut yeu thich */}
        <button
          className={styles.heartBtn}
          onClick={handleWishlist}
          aria-label={wished ? 'Bo khoi yeu thich' : 'Them vao yeu thich'}
        >
          <Heart size={16} style={{
            fill:  wished ? '#DC2626' : 'none',
            color: wished ? '#DC2626' : '#D1D5DB',
          }} />
        </button>

        {/* Overlay hover */}
        <div className={styles.overlay}>
          <div className={styles.overlayBtn}>
            <Eye size={15} /> Xem chi tiet
          </div>
        </div>
      </div>

      {/* Thong tin san pham */}
      <div className={styles.info}>
        {brand && <p className={styles.brand}>{brand}</p>}
        <h4 className={styles.name}>{name}</h4>
        {detail && (
          <p className={styles.detail}>{detail}</p>
        )}

        <div className={styles.footer}>
          <div>
            <span className={styles.price}>{fmtCurrency(price)}</span>
            {/* Ton kho */}
            {!isOutOfStock && !isDiscontinued && (
              <span style={{
                display: 'block', fontSize: 12, color: '#9CA3AF', marginTop: 2
              }}>
                {stock > 10 ? 'Con hang' : `Con ${stock} san pham`}
              </span>
            )}
          </div>

          {/* Actions */}
          {type === 'ready' && !isOutOfStock && !isDiscontinued && (
            <button
              className={`btn btn-primary btn-sm ${styles.addBtn}`}
              onClick={handleAddCart}
              aria-label={`Them ${name} vao gio hang`}
            >
              <ShoppingBag size={14} /> Them
            </button>
          )}
          {(isOutOfStock || stock === 0) && !isDiscontinued && (
            <button
              className={`btn btn-sm ${styles.addBtn}`}
              style={{ color: '#D97706', borderColor: '#D97706', border: '1.5px solid', background: '#FFFBEB' }}
              onClick={e => {
                e.preventDefault()
                navigate(`/pre-order?productId=${id}&type=${type}`)
              }}
              aria-label={`Dat truoc ${name}`}
            >
              Dat truoc
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

ProductCard.propTypes = {
  item: PropTypes.shape({
    frameId:       PropTypes.number,
    productId:     PropTypes.number,
    name:          PropTypes.string,
    brand:         PropTypes.string,
    price:         PropTypes.number,
    imageUrl:      PropTypes.string,
    status:        PropTypes.string,
    stockQuantity: PropTypes.number,
    shape:         PropTypes.string,
    material:      PropTypes.string,
    color:         PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(['frame', 'ready']),
}