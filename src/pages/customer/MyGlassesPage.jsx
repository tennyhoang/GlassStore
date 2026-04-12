// MyGlassesPage.jsx
import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import { designApi } from '../../services/api'
import toast from 'react-hot-toast'
import { fmtCurrency, fmtDate } from '../../utils/format'


export default function MyGlassesPage() {
  const [glasses, setGlasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    designApi.getMyGlasses()
      .then(r => setGlasses(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-enter">
      <div style={{background:'var(--gray-1)',borderBottom:'1px solid var(--gray-2)',padding:'48px 0 32px'}}>
        <div className="container"><h1>Kính của tôi</h1><p style={{color:'var(--gray-5)'}}>Kính đã nhận được</p></div>
      </div>
      <div className="container section-sm">
        {loading ? <div style={{display:'flex',justifyContent:'center',padding:'80px'}}><span className="spinner"/></div>
        : glasses.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 0',color:'var(--gray-4)'}}>
            <Eye size={48} strokeWidth={1} style={{margin:'0 auto 16px'}}/>
            <h3 style={{color:'var(--ink)'}}>Chưa có kính nào</h3>
            <p>Kính sẽ xuất hiện ở đây sau khi đơn hàng được giao thành công</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'20px'}}>
            {glasses.map(g => (
              <div key={g.myGlassesId} className="card" style={{padding:'20px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                  <span className="badge badge-green">Đã nhận</span>
                  <span style={{fontSize:'12px',color:'var(--gray-5)'}}>Đơn #{g.orderId}</span>
                </div>
                {g.design ? (
                  <>
                    <h4 style={{marginBottom:'8px'}}>{g.design.designName ?? `Kính thiết kế #${g.design.designId}`}</h4>
                    <p style={{fontSize:'13px',color:'var(--gray-5)'}}>Gọng: {g.design.frameName}</p>
                    <p style={{fontSize:'13px',color:'var(--gray-5)'}}>Tròng: {g.design.lensName}</p>
                    <p style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',marginTop:'12px'}}>{fmtCurrency(g.design.totalPrice)}</p>
                  </>
                ) : <p style={{color:'var(--gray-4)'}}>Không có thông tin thiết kế</p>}
                <p style={{fontSize:'12px',color:'var(--gray-4)',marginTop:'8px'}}>
                  Nhận ngày: {g.receivedDate ? fmtDate(g.receivedDate) : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
