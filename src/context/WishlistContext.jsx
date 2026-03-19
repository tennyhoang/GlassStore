import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  // Load từ localStorage theo từng user
  useEffect(() => {
    if (!user) { setItems([]); return }
    const key = `wishlist_${user.accountId}`
    try {
      const stored = JSON.parse(localStorage.getItem(key) ?? '[]')
      setItems(stored)
    } catch { setItems([]) }
  }, [user])

  const save = (newItems) => {
    if (!user) return
    const key = `wishlist_${user.accountId}`
    localStorage.setItem(key, JSON.stringify(newItems))
    setItems(newItems)
  }

  const toggle = (item) => {
    const exists = items.some(i => i.id === item.id && i.type === item.type)
    if (exists) {
      save(items.filter(i => !(i.id === item.id && i.type === item.type)))
      toast('Đã xoá khỏi yêu thích', { icon: '💔' })
    } else {
      save([...items, { ...item, savedAt: new Date().toISOString() }])
      toast.success('Đã thêm vào yêu thích!')
    }
  }

  const has = (id, type) => items.some(i => i.id === id && i.type === type)
  const clear = () => save([])

  return (
    <WishlistContext.Provider value={{ items, toggle, has, clear, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
