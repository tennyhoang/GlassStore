import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Hook kết nối WebSocket để nhận notification real-time.
 *
 * Dùng SockJS + STOMP.js — cần install:
 *   npm install sockjs-client @stomp/stompjs
 *
 * Cách dùng trong NotificationBell:
 *   useWebSocket((notification) => {
 *     setCount(c => c + 1)
 *     toast(notification.title)
 *   })
 *
 * Tự động:
 *   - Connect khi user đăng nhập
 *   - Disconnect khi user đăng xuất hoặc component unmount
 *   - Reconnect khi mất kết nối
 */
export function useWebSocket(onNotification) {
  const { user } = useAuth()
  const clientRef = useRef(null)

  const connect = useCallback(() => {
    if (!user) return

    // Lazy import để không load SockJS khi chưa cần
    Promise.all([
      import('sockjs-client'),
      import('@stomp/stompjs'),
    ]).then(([{ default: SockJS }, { Client }]) => {
      const token = localStorage.getItem('token')

      const stompClient = new Client({
        webSocketFactory: () => new SockJS(
          `${import.meta.env.VITE_API_URL?.replace('/api', '') ?? ''}/ws`
        ),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,   // thử reconnect sau 5 giây nếu mất kết nối
        debug: import.meta.env.DEV ? (str) => console.log('[STOMP]', str) : () => {},

        onConnect: () => {
          // Subscribe nhận notification của user hiện tại
          stompClient.subscribe('/user/queue/notifications', (message) => {
            try {
              const notification = JSON.parse(message.body)
              onNotification?.(notification)
            } catch (e) {
              console.error('Failed to parse notification:', e)
            }
          })
        },

        onStompError: (frame) => {
          console.error('STOMP error:', frame)
        },
      })

      stompClient.activate()
      clientRef.current = stompClient
    }).catch(err => {
      console.error('Failed to load WebSocket dependencies:', err)
    })
  }, [user, onNotification])

  useEffect(() => {
    connect()

    return () => {
      // Cleanup — disconnect khi component unmount hoặc user thay đổi
      if (clientRef.current?.active) {
        clientRef.current.deactivate()
      }
    }
  }, [connect])
}
