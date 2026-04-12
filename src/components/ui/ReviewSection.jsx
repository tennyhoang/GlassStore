import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './ReviewSection.module.css'

/* ── Component chính ── */
export default function ReviewSection({ type, id }) {
  // type: 'frame' | 'product'
  const { user, isCustomer } = useAuth()
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)

  const fetchReviews = () => {
    const url = type === 'frame'
      ? `/reviews/frames/${id}`
      : `/reviews/products/${id}`
    api.get(url)
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (id) fetchReviews() }, [id, type])

  const myReview = data?.reviews?.find(
    r => r.customerName === user?.name || r.customerName === user?.username
  )

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3>Đánh giá sản phẩm</h3>
          {data && (
            <div className={styles.avgRow}>
              <StarDisplay rating={data.avgRating} size={20}/>
              <span className={styles.avgNum}>{data.avgRating?.toFixed(1) ?? '0.0'}</span>
              <span className={styles.totalCount}>({data.totalCount} đánh giá)</span>
            </div>
          )}
        </div>
        {isCustomer && !myReview && (
          <button
            className={`btn btn-outline btn-sm ${showForm ? 'btn-primary' : ''}`}
            onClick={() => setShowForm(s => !s)}>
            <Star size={14}/> {showForm ? 'Đóng' : 'Viết đánh giá'}
          </button>
        )}
      </div>

      {/* Biểu đồ sao */}
      {data && data.totalCount > 0 && (
        <RatingBar reviews={data.reviews}/>
      )}

      {/* Form viết review */}
      {showForm && isCustomer && (
        <ReviewForm
          type={type} id={id}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchReviews() }}
        />
      )}

      {/* Danh sách review */}
      {loading ? (
        <div className={styles.loading}><span className="spinner"/></div>
      ) : !data || data.totalCount === 0 ? (
        <div className={styles.empty}>
          <Star size={32} strokeWidth={1}/>
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className={styles.reviewList}>
          {data.reviews.map(r => (
            <ReviewCard key={r.reviewId} review={r}
              canDelete={isCustomer && (r.customerName === user?.name || r.customerName === user?.username)}
              onDeleted={fetchReviews}/>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Stars display ── */
function StarDisplay({ rating, size = 16 }) {
  return (
    <div style={{display:'flex',gap:'2px'}}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke={i <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}/>
      ))}
    </div>
  )
}

/* ── Rating bar breakdown ── */
function RatingBar({ reviews }) {
  const counts = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length > 0
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0
  }))

  return (
    <div className={styles.ratingBar}>
      {counts.map(({ star, count, pct }) => (
        <div key={star} className={styles.ratingRow}>
          <span className={styles.starLabel}>{star} ★</span>
          <div className={styles.barTrack}>
            <div className={styles.barFill}
              style={{width:`${pct}%`, background: star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444'}}/>
          </div>
          <span className={styles.barCount}>{count}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Form viết review ── */
function ReviewForm({ type, id, onClose, onSaved }) {
  const [rating,  setRating]  = useState(0)
  const [hover,   setHover]   = useState(0)
  const [comment, setComment] = useState('')
  const [busy,    setBusy]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Vui lòng chọn số sao'); return }
    try {
      setBusy(true)
      await api.post('/reviews', {
        frameId:   type === 'frame'   ? id : undefined,
        productId: type === 'product' ? id : undefined,
        rating,
        comment: comment.trim() || undefined,
      })
      toast.success('Đã gửi đánh giá, cảm ơn bạn!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  const labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc']

  return (
    <div className={styles.formCard}>
      <h4>Đánh giá của bạn</h4>
      <form onSubmit={handleSubmit}>
        {/* Stars selector */}
        <div className={styles.starSelector}>
          {[1,2,3,4,5].map(i => (
            <button key={i} type="button"
              className={styles.starBtn}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}>
              <Star size={32}
                fill={(hover || rating) >= i ? '#f59e0b' : 'none'}
                stroke={(hover || rating) >= i ? '#f59e0b' : '#d1d5db'}
                strokeWidth={1.5}/>
            </button>
          ))}
          {(hover || rating) > 0 && (
            <span className={styles.starLabel}>{labels[hover || rating]}</span>
          )}
        </div>

        {/* Comment */}
        <div className="form-group" style={{marginTop:'16px'}}>
          <label className="form-label">Nhận xét (tuỳ chọn)</label>
          <textarea className="form-input" rows={3}
            value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            style={{resize:'vertical'}}/>
        </div>

        <div style={{display:'flex',gap:'8px',marginTop:'12px',justifyContent:'flex-end'}}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Huỷ</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy || rating === 0}>
            {busy ? <span className="spinner"/> : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Review Card ── */
function ReviewCard({ review, canDelete, onDeleted }) {
  const [busy, setBusy] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Xoá đánh giá này?')) return
    try {
      setBusy(true)
      await api.delete(`/reviews/${review.reviewId}`)
      toast.success('Đã xoá đánh giá')
      onDeleted()
    } catch { toast.error('Có lỗi xảy ra') }
    finally { setBusy(false) }
  }

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewer}>
          <div className={styles.reviewerAvatar}>
            {review.customerName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className={styles.reviewerName}>{review.customerName}</p>
            <p className={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <StarDisplay rating={review.rating}/>
          {canDelete && (
            <button className={styles.deleteBtn} onClick={handleDelete} disabled={busy}>
              {busy ? <span className="spinner" style={{width:'14px',height:'14px'}}/> : '✕'}
            </button>
          )}
        </div>
      </div>
      {review.comment && (
        <p className={styles.reviewComment}>{review.comment}</p>
      )}
    </div>
  )
}

import PropTypes from 'prop-types'

ReviewSection.propTypes = {
  type: PropTypes.oneOf(['frame', 'product']).isRequired,
  id:   PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}
