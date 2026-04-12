import { useState, useEffect } from 'react'
import { Star, Trash2 } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './MyReviewsPage.module.css'

function StarDisplay({ rating }) {
  return (
    <div style={{display:'flex',gap:'2px'}}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14}
          fill={i <= rating ? '#f59e0b' : 'none'}
          stroke={i <= rating ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}/>
      ))}
    </div>
  )
}

const TYPE_LABEL = { FRAME: '🕶️ Gọng kính', READY_MADE: '👓 Kính làm sẵn' }

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    api.get('/reviews/me')
      .then(r => setReviews(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải đánh giá'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Xoá đánh giá này?')) return
    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Đã xoá đánh giá')
      fetch()
    } catch { toast.error('Có lỗi xảy ra') }
  }

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Đánh giá của tôi</h1>
          <p>Các sản phẩm bạn đã đánh giá</p>
        </div>
      </div>
      <div className="container section-sm">
        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:'80px'}}>
            <span className="spinner"/>
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.empty}>
            <Star size={48} strokeWidth={1}/>
            <h3>Chưa có đánh giá nào</h3>
            <p>Hãy mua và đánh giá sản phẩm để giúp cộng đồng</p>
          </div>
        ) : (
          <div className={styles.list}>
            {reviews.map(r => (
              <div key={r.reviewId} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <span className={styles.typeTag}>
                      {TYPE_LABEL[r.targetType] ?? r.targetType}
                    </span>
                    <h4 className={styles.productName}>{r.productName}</h4>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'6px'}}>
                      <StarDisplay rating={r.rating}/>
                      <span style={{fontSize:'13px',color:'var(--gray-5)'}}>
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <button className={styles.deleteBtn}
                    onClick={() => handleDelete(r.reviewId)}>
                    <Trash2 size={15}/>
                  </button>
                </div>
                {r.comment && (
                  <p className={styles.comment}>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
