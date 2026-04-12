import { useState } from 'react'
import PropTypes from 'prop-types'
import api from '../../../services/api'
import toast from 'react-hot-toast'
import styles from '../StaffPage.module.css'

export default function ResetPasswordModal({ user, onClose, onSaved }) {
  const [newPass, setNewPass] = useState('')
  const [show,    setShow]    = useState(false)
  const [busy,    setBusy]    = useState(false)
  const [result,  setResult]  = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setBusy(true)
      const res = await api.patch(
        `/admin/users/${user.accountId}/reset-password`,
        { newPassword: newPass.trim() || undefined }
      )
      setResult(res.data.message)
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Reset mật khẩu — <span style={{ color: 'var(--gold)' }}>{user.username}</span></h3>

        {result ? (
          // Trạng thái thành công
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <p style={{ fontWeight: 600 }}>{result}</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={onSaved}>
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={show ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Để trống = reset về 123456"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShow(s => !s)}
                >
                  {show ? '🙈' : '👁'}
                </button>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--gray-4)' }}>
                Để trống sẽ reset về mật khẩu mặc định <code>123456</code>
              </span>
            </div>

            <div className={styles.modalBtns}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? <span className="spinner" /> : 'Reset mật khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

ResetPasswordModal.propTypes = {
  user: PropTypes.shape({
    accountId: PropTypes.number.isRequired,
    username:  PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
}
