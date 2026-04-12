import { useState } from 'react'
import { User, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('info') // 'info' | 'password'

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Tài khoản của tôi</h1>
          <p>Quản lý thông tin cá nhân</p>
        </div>
      </div>

      <div className="container section-sm">
        <div className={styles.layout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.avatarBox}>
              <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
              <p className={styles.username}>{user?.username}</p>
              <span className="badge badge-blue">{user?.role}</span>
            </div>
            <nav className={styles.sideNav}>
              <button
                className={`${styles.navItem} ${tab === 'info' ? styles.navActive : ''}`}
                onClick={() => setTab('info')}>
                <User size={16}/> Thông tin cá nhân
              </button>
              <button
                className={`${styles.navItem} ${tab === 'password' ? styles.navActive : ''}`}
                onClick={() => setTab('password')}>
                <Lock size={16}/> Đổi mật khẩu
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {tab === 'info'     && <InfoForm user={user} />}
            {tab === 'password' && <PasswordForm logout={logout} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Cập nhật thông tin ── */
function InfoForm({ user }) {
  const [form, setForm] = useState({
    name:    user?.name    ?? '',
    email:   user?.email   ?? '',
    phone:   user?.phone   ?? '',
    address: user?.address ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())  { toast.error('Họ tên không được để trống'); return }
    if (!form.email.trim()) { toast.error('Email không được để trống');   return }
    try {
      setBusy(true)
      await api.put('/customers/me', form)
      // Cập nhật localStorage
      const stored = JSON.parse(localStorage.getItem('user') ?? '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, ...form }))
      setSaved(true)
      toast.success('Cập nhật thông tin thành công!')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  return (
    <div className={styles.formCard}>
      <h3>Thông tin cá nhân</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row2}>
          <div className="form-group">
            <label className="form-label">Họ và tên <span style={{color:'red'}}>*</span></label>
            <input className="form-input" value={form.name} onChange={set('name')}
              placeholder="Nguyễn Văn A" />
          </div>
          <div className="form-group">
            <label className="form-label">Email <span style={{color:'red'}}>*</span></label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')}
              placeholder="email@example.com" />
          </div>
        </div>
        <div className={styles.row2}>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="form-input" value={form.phone} onChange={set('phone')}
              placeholder="0901234567" />
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input className="form-input" value={form.address} onChange={set('address')}
              placeholder="123 Đường ABC, TP.HCM" />
          </div>
        </div>

        {/* Readonly fields */}
        <div className="form-group">
          <label className="form-label">Tên đăng nhập</label>
          <input className="form-input" value={user?.username ?? ''} disabled
            style={{background:'var(--gray-1)',color:'var(--gray-5)'}}/>
          <span style={{fontSize:'12px',color:'var(--gray-4)'}}>Không thể thay đổi tên đăng nhập</span>
        </div>

        <div className={styles.formFooter}>
          {saved && (
            <span className={styles.savedMsg}>
              <CheckCircle size={15} style={{color:'#2e7d32'}}/> Đã lưu
            </span>
          )}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <span className="spinner"/> : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Đổi mật khẩu ── */
function PasswordForm({ logout }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [show, setShow] = useState({ cur: false, new: false, con: false })
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.currentPassword) { toast.error('Nhập mật khẩu hiện tại'); return }
    if (form.newPassword.length < 6) { toast.error('Mật khẩu mới tối thiểu 6 ký tự'); return }
    if (form.newPassword !== form.confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return }
    if (form.currentPassword === form.newPassword) { toast.error('Mật khẩu mới phải khác mật khẩu cũ'); return }
    try {
      setBusy(true)
      await api.patch('/customers/me/password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      })
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
      setTimeout(() => logout(), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Mật khẩu hiện tại không đúng')
    } finally { setBusy(false) }
  }

  const EyeBtn = ({ field }) => (
    <button type="button" className={styles.eyeBtn}
      onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}>
      {show[field] ? '🙈' : '👁'}
    </button>
  )

  const strength = (pw) => {
    if (!pw) return null
    if (pw.length < 6)  return { label: 'Yếu', cls: styles.strengthWeak }
    if (pw.length < 10) return { label: 'Trung bình', cls: styles.strengthMid }
    return { label: 'Mạnh', cls: styles.strengthStrong }
  }
  const s = strength(form.newPassword)

  return (
    <div className={styles.formCard}>
      <h3>Đổi mật khẩu</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="form-group">
          <label className="form-label">Mật khẩu hiện tại <span style={{color:'red'}}>*</span></label>
          <div className={styles.passWrap}>
            <input className="form-input" type={show.cur ? 'text' : 'password'}
              value={form.currentPassword} onChange={set('currentPassword')}
              placeholder="••••••••" autoFocus />
            <EyeBtn field="cur"/>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu mới <span style={{color:'red'}}>*</span></label>
          <div className={styles.passWrap}>
            <input className="form-input" type={show.new ? 'text' : 'password'}
              value={form.newPassword} onChange={set('newPassword')}
              placeholder="Tối thiểu 6 ký tự" />
            <EyeBtn field="new"/>
          </div>
          {s && <span className={`${styles.strength} ${s.cls}`}>{s.label}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Xác nhận mật khẩu mới <span style={{color:'red'}}>*</span></label>
          <div className={styles.passWrap}>
            <input className="form-input" type={show.con ? 'text' : 'password'}
              value={form.confirmPassword} onChange={set('confirmPassword')}
              placeholder="Nhập lại mật khẩu mới" />
            <EyeBtn field="con"/>
          </div>
          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <span className="form-error">Mật khẩu không khớp</span>
          )}
          {form.confirmPassword && form.newPassword === form.confirmPassword && form.confirmPassword.length > 0 && (
            <span style={{fontSize:'12px',color:'#2e7d32'}}>✓ Mật khẩu khớp</span>
          )}
        </div>

        <div className={styles.formFooter}>
          <span style={{fontSize:'13px',color:'var(--gray-5)'}}>
            Sau khi đổi bạn sẽ được đăng xuất tự động
          </span>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <span className="spinner"/> : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  )
}
