import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartApi } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, isCustomer } = useAuth()
  const [cart, setCart]       = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isCustomer) return
    try {
      setLoading(true)
      const res = await cartApi.get()
      setCart(res.data.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [isCustomer])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = async (data) => {
    const res = await cartApi.addItem(data)
    setCart(res.data.data)
    return res.data.data
  }

  const removeItem = async (itemId) => {
    const res = await cartApi.removeItem(itemId)
    setCart(res.data.data)
  }

  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addItem, removeItem, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
