import { Component } from 'react'

/**
 * Error Boundary — bắt lỗi render của component con.
 * Khi component con throw error, ErrorBoundary hiện fallback UI thay vì crash toàn trang.
 *
 * Lưu ý: phải dùng class component vì React chỉ hỗ trợ componentDidCatch trong class.
 *
 * Cách dùng:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   // Tùy chỉnh fallback:
 *   <ErrorBoundary fallback={<p>Trang này bị lỗi</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để render fallback UI ở lần render tiếp theo
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log lỗi — trong production nên gửi lên error tracking (Sentry, etc.)
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Nếu truyền fallback prop thì dùng fallback đó
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback mặc định
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          textAlign: 'center',
          color: 'var(--gray-5)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: 'var(--ink)', marginBottom: '8px' }}>
            Đã xảy ra lỗi
          </h3>
          <p style={{ fontSize: '14px', maxWidth: '400px', marginBottom: '24px' }}>
            Trang này gặp sự cố không mong muốn. Vui lòng thử lại hoặc tải lại trang.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={this.handleReset}
            >
              Thử lại
            </button>
            <button
              className="btn btn-outline"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
          {/* Hiện error detail trong development */}
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginTop: '24px', textAlign: 'left', fontSize: '12px',
              color: 'var(--gray-4)', maxWidth: '600px'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                Chi tiết lỗi (dev only)
              </summary>
              <pre style={{
                background: 'var(--gray-1)', padding: '12px',
                borderRadius: '8px', overflow: 'auto',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
