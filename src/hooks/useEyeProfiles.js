import { useState, useEffect, useCallback } from 'react'
import { eyeProfileApi } from '../services/api'
import toast from 'react-hot-toast'

/**
 * Hook quản lý hồ sơ mắt của customer đang đăng nhập.
 *
 * Cách dùng:
 *   const { profiles, activeProfiles, loading, refetch } = useEyeProfiles()
 */
export function useEyeProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)

  const fetchProfiles = useCallback(() => {
    setLoading(true)
    eyeProfileApi.getMyProfiles()
      .then(r => setProfiles(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải hồ sơ mắt'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  // Lọc sẵn chỉ profile đang active — dùng nhiều nơi
  const activeProfiles = profiles.filter(p => p.status === 'ACTIVE')

  return { profiles, activeProfiles, loading, refetch: fetchProfiles }
}
