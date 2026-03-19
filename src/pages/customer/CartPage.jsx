import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import styles from './CartPage.module.css'

function fmt(n) {
  return n ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—'
}

export default function CartPage() {
  const { cart, loading, removeItem } = useCart()
  const navigate = useNavigate()

  const handleRemove = async (id) => {
    try { await removeItem(id); toast.success('Đã xoá khỏi giỏ') }
    catch { toast.error('Có lỗi xảy ra') }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'80px'}}><span className="spinner"/></div>

  const items = cart?.items ?? []

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Giỏ hàng</h1>
          <p>{items.length} sản phẩm</p>
        </div>
      </div>

      <div className="container section-sm">
        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={48} strokeWidth={1}/>
            <h3>Giỏ hàng trống</h3>
            <p>Hãy thêm sản phẩm vào giỏ để tiếp tục</p>
            <Link to="/shop" className="btn btn-primary">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Items */}
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.cartItemId} className={styles.item}>
                  <div className={styles.itemImg}>
                    <ShoppingBag size={24} strokeWidth={1} style={{color:'var(--gray-3)'}}/>
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={`badge ${item.itemType === 'CUSTOM_GLASSES' ? 'badge-blue' : 'badge-yellow'}`}>
                      {item.itemType === 'CUSTOM_GLASSES' ? 'Kính thiết kế' : 'Kính làm sẵn'}
                    </span>
                    <h4>{item.designName ?? item.productName ?? `Sản phẩm #${item.cartItemId}`}</h4>
                    <p className={styles.itemQty}>Số lượng: {item.quantity}</p>
                  </div>
                  <div className={styles.itemRight}>
                    <p className={styles.itemPrice}>{fmt(item.subtotal)}</p>
                    <button className={styles.removeBtn} onClick={() => handleRemove(item.cartItemId)}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <h3>Tóm tắt đơn hàng</h3>
              <div className={styles.summaryRow}>
                <span>Tạm tính</span>
                <span>{fmt(cart?.totalAmount)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span className={styles.free}>Miễn phí</span>
              </div>
              <hr className="divider"/>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Tổng cộng</span>
                <span>{fmt(cart?.totalAmount)}</span>
              </div>
              <button className="btn btn-primary" style={{width:'100%',marginTop:'16px'}}
                onClick={() => navigate('/checkout')}>
                Đặt hàng <ArrowRight size={16}/>
              </button>
              <Link to="/shop" className="btn btn-ghost" style={{width:'100%',marginTop:'8px',justifyContent:'center'}}>
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
