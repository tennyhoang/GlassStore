/**
 * PaymentResultPage.jsx
 *
 * Trang hien thi ket qua sau khi VNPay redirect ve.
 * URL: /payment/result?status=SUCCESS&orderId=42
 *             hoac: /payment/result?status=FAILED&orderId=42&code=24
 *             hoac: /payment/result?status=INVALID_SIGNATURE
 *
 * Can them route nay vao App.jsx:
 *   import PaymentResultPage from './pages/customer/PaymentResultPage'
 *   <Route path="payment/result" element={<PaymentResultPage />} />
 */

import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, AlertTriangle, ShoppingBag, Home } from 'lucide-react'

// Ma loi VNPay → mo ta nguoi dung co the hieu
const VNPAY_ERROR_CODES = {
  '07': 'Giao dich bi nghi ngo gian lan',
  '09': 'The/Tai khoan chua dang ky dich vu InternetBanking',
  '10': 'Xac thuc that bai qua 3 lan',
  '11': 'Da het thoi gian thanh toan (15 phut)',
  '12': 'The/Tai khoan bi khoa',
  '13': 'Sai mat khau OTP',
  '24': 'Khach hang huy giao dich',
  '51': 'Tai khoan khong du so du',
  '65': 'Tai khoan vuot han muc giao dich trong ngay',
  '75': 'Ngan hang thanh toan dang bao tri',
  '79': 'Sai mat khau qua so lan quy dinh',
  '99': 'Loi khac',
}

export default function PaymentResultPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const status  = params.get('status')   // SUCCESS | FAILED | INVALID_SIGNATURE | ERROR
  const orderId = params.get('orderId')
  const code    = params.get('code')     // VNPay error code

  const isSuccess = status === 'SUCCESS'
  const isFailed  = status === 'FAILED'

  const errorMsg = VNPAY_ERROR_CODES[code] ?? 'Thanh toan that bai hoac bi huy'

  return (
    <div className="page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{
          background: '#fff', borderRadius: 20,
          border: '1.5px solid #E5E7EB',
          padding: '40px 36px', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>

          {/* Icon ket qua */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isSuccess ? '#DCFCE7' : isFailed ? '#FEE2E2' : '#FEF3C7',
          }}>
            {isSuccess
              ? <CheckCircle size={40} color="#16A34A" />
              : isFailed
                ? <XCircle size={40} color="#DC2626" />
                : <AlertTriangle size={40} color="#D97706" />
            }
          </div>

          {/* Tieu de */}
          <h2 style={{
            fontSize: 24, fontWeight: 700, marginBottom: 10,
            color: isSuccess ? '#15803D' : isFailed ? '#DC2626' : '#92400E',
          }}>
            {isSuccess
              ? 'Thanh toan thanh cong!'
              : isFailed
                ? 'Thanh toan that bai'
                : 'Co loi xay ra'
            }
          </h2>

          {/* Mo ta */}
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 24 }}>
            {isSuccess
              ? `Don hang #${orderId} cua ban da duoc thanh toan va xac nhan. Chung toi se bat dau san xuat kinh ngay!`
              : isFailed
                ? errorMsg + (orderId ? ` (Don hang #${orderId})` : '')
                : 'Khong the xac thuc ket qua thanh toan. Vui long kiem tra don hang cua ban.'
            }
          </p>

          {/* Chi tiet neu thanh cong */}
          {isSuccess && orderId && (
            <div style={{
              background: '#F0FDF4', borderRadius: 12,
              padding: '14px 18px', marginBottom: 24,
              border: '1px solid #BBF7D0', textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#6B7280' }}>Ma don hang</span>
                <span style={{ fontWeight: 600 }}>#{orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 8 }}>
                <span style={{ color: '#6B7280' }}>Trang thai</span>
                <span style={{ fontWeight: 600, color: '#16A34A' }}>Da xac nhan</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {orderId && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/orders')}
              >
                <ShoppingBag size={16} />
                Xem don hang
              </button>
            )}
            {isFailed && orderId && (
              <button
                className="btn btn-outline"
                onClick={() => navigate('/checkout')}
              >
                Thu lai
              </button>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/')}
            >
              <Home size={16} />
              Ve trang chu
            </button>
          </div>

          {/* Note cho truong hop loi chu ky */}
          {status === 'INVALID_SIGNATURE' && (
            <p style={{ fontSize: 12, color: '#EF4444', marginTop: 20 }}>
              Chu ky khong hop le — co the do loi mang hoac gian lan. Vui long lien he ho tro.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}