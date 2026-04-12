import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, KeyRound, Search, X } from 'lucide-react'
import { useUsers } from '../../hooks/useUsers'
import { fmtDate } from '../../utils/format'
import api from '../../services/api'
import toast from 'react-hot-toast'

// Modal components
import CreateUserModal from './components/CreateUserModal'
import ChangeRoleModal from './components/ChangeRoleModal'
import ResetPasswordModal from './components/ResetPasswordModal'

import styles from './StaffPage.module.css'
import uStyles from './StaffUsersPage.module.css'
import Skeleton from '../../components/ui/Skeleton'

const ROLES = ['CUSTOMER', 'STAFF', 'OPERATION', 'SHIPPER', 'ADMIN']
const ROLE_COLOR = {
  CUSTOMER: 'badge-blue',
  STAFF: 'badge-yellow',
  OPERATION: 'badge-green',
  SHIPPER: 'badge-blue',
  ADMIN: 'badge-red',
}

export default function StaffUsersPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const { users, loading, refetch } = useUsers()

  // ── UI state ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modal, setModal] = useState(null)   // 'create' | { type, user }
  const [confirmDel, setConfirmDel] = useState(null)   // user object cần xoá

  // ── Derived state ────────────────
  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      u.username.toLowerCase().includes(q) ||
      (u.customerName ?? '').toLowerCase().includes(q)
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  }), [users, search, roleFilter])

  const roleCounts = useMemo(() =>
    ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {})
    , [users])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDelete = async (user) => {
    try {
      await api.delete(`/admin/users/${user.accountId}`)
      toast.success(`Đã xoá tài khoản ${user.username}`)
      setConfirmDel(null)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    }
  }

  const closeModal = () => setModal(null)
  const savedModal = () => { closeModal(); refetch() }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2>Quản lý người dùng</h2>
          <p style={{ fontSize: '14px', color: 'var(--gray-5)' }}>{users.length} tài khoản</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
          <Plus size={15} /> Thêm tài khoản
        </button>
      </div>

      {/* Role filter tabs */}
      <div className={uStyles.roleStats}>
        <button
          className={`${uStyles.roleStat} ${roleFilter === '' ? uStyles.roleStatActive : ''}`}
          onClick={() => setRoleFilter('')}
        >
          <span className={uStyles.roleCount}>{users.length}</span>
          <span className={uStyles.roleLabel}>Tất cả</span>
        </button>
        {ROLES.map(r => (
          <button
            key={r}
            className={`${uStyles.roleStat} ${roleFilter === r ? uStyles.roleStatActive : ''}`}
            onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
          >
            <span className={uStyles.roleCount}>{roleCounts[r]}</span>
            <span className={uStyles.roleLabel}>{r}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className={uStyles.searchBar}>
        <div className={uStyles.searchBox}>
          <Search size={15} style={{ color: 'var(--gray-4)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo username hoặc tên..."
            className={uStyles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={14} style={{ color: 'var(--gray-4)' }} />
            </button>
          )}
        </div>
        {(search || roleFilter) && (
          <span style={{ fontSize: '13px', color: 'var(--gray-5)' }}>
            {filtered.length} kết quả
          </span>
        )}
      </div>

      {/* Table Section */}
      {loading ? (
        <Skeleton.Table rows={7} cols={6} />
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
              {filtered.map(u =>
                <tr key={u.accountId}>
                  <td style={{ color: 'var(--gray-4)', fontSize: '13px' }}>#{u.accountId}</td>
                  <td>
                    <div className={uStyles.userInfo}>
                      <div className={uStyles.avatar}>{u.username[0]?.toUpperCase()}</div>
                      <strong>{u.username}</strong>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--gray-5)' }}>
                    {u.customerName ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${ROLE_COLOR[u.role] ?? 'badge-gray'}`}>{u.role}</span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--gray-5)' }}>
                    {fmtDate(u.createdAt)}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Đổi role"
                        onClick={() => setModal({ type: 'role', user: u })}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Reset mật khẩu"
                        onClick={() => setModal({ type: 'reset', user: u })}
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)' }}
                        title="Xoá tài khoản"
                        onClick={() => setConfirmDel(u)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal === 'create' && (
        <CreateUserModal onClose={closeModal} onSaved={savedModal} />
      )}
      {modal?.type === 'role' && (
        <ChangeRoleModal user={modal.user} onClose={closeModal} onSaved={savedModal} />
      )}
      {modal?.type === 'reset' && (
        <ResetPasswordModal user={modal.user} onClose={closeModal} onSaved={closeModal} />
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDel(null)}>
          <div
            className={`${styles.modal} ${uStyles.confirmModal}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={uStyles.confirmIcon}>🗑️</div>
            <h3>Xoá tài khoản?</h3>
            <p>
              Bạn chắc chắn muốn xoá tài khoản <strong>{confirmDel.username}</strong>?<br />
              Hành động này không thể hoàn tác.
            </p>
            <div className={styles.modalBtns}>
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Huỷ</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--red)' }}
                onClick={() => handleDelete(confirmDel)}
              >
                Xoá tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}