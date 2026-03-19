import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login, isStaff, isOperation, isShipper } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]   = useState({ username: '', password: '' })
  const [show, setShow]   = useState(false)
  const [busy, setBusy]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Vui lòng nhập đầy đủ thông tin'); return }
    try {
      setBusy(true)
      const user = await login(form.username, form.password)
      toast.success(`Xin chào, ${user.username}!`)
      const isInternal = ['STAFF','ADMIN','OPERATION','SHIPPER'].includes(user.role)
      navigate(isInternal ? '/staff' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Sai tên đăng nhập hoặc mật khẩu')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.top}>
          <Link to="/" className={styles.logo}><Eye size={20} strokeWidth={1.5} /> GlassStore</Link>
          <h2>Đăng nhập</h2>
          <p>Chào mừng trở lại!</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input className="form-input" value={form.username}
              onChange={e => setForm(f => ({...f, username: e.target.value}))}
              placeholder="username" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className={styles.passWrap}>
              <input className="form-input" type={show ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))}
                placeholder="••••••••" />
              <button type="button" className={styles.eyeBtn} onClick={() => setShow(s => !s)}>
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={busy}>
            {busy ? <span className="spinner" /> : 'Đăng nhập'}
          </button>
        </form>
        <p className={styles.footer}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
        <div className={styles.demo}>
          <p>Tài khoản demo:</p>
          <div className={styles.demoList}>
            <code>admin / 123456</code>
            <code>staff01 / 123456</code>
          </div>
        </div>
      </div>
    </div>
  )
}
