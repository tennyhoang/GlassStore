import { Link } from 'react-router-dom'
import { Eye, MapPin, Phone, Mail, Clock, Shield, Star, Truck } from 'lucide-react'
import styles from './AboutPage.module.css'

const VALUES = [
  { icon: Eye,    title: 'Chất lượng cao cấp',  desc: 'Mỗi cặp kính đều qua kiểm tra nghiêm ngặt trước khi đến tay khách hàng.' },
  { icon: Shield, title: 'Bảo hành chính hãng', desc: 'Tất cả sản phẩm được bảo hành 12 tháng, đổi trả miễn phí trong 30 ngày.' },
  { icon: Star,   title: 'Thiết kế theo yêu cầu',desc: 'Từ số đo mắt đến chiếc kính hoàn hảo — chúng tôi làm theo từng khách hàng.' },
  { icon: Truck,  title: 'Giao hàng toàn quốc', desc: 'Giao hàng nhanh, theo dõi realtime từ xưởng đến tận nhà bạn.' },
]

const TEAM = [
  { name: 'Nguyễn Văn A', role: 'Giám đốc điều hành', avatar: 'A' },
  { name: 'Trần Thị B',   role: 'Chuyên gia thị giác',  avatar: 'B' },
  { name: 'Lê Văn C',     role: 'Trưởng kỹ thuật',      avatar: 'C' },
  { name: 'Phạm Thị D',   role: 'Thiết kế sản phẩm',   avatar: 'D' },
]

export default function AboutPage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>Về chúng tôi</span>
            <h1>Kính mắt được tạo ra<br/><em>vì bạn</em></h1>
            <p>GlassStore ra đời với sứ mệnh mang đến những chiếc kính cao cấp, được thiết kế riêng theo từng đôi mắt. Chúng tôi kết hợp công nghệ hiện đại với tay nghề thủ công tinh tế.</p>
            <div className={styles.heroCta}>
              <Link to="/shop"     className="btn btn-primary btn-lg">Khám phá sản phẩm</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Tạo tài khoản</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              { num:'5,000+', label:'Khách hàng tin tưởng' },
              { num:'10,000+',label:'Cặp kính đã giao'     },
              { num:'98%',    label:'Khách hàng hài lòng'  },
              { num:'5+',     label:'Năm kinh nghiệm'      },
            ].map((s,i) => (
              <div key={i} className={styles.statItem}>
                <p className={styles.statNum}>{s.num}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>Giá trị cốt lõi</h2>
            <p>Những cam kết chúng tôi giữ với mỗi khách hàng</p>
          </div>
          <div className={styles.valuesGrid}>
            {VALUES.map((v,i) => (
              <div key={i} className={styles.valueCard}>
                <div className={styles.valueIcon}><v.icon size={24} strokeWidth={1.5}/></div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={`section ${styles.teamSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>Đội ngũ của chúng tôi</h2>
            <p>Những người tạo nên GlassStore</p>
          </div>
          <div className={styles.teamGrid}>
            {TEAM.map((m,i) => (
              <div key={i} className={styles.teamCard}>
                <div className={styles.teamAvatar}>{m.avatar}</div>
                <h4>{m.name}</h4>
                <p>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section" id="contact">
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>Liên hệ với chúng tôi</h2>
            <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
          </div>
          <div className={styles.contactGrid}>
            {/* Info */}
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <MapPin size={20} style={{color:'var(--gold)',flexShrink:0}}/>
                <div>
                  <p className={styles.contactLabel}>Địa chỉ</p>
                  <p>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <Phone size={20} style={{color:'var(--gold)',flexShrink:0}}/>
                <div>
                  <p className={styles.contactLabel}>Điện thoại</p>
                  <a href="tel:18001234" style={{color:'var(--ink)'}}>1800 1234</a>
                  <p style={{fontSize:'13px',color:'var(--gray-5)'}}>Miễn phí · 8:00 – 20:00</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <Mail size={20} style={{color:'var(--gold)',flexShrink:0}}/>
                <div>
                  <p className={styles.contactLabel}>Email</p>
                  <a href="mailto:hello@glassstore.vn" style={{color:'var(--ink)'}}>hello@glassstore.vn</a>
                </div>
              </div>
              <div className={styles.contactItem}>
                <Clock size={20} style={{color:'var(--gold)',flexShrink:0}}/>
                <div>
                  <p className={styles.contactLabel}>Giờ làm việc</p>
                  <p>Thứ 2 – Thứ 7: 8:00 – 20:00</p>
                  <p style={{fontSize:'13px',color:'var(--gray-5)'}}>Chủ nhật: 9:00 – 17:00</p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className={styles.contactForm}>
              <h3>Gửi tin nhắn</h3>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Họ tên</label>
                  <input className="form-input" placeholder="Nguyễn Văn A"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="email@example.com"/>
                </div>
              </div>
              <div className="form-group" style={{marginTop:'16px'}}>
                <label className="form-label">Chủ đề</label>
                <select className="form-input">
                  <option>Tư vấn sản phẩm</option>
                  <option>Hỗ trợ đơn hàng</option>
                  <option>Đổi/Trả hàng</option>
                  <option>Khác</option>
                </select>
              </div>
              <div className="form-group" style={{marginTop:'16px'}}>
                <label className="form-label">Nội dung</label>
                <textarea className="form-input" rows={4}
                  placeholder="Nội dung tin nhắn..."
                  style={{resize:'vertical'}}/>
              </div>
              <button className="btn btn-primary" style={{marginTop:'16px',width:'100%'}}
                onClick={() => alert('Cảm ơn! Chúng tôi sẽ liên hệ sớm nhất.')}>
                Gửi tin nhắn
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
