import { useState, useEffect, useCallback } from 'react'
import { orderApi } from '../services/api'
import toast from 'react-hot-toast'

/**
 * Hook quản lý đơn hàng của customer.
 *
 * Cách dùng:
 *   const { orders, loading, refetch } = useOrders()
 */
export function useOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(() => {
    setLoading(true)
    orderApi.getMyOrders()
      .then(r => setOrders(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải đơn hàng'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, refetch: fetchOrders }
}

/**
 * Hook quản lý đơn hàng theo status — dùng cho Staff.
 *
 * Cách dùng:
 *   const { orders, loading, refetch } = useOrdersByStatus('PENDING')
 */
export function useOrdersByStatus(status) {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(() => {
    setLoading(true)
    orderApi.getByStatus(status)
      .then(r => setOrders(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải đơn hàng'))
      .finally(() => setLoading(false))
  }, [status])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, refetch: fetchOrders }
}
