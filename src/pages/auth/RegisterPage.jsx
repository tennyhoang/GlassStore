import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', username: '', password: ''
  })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.username || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc'); return
    }
    try {
      setBusy(true)
      await register(form)
      toast.success('Đăng ký thành công!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đăng ký thất bại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.top}>
          <Link to="/" className={styles.logo}><Eye size={20} strokeWidth={1.5} /> GlassStore</Link>
          <h2>Tạo tài khoản</h2>
          <p>Bắt đầu hành trình tìm đôi kính hoàn hảo</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Họ và tên <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A" />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span style={{color:'red'}}>*</span></label>
              <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
            </div>
          </div>
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Số điện thoại <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="0901234567" />
            </div>
            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <input className="form-input" value={form.address} onChange={set('address')} placeholder="123 Đường ABC, TP.HCM" />
            </div>
          </div>
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={form.username} onChange={set('username')} placeholder="username" />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu <span style={{color:'red'}}>*</span></label>
              <div className={styles.passWrap}>
                <input className="form-input" type={show ? 'text' : 'password'}
                  value={form.password} onChange={set('password')} placeholder="Tối thiểu 6 ký tự" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShow(s=>!s)}>
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={busy}>
            {busy ? <span className="spinner"/> : 'Tạo tài khoản'}
          </button>
        </form>
        <p className={styles.footer}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
