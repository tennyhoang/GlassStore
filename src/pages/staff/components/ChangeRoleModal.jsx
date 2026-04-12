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

export default function ChangeRoleModal({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user.role)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setBusy(true)
      await api.patch(`/admin/users/${user.accountId}/role`, { role })
      toast.success(`Đã đổi role thành ${role}`)
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Đổi role — <span style={{ color: 'var(--gold)' }}>{user.username}</span></h3>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className="form-group">
            <label className="form-label">Chọn role mới</label>
            <div className={uStyles.roleGrid}>
              {ROLES.map(r => (
                <label
                  key={r}
                  className={`${uStyles.roleOption} ${role === r ? uStyles.roleOptionActive : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                  />
                  <span className={`badge ${ROLE_COLOR[r]}`}>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy || role === user.role}>
              {busy ? <span className="spinner" /> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

ChangeRoleModal.propTypes = {
  user: PropTypes.shape({
    accountId: PropTypes.number.isRequired,
    username:  PropTypes.string.isRequired,
    role:      PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
}
