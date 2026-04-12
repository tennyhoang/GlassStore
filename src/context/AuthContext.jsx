import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = useCallback(async (username, password) => {
    const res = await authApi.login({ username, password })
    const { token, refreshToken, ...userData } = res.data.data
    // ✅ Lưu cả access token và refresh token
    localStorage.setItem('token',        token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user',         JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (formData) => {
    const res = await authApi.register(formData)
    const { token, refreshToken, ...userData } = res.data.data
    localStorage.setItem('token',        token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user',         JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      // Gọi API logout để revoke refresh token trên server
      await authApi.logout()
    } catch {
      // Nếu API lỗi vẫn logout phía client
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Đã đăng xuất')
    }
  }, [])

  const isCustomer  = user?.role === 'CUSTOMER'
  const isStaff     = ['STAFF', 'ADMIN'].includes(user?.role)
  const isOperation = user?.role === 'OPERATION'
  const isShipper   = user?.role === 'SHIPPER'
  const isAdmin     = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{
      user, login, register, logout,
      isCustomer, isStaff, isOperation, isShipper, isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
