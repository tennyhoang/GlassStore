import styles from './Skeleton.module.css'

/**
 * Component skeleton loading dùng chung toàn project.
 * Thay thế spinner đơn giản bằng placeholder có hình dạng giống content thật.
 *
 * Cách dùng:
 *   <Skeleton />                          // rectangle mặc định
 *   <Skeleton width="60%" height="16px" /> // tùy kích thước
 *   <Skeleton circle size="40px" />        // hình tròn (avatar)
 *   <Skeleton.Card />                      // card skeleton
 *   <Skeleton.Table rows={5} />            // table skeleton
 *   <Skeleton.StatGrid />                  // 4 stat cards (dashboard)
 *   <Skeleton.OrderList rows={4} />        // danh sách đơn hàng
 */
export default function Skeleton({ width = '100%', height = '16px', circle = false, size, style = {} }) {
  const computed = circle
    ? { width: size, height: size, borderRadius: '50%' }
    : { width, height, borderRadius: '8px' }

  return <div className={styles.skeleton} style={{ ...computed, ...style }} />
}

// ── Skeleton.Card — dùng cho product card, frame card ──────────────────────
Skeleton.Card = function SkeletonCard({ count = 6 }) {
  return (
    <div className={styles.cardGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          <Skeleton height="220px" />
          <div className={styles.cardBody}>
            <Skeleton width="40%" height="12px" />
            <Skeleton width="80%" height="18px" style={{ marginTop: '8px' }} />
            <Skeleton width="50%" height="16px" style={{ marginTop: '8px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Skeleton.Table — dùng cho staff tables ──────────────────────────────────
Skeleton.Table = function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className={styles.tableWrap}>
      {/* Header */}
      <div className={styles.tableRow} style={{ marginBottom: '8px' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height="14px" style={{ margin: '0 4px' }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.tableRow}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} width={`${100 / cols}%`} height="20px" style={{ margin: '0 4px' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Skeleton.StatGrid — 4 stat cards cho dashboard ──────────────────────────
Skeleton.StatGrid = function SkeletonStatGrid() {
  return (
    <div className={styles.statGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.statCard}>
          <Skeleton circle size="44px" />
          <div className={styles.statInfo}>
            <Skeleton width="60%" height="13px" />
            <Skeleton width="80%" height="24px" style={{ marginTop: '6px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Skeleton.OrderList — danh sách đơn hàng dạng accordion ─────────────────
Skeleton.OrderList = function SkeletonOrderList({ rows = 4 }) {
  return (
    <div className={styles.orderList}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.orderItem}>
          <div className={styles.orderItemLeft}>
            <Skeleton width="60px" height="14px" />
            <Skeleton width="80px" height="22px" style={{ marginLeft: '12px' }} />
            <Skeleton width="80px" height="14px" style={{ marginLeft: '12px' }} />
          </div>
          <Skeleton width="90px" height="18px" />
        </div>
      ))}
    </div>
  )
}

// ── Skeleton.Profile — profile page ─────────────────────────────────────────
Skeleton.Profile = function SkeletonProfile() {
  return (
    <div className={styles.profile}>
      <div className={styles.profileHeader}>
        <Skeleton circle size="80px" />
        <div className={styles.profileInfo}>
          <Skeleton width="160px" height="22px" />
          <Skeleton width="120px" height="14px" style={{ marginTop: '8px' }} />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.formRow}>
          <Skeleton width="100px" height="13px" />
          <Skeleton height="42px" style={{ marginTop: '6px' }} />
        </div>
      ))}
    </div>
  )
}
