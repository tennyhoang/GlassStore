import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

/**
 * Hook quản lý danh sách user cho trang Admin.
 * Tách toàn bộ logic fetch ra khỏi UI component.
 *
 * Cách dùng:
 *   const { users, loading, refetch } = useUsers()
 */
export function useUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    api.get('/admin/users')
      .then(r => setUsers(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải danh sách người dùng'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  return { users, loading, refetch: fetchUsers }
}
