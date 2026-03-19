import { useState, useEffect } from 'react'
import { Download, TrendingUp, FileSpreadsheet } from 'lucide-react'
import { orderApi } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './StaffReportPage.module.css'

function fmt(n) {
  return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '0 ₫'
}

export default function StaffReportPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom,setDateFrom]= useState('')
  const [dateTo,  setDateTo]  = useState('')

  useEffect(() => {
    // Lấy tất cả đơn DELIVERED
    orderApi.getByStatus('DELIVERED')
      .then(r => setOrders(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }, [])

  // Filter theo ngày
  const filtered = orders.filter(o => {
    const date = new Date(o.createdAt)
    if (dateFrom && date < new Date(dateFrom)) return false
    if (dateTo   && date > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  const totalRevenue = filtered.reduce((s,o) => s + (o.finalAmount ?? 0), 0)
  const avgOrder     = filtered.length > 0 ? totalRevenue / filtered.length : 0

  // Nhóm theo ngày
  const byDate = filtered.reduce((acc, o) => {
    const d = new Date(o.createdAt).toLocaleDateString('vi-VN')
    if (!acc[d]) acc[d] = { count: 0, revenue: 0 }
    acc[d].count++
    acc[d].revenue += o.finalAmount ?? 0
    return acc
  }, {})

  // Export CSV
  const exportCSV = () => {
    const headers = ['Mã đơn','Khách hàng','Ngày đặt','Địa chỉ','Mã giảm giá','Giảm giá','Thành tiền']
    const rows = filtered.map(o => [
      `#${o.orderId}`,
      o.customerName ?? '',
      new Date(o.createdAt).toLocaleDateString('vi-VN'),
      o.shippingAddress ?? '',
      o.discountCode ?? '',
      o.discountAmount ?? 0,
      o.finalAmount ?? 0,
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${v}"`).join(','))
      .join('\n')
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `bao-cao-doanh-thu-${new Date().toLocaleDateString('vi-VN').replace(/\//g,'-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã xuất báo cáo CSV!')
  }

  // Export HTML (giả lập Excel-like)
  const exportHTML = () => {
    const html = `
<html><head><meta charset="utf-8">
<style>
  body { font-family: Arial; font-size: 13px; }
  h2   { color: #1a1a2e; margin-bottom: 8px; }
  p    { color: #666; margin-bottom: 16px; }
  table{ border-collapse: collapse; width: 100%; }
  th   { background: #1a1a2e; color: white; padding: 10px 14px; text-align: left; }
  td   { padding: 9px 14px; border-bottom: 1px solid #eee; }
  tr:hover td { background: #f9f9f9; }
  .total { font-weight: bold; background: #f0f4ff; }
</style></head><body>
<h2>Báo cáo doanh thu — GlassStore</h2>
<p>Xuất ngày: ${new Date().toLocaleString('vi-VN')} | Tổng: ${filtered.length} đơn | Doanh thu: ${fmt(totalRevenue)}</p>
<table>
<tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Địa chỉ</th><th>Mã giảm</th><th>Giảm giá</th><th>Thành tiền</th></tr>
${filtered.map(o => `
<tr>
  <td>#${o.orderId}</td>
  <td>${o.customerName ?? ''}</td>
  <td>${new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
  <td>${o.shippingAddress ?? ''}</td>
  <td>${o.discountCode ?? '—'}</td>
  <td>${fmt(o.discountAmount)}</td>
  <td>${fmt(o.finalAmount)}</td>
</tr>`).join('')}
<tr class="total">
  <td colspan="6"><strong>TỔNG CỘNG</strong></td>
  <td><strong>${fmt(totalRevenue)}</strong></td>
</tr>
</table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `bao-cao-doanh-thu-${new Date().toLocaleDateString('vi-VN').replace(/\//g,'-')}.xls`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã xuất file Excel!')
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h2>Báo cáo doanh thu</h2>
          <p>Thống kê từ các đơn hàng đã hoàn thành</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>
            <Download size={15}/> Xuất CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportHTML}>
            <FileSpreadsheet size={15}/> Xuất Excel
          </button>
        </div>
      </div>

      {/* Date filter */}
      <div className={styles.filterBar}>
        <div className="form-group" style={{flexDirection:'row',alignItems:'center',gap:'8px'}}>
          <label className="form-label" style={{whiteSpace:'nowrap',marginBottom:0}}>Từ ngày</label>
          <input className="form-input" type="date"
            value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{width:'160px'}}/>
        </div>
        <div className="form-group" style={{flexDirection:'row',alignItems:'center',gap:'8px'}}>
          <label className="form-label" style={{whiteSpace:'nowrap',marginBottom:0}}>Đến ngày</label>
          <input className="form-input" type="date"
            value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{width:'160px'}}/>
        </div>
        {(dateFrom || dateTo) && (
          <button className="btn btn-ghost btn-sm"
            onClick={() => { setDateFrom(''); setDateTo('') }}>
            Xoá lọc
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Doanh thu</p>
          <p className={styles.summaryVal}>{fmt(totalRevenue)}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Số đơn</p>
          <p className={styles.summaryVal}>{filtered.length}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Trung bình / đơn</p>
          <p className={styles.summaryVal}>{fmt(avgOrder)}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Ngày có doanh thu</p>
          <p className={styles.summaryVal}>{Object.keys(byDate).length}</p>
        </div>
      </div>

      {/* Daily breakdown */}
      {Object.keys(byDate).length > 0 && (
        <div className={styles.section}>
          <h4>Theo ngày</h4>
          <table className={styles.table}>
            <thead>
              <tr><th>Ngày</th><th>Số đơn</th><th>Doanh thu</th><th>Tỷ lệ</th></tr>
            </thead>
            <tbody>
              {Object.entries(byDate)
                .sort((a,b) => new Date(b[0]) - new Date(a[0]))
                .map(([date, data]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>{data.count}</td>
                  <td style={{fontFamily:'var(--font-display)'}}>{fmt(data.revenue)}</td>
                  <td>
                    <div className={styles.barCell}>
                      <div className={styles.barFill}
                        style={{width:`${Math.round(data.revenue/totalRevenue*100)}%`}}/>
                      <span>{Math.round(data.revenue/totalRevenue*100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders table */}
      <div className={styles.section}>
        <h4>Chi tiết đơn hàng ({filtered.length})</h4>
        {loading ? <div style={{textAlign:'center',padding:'40px'}}><span className="spinner"/></div>
        : filtered.length === 0 ? <p style={{color:'var(--gray-4)',textAlign:'center',padding:'40px'}}>Không có dữ liệu</p>
        : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th>
                  <th>Mã giảm giá</th><th>Giảm giá</th><th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.orderId}>
                    <td><strong>#{o.orderId}</strong></td>
                    <td>{o.customerName}</td>
                    <td style={{fontSize:'13px',color:'var(--gray-5)'}}>
                      {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>{o.discountCode ?? '—'}</td>
                    <td style={{color:'#2e7d32'}}>{o.discountAmount ? `-${fmt(o.discountAmount)}` : '—'}</td>
                    <td style={{fontFamily:'var(--font-display)',fontWeight:600}}>{fmt(o.finalAmount)}</td>
                  </tr>
                ))}
                <tr style={{background:'var(--gray-1)',fontWeight:700}}>
                  <td colSpan={5}>TỔNG CỘNG</td>
                  <td style={{fontFamily:'var(--font-display)',fontSize:'1.1rem'}}>{fmt(totalRevenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
