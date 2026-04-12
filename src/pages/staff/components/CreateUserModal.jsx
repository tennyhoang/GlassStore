import { useState } from 'react'
import PropTypes from 'prop-types'
import api from '../../../services/api'
import toast from 'react-hot-toast'
import styles from '../StaffPage.module.css'
import uStyles from '../StaffUsersPage.module.css'

const ROLES = ['CUSTOMER', 'STAFF', 'OPERATION', 'SHIPPER', 'ADMIN']
const ROLE_COLOR = {
  CUSTOMER:  'badge-blue',
  STAFF:     'badge-yellow',
  OPERATION: 'badge-green',
  SHIPPER:   'badge-blue',
  ADMIN:     'badge-red',
}

export default function CreateUserModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    username: '', password: '', role: 'STAFF',
    name: '', email: '', phone: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [busy,     setBusy]     = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim())    { toast.error('Nhập username'); return }
    if (form.password.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return }

    try {
      setBusy(true)
      await api.post('/admin/users', form)
      toast.success('Tạo tài khoản thành công!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${uStyles.wideModal}`} onClick={e => e.stopPropagation()}>
        <h3>Thêm tài khoản mới</h3>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Username <span style={{ color: 'red' }}>*</span></label>
              <input
                className="form-input"
                value={form.username}
                onChange={set('username')}
                placeholder="username"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu <span style={{ color: 'red' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Tối thiểu 6 ký tự"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role <span style={{ color: 'red' }}>*</span></label>
            <div className={uStyles.roleGrid}>
              {ROLES.map(r => (
                <label
                  key={r}
                  className={`${uStyles.roleOption} ${form.role === r ? uStyles.roleOptionActive : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => setForm(f => ({ ...f, role: r }))}
                  />
                  <span className={`badge ${ROLE_COLOR[r]}`}>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thông tin thêm chỉ hiện khi role là CUSTOMER */}
          {form.role === 'CUSTOMER' && (
            <>
              <div className={styles.row2}>
                <div className="form-group">
                  <label className="form-label">Họ tên</label>
                  <input className="form-input" value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="0901234567" />
              </div>
            </>
          )}

          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <span className="spinner" /> : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

CreateUserModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
}
