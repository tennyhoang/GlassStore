import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, Shield, Ruler, Star } from 'lucide-react'
import { productApi } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomePage.module.css'

const features = [
  { icon: Eye,    title: 'Đo mắt chính xác',     desc: 'Nhập số đo hoặc upload đơn thuốc — hồ sơ mắt lưu trữ vĩnh viễn.' },
  { icon: Ruler,  title: 'Thiết kế theo ý bạn',   desc: 'Tự chọn gọng, tròng và các tùy chọn theo đôi mắt của riêng bạn.' },
  { icon: Shield, title: 'Chất lượng bảo đảm',    desc: 'Kính chính hãng, bảo hành 12 tháng, đổi trả trong 30 ngày.' },
  { icon: Star,   title: 'Giao hàng tận nơi',      desc: 'Theo dõi đơn hàng realtime từ sản xuất đến tận tay.' },
]

export default function HomePage() {
  const [frames,  setFrames]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productApi.getFrames()
      .then(r => setFrames(r.data.data?.slice(0, 4) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.heroEyebrow}>Bộ sưu tập 2024</span>
          <h1 className={styles.heroTitle}>
            Kính mắt được<br/>
            <em>thiết kế riêng</em><br/>
            cho bạn
          </h1>
          <p className={styles.heroDesc}>
            Từ số đo mắt đến chiếc kính hoàn hảo — GlassStore đồng hành từng bước, từ tư vấn đến giao tận tay.
          </p>
          <div className={styles.heroCta}>
            <Link to="/shop"    className="btn btn-primary btn-lg">Khám phá ngay <ArrowRight size={18}/></Link>
            <Link to="/design"  className="btn btn-outline btn-lg">Thiết kế kính</Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardInner}>
              <Eye size={48} strokeWidth={1} className={styles.heroIcon} />
              <p>Đo mắt & Thiết kế</p>
              <p>Theo số đo riêng của bạn</p>
            </div>
          </div>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
        </div>
      </section>

      {/* ── Features ── */}
      <section className={`section ${styles.features}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>Vì sao chọn GlassStore?</h2>
            <p>Quy trình hiện đại, chất lượng đáng tin cậy</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * .1}s` }}>
                <div className={styles.featureIcon}><Icon size={24} strokeWidth={1.5} /></div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured frames ── */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>Gọng kính nổi bật</h2>
            <Link to="/shop" className={styles.viewAll}>Xem tất cả <ArrowRight size={14}/></Link>
          </div>
          {loading ? (
            <div className={styles.loadingRow}>
              {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : (
            <div className={styles.productGrid}>
              {frames.map(frame => <ProductCard key={frame.frameId} item={frame} type="frame" />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div>
              <h2>Bắt đầu hành trình<br/>tìm đôi kính hoàn hảo</h2>
              <p>Tạo hồ sơ mắt miễn phí, thiết kế kính theo ý thích</p>
            </div>
            <div className={styles.ctaBtns}>
              <Link to="/register" className="btn btn-gold btn-lg">Tạo tài khoản miễn phí</Link>
              <Link to="/shop"     className="btn btn-outline btn-lg" style={{color:'white',borderColor:'rgba(255,255,255,.4)'}}>Xem sản phẩm</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
