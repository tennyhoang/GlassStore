import { useState, useEffect, useMemo, useRef } from 'react'
import { Download, FileSpreadsheet, TrendingUp, ShoppingBag, Users, Tag } from 'lucide-react'
import { orderApi } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './StaffReportPage.module.css'
import { fmtCurrency, fmtDate } from '../../utils/format'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonth(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getLast12Months() {
  const months = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

function formatMonth(m) {
  const [y, mo] = m.split('-')
  return `T${parseInt(mo)}/${y}`
}

// ── Chart components (dung Canvas API truc tiep, khong can CDN) ───────────────

function BarChart({ data, labels, color = '#1a1a2e' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width  = canvas.offsetWidth * window.devicePixelRatio
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    ctx.clearRect(0, 0, w, h)

    const paddingL = 64, paddingR = 16, paddingT = 16, paddingB = 48
    const chartW = w - paddingL - paddingR
    const chartH = h - paddingT - paddingB

    const max = Math.max(...data, 1)
    const barW = chartW / data.length
    const barPad = barW * 0.25

    // Grid lines
    ctx.strokeStyle = '#F3F4F6'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = paddingT + chartH - (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(paddingL, y)
      ctx.lineTo(paddingL + chartW, y)
      ctx.stroke()
      // Y label
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'right'
      const val = (max / 4) * i
      ctx.fillText(val >= 1e6 ? `${(val/1e6).toFixed(0)}M` : val >= 1e3 ? `${(val/1e3).toFixed(0)}K` : val.toFixed(0), paddingL - 6, y + 4)
    }

    // Bars
    data.forEach((val, i) => {
      const barH = (val / max) * chartH
      const x = paddingL + i * barW + barPad / 2
      const y = paddingT + chartH - barH
      const bw = barW - barPad

      // Bar
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x, y, bw, barH, [4, 4, 0, 0])
      ctx.fill()

      // X label
      ctx.fillStyle = '#6B7280'
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(labels[i] ?? '', x + bw / 2, paddingT + chartH + 18)
    })
  }, [data, labels, color])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

function DonutChart({ segments }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !segments.length) return
    const ctx = canvas.getContext('2d')
    const size = Math.min(canvas.offsetWidth, canvas.offsetHeight)
    canvas.width  = size * window.devicePixelRatio
    canvas.height = size * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const cx = size / 2, cy = size / 2
    const outerR = size * 0.42, innerR = size * 0.27
    const total = segments.reduce((s, seg) => s + seg.value, 0)
    if (!total) return

    let angle = -Math.PI / 2
    segments.forEach(seg => {
      const sweep = (seg.value / total) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, outerR, angle, angle + sweep)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      angle += sweep
    })

    // Hole
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()

    // Center text
    ctx.fillStyle = '#111'
    ctx.font = `bold ${Math.floor(size * 0.12)}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(total, cx, cy - size * 0.04)
    ctx.font = `${Math.floor(size * 0.07)}px Inter, sans-serif`
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText('don hang', cx, cy + size * 0.08)
  }, [segments])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StaffReportPage() {
  const [orders,  setOrders]  = useState([])
  const [allOrders, setAll]   = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  useEffect(() => {
    // Load ca don DELIVERED lan tat ca don de thong ke trang thai
    Promise.all([
      orderApi.getByStatus('DELIVERED'),
      orderApi.search({ size: 200, sortBy: 'createdAt', sortDir: 'desc' }),
    ])
      .then(([delivered, all]) => {
        setOrders(delivered.data.data ?? [])
        setAll(all.data.data?.content ?? [])
      })
      .catch(() => toast.error('Khong the tai du lieu'))
      .finally(() => setLoading(false))
  }, [])

  // Filter doanh thu theo ngay
  const filtered = useMemo(() => orders.filter(o => {
    const d = new Date(o.createdAt)
    if (dateFrom && d < new Date(dateFrom)) return false
    if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false
    return true
  }), [orders, dateFrom, dateTo])

  // KPI cards
  const totalRevenue = filtered.reduce((s, o) => s + (o.finalAmount ?? 0), 0)
  const avgOrder     = filtered.length > 0 ? totalRevenue / filtered.length : 0
  const totalDiscount = filtered.reduce((s, o) => s + (o.discountAmount ?? 0), 0)

  // Doanh thu 12 thang
  const last12 = getLast12Months()
  const revenueByMonth = last12.map(m =>
    orders.filter(o => getMonth(o.createdAt) === m)
          .reduce((s, o) => s + (o.finalAmount ?? 0), 0)
  )

  // Trang thai don hang (tat ca don)
  const statusCounts = useMemo(() => {
    const counts = {}
    allOrders.forEach(o => { counts[o.status] = (counts[o.status] ?? 0) + 1 })
    return counts
  }, [allOrders])

  const STATUS_COLORS = {
    PENDING:       '#FCD34D',
    CONFIRMED:     '#60A5FA',
    MANUFACTURING: '#A78BFA',
    SHIPPING:      '#34D399',
    DELIVERED:     '#22C55E',
    CANCELLED:     '#F87171',
  }
  const STATUS_LABELS = {
    PENDING: 'Cho xac nhan', CONFIRMED: 'Da xac nhan',
    MANUFACTURING: 'San xuat', SHIPPING: 'Giao hang',
    DELIVERED: 'Hoan thanh', CANCELLED: 'Da huy',
  }

  const donutSegments = Object.entries(statusCounts).map(([status, value]) => ({
    status, value, color: STATUS_COLORS[status] ?? '#E5E7EB',
    label: STATUS_LABELS[status] ?? status,
  }))

  // Top khach hang
  const topCustomers = useMemo(() => {
    const map = {}
    filtered.forEach(o => {
      if (!map[o.customerName]) map[o.customerName] = { name: o.customerName, count: 0, revenue: 0 }
      map[o.customerName].count++
      map[o.customerName].revenue += o.finalAmount ?? 0
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [filtered])

  // Nhom theo ngay
  const byDate = useMemo(() => filtered.reduce((acc, o) => {
    const d = fmtDate(o.createdAt)
    if (!acc[d]) acc[d] = { count: 0, revenue: 0 }
    acc[d].count++
    acc[d].revenue += o.finalAmount ?? 0
    return acc
  }, {}), [filtered])

  // Export CSV
  const exportCSV = () => {
    const headers = ['Ma don', 'Khach hang', 'Ngay dat', 'Dia chi', 'Ma giam gia', 'Giam gia', 'Thanh tien']
    const rows = filtered.map(o => [
      `#${o.orderId}`, o.customerName ?? '', fmtDate(o.createdAt),
      o.shippingAddress ?? '', o.discountCode ?? '',
      o.discountAmount ?? 0, o.finalAmount ?? 0,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bao-cao-${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Da xuat CSV!')
  }

  const exportHTML = () => {
    const html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;font-size:13px}h2{color:#1a1a2e}table{border-collapse:collapse;width:100%}th{background:#1a1a2e;color:#fff;padding:10px 14px;text-align:left}td{padding:9px 14px;border-bottom:1px solid #eee}.total{font-weight:700;background:#f0f4ff}</style></head><body>
<h2>Bao cao doanh thu — GlassStore</h2>
<p>Xuat ngay: ${new Date().toLocaleString('vi-VN')} | Tong: ${filtered.length} don | Doanh thu: ${fmtCurrency(totalRevenue)}</p>
<table><tr><th>Ma don</th><th>Khach hang</th><th>Ngay dat</th><th>Ma giam</th><th>Giam gia</th><th>Thanh tien</th></tr>
${filtered.map(o => `<tr><td>#${o.orderId}</td><td>${o.customerName ?? ''}</td><td>${fmtDate(o.createdAt)}</td><td>${o.discountCode ?? '—'}</td><td>${fmtCurrency(o.discountAmount)}</td><td>${fmtCurrency(o.finalAmount)}</td></tr>`).join('')}
<tr class="total"><td colspan="5">TONG CONG</td><td>${fmtCurrency(totalRevenue)}</td></tr>
</table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bao-cao-${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xls`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Da xuat Excel!')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2>Dashboard bao cao</h2>
          <p>Thong ke tong quan hoat dong kinh doanh</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>
            <Download size={15} /> Xuat CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportHTML}>
            <FileSpreadsheet size={15} /> Xuat Excel
          </button>
        </div>
      </div>

      {/* Date filter */}
      <div className={styles.filterBar}>
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <label className="form-label" style={{ whiteSpace: 'nowrap', marginBottom: 0 }}>Tu ngay</label>
          <input className="form-input" type="date" value={dateFrom}
            onChange={e => setDateFrom(e.target.value)} style={{ width: 160 }} />
        </div>
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <label className="form-label" style={{ whiteSpace: 'nowrap', marginBottom: 0 }}>Den ngay</label>
          <input className="form-input" type="date" value={dateTo}
            onChange={e => setDateTo(e.target.value)} style={{ width: 160 }} />
        </div>
        {(dateFrom || dateTo) && (
          <button className="btn btn-ghost btn-sm"
            onClick={() => { setDateFrom(''); setDateTo('') }}>
            Xoa loc
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p className={styles.summaryLabel}>Doanh thu</p>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} color="#16A34A" />
                </div>
              </div>
              <p className={styles.summaryVal} style={{ color: '#16A34A' }}>{fmtCurrency(totalRevenue)}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{filtered.length} don hoan thanh</p>
            </div>
            <div className={styles.summaryCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p className={styles.summaryLabel}>Trung binh / don</p>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={18} color="#1D4ED8" />
                </div>
              </div>
              <p className={styles.summaryVal}>{fmtCurrency(avgOrder)}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{Object.keys(byDate).length} ngay co doanh thu</p>
            </div>
            <div className={styles.summaryCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p className={styles.summaryLabel}>Tong giam gia</p>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={18} color="#92400E" />
                </div>
              </div>
              <p className={styles.summaryVal}>{fmtCurrency(totalDiscount)}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                {totalRevenue > 0 ? ((totalDiscount / (totalRevenue + totalDiscount)) * 100).toFixed(1) : 0}% tong gia tri
              </p>
            </div>
            <div className={styles.summaryCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p className={styles.summaryLabel}>Khach hang</p>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color="#5B21B6" />
                </div>
              </div>
              <p className={styles.summaryVal}>{new Set(filtered.map(o => o.customerName)).size}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>khach hang duy nhat</p>
            </div>
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Bar chart: Doanh thu 12 thang */}
            <div className={styles.section}>
              <h4 style={{ marginBottom: 4 }}>Doanh thu 12 thang gan nhat</h4>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                Chi tinh tu don hang da giao thanh cong
              </p>
              <div style={{ height: 220 }}>
                <BarChart
                  data={revenueByMonth}
                  labels={last12.map(formatMonth)}
                  color="#1a1a2e"
                />
              </div>
            </div>

            {/* Donut chart: Trang thai don */}
            <div className={styles.section}>
              <h4 style={{ marginBottom: 4 }}>Phan bo trang thai</h4>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                Toan bo {allOrders.length} don hang
              </p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 130, height: 130, flexShrink: 0 }}>
                  <DonutChart segments={donutSegments} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {donutSegments.map(seg => (
                    <div key={seg.status} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, color: '#374151' }}>{seg.label}</span>
                      <span style={{ fontWeight: 600, color: '#111' }}>{seg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Top customers */}
            <div className={styles.section}>
              <h4>Top 5 khach hang</h4>
              {topCustomers.length === 0
                ? <p style={{ color: '#9CA3AF', fontSize: 14 }}>Chua co du lieu</p>
                : topCustomers.map((c, i) => (
                  <div key={c.name} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < topCustomers.length - 1 ? '0.5px solid #F3F4F6' : 'none'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: '#F3F4F6', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#374151'
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
                        {c.count} don hang
                      </p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#16A34A', flexShrink: 0 }}>
                      {fmtCurrency(c.revenue)}
                    </span>
                  </div>
                ))
              }
            </div>

            {/* Doanh thu theo ngay */}
            <div className={styles.section}>
              <h4>Theo ngay</h4>
              <div style={{ overflowY: 'auto', maxHeight: 260 }}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Ngay</th><th>So don</th><th>Doanh thu</th><th>Ti le</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(byDate)
                      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                      .slice(0, 15)
                      .map(([date, data]) => (
                        <tr key={date}>
                          <td style={{ fontSize: 13 }}>{date}</td>
                          <td style={{ textAlign: 'center' }}>{data.count}</td>
                          <td style={{ fontWeight: 600 }}>{fmtCurrency(data.revenue)}</td>
                          <td>
                            <div className={styles.barCell}>
                              <div className={styles.barFill}
                                style={{ width: `${Math.round(data.revenue / totalRevenue * 100)}%` }} />
                              <span>{Math.round(data.revenue / totalRevenue * 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Chi tiet don hang */}
          <div className={styles.section}>
            <h4>Chi tiet don hang ({filtered.length})</h4>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ma don</th><th>Khach hang</th><th>Ngay dat</th>
                    <th>Ma giam gia</th><th>Giam gia</th><th>Thanh tien</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>
                      Khong co du lieu
                    </td></tr>
                  ) : (
                    <>
                      {filtered.map(o => (
                        <tr key={o.orderId}>
                          <td><strong>#{o.orderId}</strong></td>
                          <td>{o.customerName}</td>
                          <td style={{ fontSize: 13, color: '#9CA3AF' }}>{fmtDate(o.createdAt)}</td>
                          <td>{o.discountCode ?? '—'}</td>
                          <td style={{ color: '#16A34A' }}>
                            {o.discountAmount > 0 ? `-${fmtCurrency(o.discountAmount)}` : '—'}
                          </td>
                          <td style={{ fontWeight: 700 }}>{fmtCurrency(o.finalAmount)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#F9FAFB', fontWeight: 700 }}>
                        <td colSpan={5} style={{ textAlign: 'right' }}>TONG CONG</td>
                        <td style={{ fontSize: '1.05rem', color: '#16A34A' }}>{fmtCurrency(totalRevenue)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}