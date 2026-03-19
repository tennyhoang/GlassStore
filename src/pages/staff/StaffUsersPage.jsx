import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, KeyRound, Search, X } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'
import uStyles from './StaffUsersPage.module.css'

const ROLES = ['CUSTOMER','STAFF','OPERATION','SHIPPER','ADMIN']
const ROLE_COLOR = {
  CUSTOMER:  'badge-blue',
  STAFF:     'badge-yellow',
  OPERATION: 'badge-green',
  SHIPPER:   'badge-blue',
  ADMIN:     'badge-red',
}

export default function StaffUsersPage() {
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('')
  const [modal,       setModal]       = useState(null) // 'create'|{user,'role'}|{user,'reset'}
  const [confirmDel,  setConfirmDel]  = useState(null) // user to delete

  const fetch = () => {
    setLoading(true)
    api.get('/admin/users')
      .then(r => setUsers(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const handleDelete = async (user) => {
    try {
      await api.delete(`/admin/users/${user.accountId}`)
      toast.success(`Đã xoá tài khoản ${user.username}`)
      setConfirmDel(null); fetch()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    }
  }

  // Filter client-side
  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.customerName ?? '').toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  // Thống kê theo role
  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length
    return acc
  }, {})

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h2>Quản lý người dùng</h2>
          <p style={{fontSize:'14px',color:'var(--gray-5)'}}>
            {users.length} tài khoản
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
          <Plus size={15}/> Thêm tài khoản
        </button>
      </div>

      {/* Role stats */}
      <div className={uStyles.roleStats}>
        <button
          className={`${uStyles.roleStat} ${roleFilter === '' ? uStyles.roleStatActive : ''}`}
          onClick={() => setRoleFilter('')}>
          <span className={uStyles.roleCount}>{users.length}</span>
          <span className={uStyles.roleLabel}>Tất cả</span>
        </button>
        {ROLES.map(r => (
          <button key={r}
            className={`${uStyles.roleStat} ${roleFilter === r ? uStyles.roleStatActive : ''}`}
            onClick={() => setRoleFilter(roleFilter === r ? '' : r)}>
            <span className={uStyles.roleCount}>{roleCounts[r]}</span>
            <span className={uStyles.roleLabel}>{r}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className={uStyles.searchBar}>
        <div className={uStyles.searchBox}>
          <Search size={15} style={{color:'var(--gray-4)',flexShrink:0}}/>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo username hoặc tên..."
            className={uStyles.searchInput}/>
          {search && (
            <button onClick={() => setSearch('')}><X size={14} style={{color:'var(--gray-4)'}}/></button>
          )}
        </div>
        {(search || roleFilter) && (
          <span style={{fontSize:'13px',color:'var(--gray-5)'}}>
            {filtered.length} kết quả
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}><span className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>Không tìm thấy tài khoản nào</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Tên / Email</th>
                <th>Role</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.accountId}>
                  <td style={{color:'var(--gray-4)',fontSize:'13px'}}>#{u.accountId}</td>
                  <td>
                    <div className={uStyles.userInfo}>
                      <div className={uStyles.avatar}>{u.username[0]?.toUpperCase()}</div>
                      <strong>{u.username}</strong>
                    </div>
                  </td>
                  <td style={{fontSize:'13px',color:'var(--gray-5)'}}>
                    {u.customerName ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${ROLE_COLOR[u.role] ?? 'badge-gray'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{fontSize:'13px',color:'var(--gray-5)'}}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {/* Đổi role */}
                      <button className="btn btn-ghost btn-sm"
                        title="Đổi role"
                        onClick={() => setModal({ user: u, type: 'role' })}>
                        <Pencil size={14}/>
                      </button>
                      {/* Reset mật khẩu */}
                      <button className="btn btn-ghost btn-sm"
                        title="Reset mật khẩu"
                        onClick={() => setModal({ user: u, type: 'reset' })}>
                        <KeyRound size={14}/>
                      </button>
                      {/* Xoá */}
                      <button className="btn btn-ghost btn-sm"
                        style={{color:'var(--red)'}}
                        title="Xoá tài khoản"
                        onClick={() => setConfirmDel(u)}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal === 'create' && (
        <CreateUserModal
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetch() }}
        />
      )}
      {modal?.type === 'role' && (
        <ChangeRoleModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetch() }}
        />
      )}
      {modal?.type === 'reset' && (
        <ResetPasswordModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={() => setModal(null)}
        />
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDel(null)}>
          <div className={`${styles.modal} ${uStyles.confirmModal}`}
            onClick={e => e.stopPropagation()}>
            <div className={uStyles.confirmIcon}>🗑️</div>
            <h3>Xoá tài khoản?</h3>
            <p>Bạn chắc chắn muốn xoá tài khoản <strong>{confirmDel.username}</strong>?<br/>
            Hành động này không thể hoàn tác.</p>
            <div className={styles.modalBtns}>
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Huỷ</button>
              <button className="btn btn-primary"
                style={{background:'var(--red)'}}
                onClick={() => handleDelete(confirmDel)}>
                Xoá tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Tạo tài khoản ── */
function CreateUserModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    username: '', password: '', role: 'STAFF',
    name: '', email: '', phone: ''
  })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim()) { toast.error('Nhập username'); return }
    if (form.password.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return }
    try {
      setBusy(true)
      await api.post('/admin/users', form)
      toast.success('Tạo tài khoản thành công!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${uStyles.wideModal}`} onClick={e => e.stopPropagation()}>
        <h3>Thêm tài khoản mới</h3>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Username <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={form.username} onChange={set('username')}
                placeholder="username" autoFocus/>
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu <span style={{color:'red'}}>*</span></label>
              <div style={{position:'relative'}}>
                <input className="form-input" type={show?'text':'password'}
                  value={form.password} onChange={set('password')}
                  placeholder="Tối thiểu 6 ký tự" style={{paddingRight:'40px'}}/>
                <button type="button"
                  style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)'}}
                  onClick={() => setShow(s=>!s)}>{show?'🙈':'👁'}</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role <span style={{color:'red'}}>*</span></label>
            <div className={uStyles.roleGrid}>
              {ROLES.map(r => (
                <label key={r}
                  className={`${uStyles.roleOption} ${form.role===r ? uStyles.roleOptionActive : ''}`}>
                  <input type="radio" name="role" value={r}
                    checked={form.role === r}
                    onChange={() => setForm(f=>({...f, role:r}))}/>
                  <span className={`badge ${ROLE_COLOR[r]}`}>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thông tin thêm nếu là CUSTOMER */}
          {form.role === 'CUSTOMER' && (
            <>
              <div className={styles.row2}>
                <div className="form-group">
                  <label className="form-label">Họ tên</label>
                  <input className="form-input" value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com"/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="0901234567"/>
              </div>
            </>
          )}

          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <span className="spinner"/> : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Đổi role ── */
function ChangeRoleModal({ user, onClose, onSaved }) {
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
    } finally { setBusy(false) }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Đổi role — <span style={{color:'var(--gold)'}}>{user.username}</span></h3>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className="form-group">
            <label className="form-label">Chọn role mới</label>
            <div className={uStyles.roleGrid}>
              {ROLES.map(r => (
                <label key={r}
                  className={`${uStyles.roleOption} ${role===r ? uStyles.roleOptionActive : ''}`}>
                  <input type="radio" name="role" value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}/>
                  <span className={`badge ${ROLE_COLOR[r]}`}>{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy || role === user.role}>
              {busy ? <span className="spinner"/> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Reset mật khẩu ── */
function ResetPasswordModal({ user, onClose, onSaved }) {
  const [newPass, setNewPass] = useState('')
  const [show,    setShow]    = useState(false)
  const [busy,    setBusy]    = useState(false)
  const [result,  setResult]  = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setBusy(true)
      const res = await api.patch(`/admin/users/${user.accountId}/reset-password`,
        { newPassword: newPass.trim() || undefined })
      setResult(res.data.message)
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Reset mật khẩu — <span style={{color:'var(--gold)'}}>{user.username}</span></h3>
        {result ? (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>✅</div>
            <p style={{fontWeight:600}}>{result}</p>
            <button className="btn btn-primary" style={{marginTop:'16px'}} onClick={onSaved}>
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <div style={{position:'relative'}}>
                <input className="form-input" type={show?'text':'password'}
                  value={newPass} onChange={e => setNewPass(e.target.value)}
                  placeholder="Để trống = reset về 123456"
                  style={{paddingRight:'40px'}}/>
                <button type="button"
                  style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)'}}
                  onClick={() => setShow(s=>!s)}>{show?'🙈':'👁'}</button>
              </div>
              <span style={{fontSize:'12px',color:'var(--gray-4)'}}>
                Để trống sẽ reset về mật khẩu mặc định <code>123456</code>
              </span>
            </div>
            <div className={styles.modalBtns}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? <span className="spinner"/> : 'Reset mật khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
