// ─── Dùng chung toàn project ─────────────────────────────────────────────────
// Tạo 1 lần, tái sử dụng mãi — không tạo object mới mỗi lần gọi hàm
const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

/**
 * Format số tiền sang VNĐ.  fmtCurrency(150000) → "150.000 ₫"
 * Trả về "—" nếu giá trị null / undefined / NaN
 */
export function fmtCurrency(n) {
  if (n == null || isNaN(n)) return '—'
  return VND.format(n)
}

/**
 * Format ngày sang dd/mm/yyyy theo locale Việt.  fmtDate('2026-01-15') → "15/1/2026"
 * Trả về "—" nếu không có giá trị
 */
export function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

/**
 * Format ngày + giờ.  fmtDateTime('2026-01-15T08:30:00') → "15/1/2026, 08:30:00"
 */
export function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('vi-VN')
}
