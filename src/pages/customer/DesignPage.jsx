import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { productApi, eyeProfileApi, designApi, cartApi } from '../../services/api'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import styles from './DesignPage.module.css'

function fmt(n) { return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '—' }

export default function DesignPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { fetchCart } = useCart()
  const [frames,   setFrames]   = useState([])
  const [lenses,   setLenses]   = useState([])
  const [profiles, setProfiles] = useState([])
  const [sel, setSel] = useState({ frameId: null, lensId: null, eyeProfileId: null, selectedOptionIds: [], designName: '' })
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    Promise.all([
      productApi.getFrames().then(r => {
        const data = r.data.data ?? []
        setFrames(data)
        // Nếu có ?frameId= trong URL → tự chọn sẵn + nhảy sang step 2
        const preselect = Number(searchParams.get('frameId'))
        if (preselect && data.find(f => f.frameId === preselect)) {
          setSel(s => ({...s, frameId: preselect}))
          setStep(2)
        }
      }),
      productApi.getLenses().then(r => setLenses(r.data.data ?? [])),
      eyeProfileApi.getMyProfiles().then(r => setProfiles((r.data.data ?? []).filter(p => p.status === 'ACTIVE'))),
    ]).catch(() => toast.error('Không thể tải dữ liệu'))
  }, [])

  const selFrame  = frames.find(f => f.frameId === sel.frameId)
  const selLens   = lenses.find(l => l.lensId   === sel.lensId)
  const selOptions= selLens?.options?.filter(o => sel.selectedOptionIds.includes(o.optionId)) ?? []
  const totalPrice= (selFrame?.price ?? 0) + (selLens?.price ?? 0) +
                    selOptions.reduce((s,o) => s + (o.extraPrice ?? 0), 0)

  const toggleOption = (id) => setSel(s => ({
    ...s,
    selectedOptionIds: s.selectedOptionIds.includes(id)
      ? s.selectedOptionIds.filter(x => x !== id)
      : [...s.selectedOptionIds, id]
  }))

  const handleCreate = async () => {
    if (!sel.frameId || !sel.lensId || !sel.eyeProfileId) { toast.error('Vui lòng chọn đầy đủ thông tin'); return }
    try {
      setBusy(true)
      const res = await designApi.create(sel)
      const designId = res.data.data.designId
      await cartApi.addItem({ designId, quantity: 1 })
      await fetchCart()
      toast.success('Đã thêm thiết kế vào giỏ hàng!')
      navigate('/cart')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  const steps = ['Chọn gọng', 'Chọn tròng', 'Hồ sơ mắt', 'Xác nhận']

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Thiết kế kính</h1>
          <p>Tạo đôi kính hoàn hảo theo đôi mắt của bạn</p>
        </div>
      </div>
      <div className="container section-sm">
        {/* Steps */}
        <div className={styles.stepper}>
          {steps.map((s,i) => (
            <div key={i} className={`${styles.stepItem} ${step > i+1 ? styles.stepDone : ''} ${step === i+1 ? styles.stepActive : ''}`}>
              <div className={styles.stepCircle}>{step > i+1 ? '✓' : i+1}</div>
              <span>{s}</span>
              {i < steps.length-1 && <div className={styles.stepLine}/>}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Main content */}
          <div className={styles.main}>

            {/* Step 1: Frame */}
            {step === 1 && (
              <div>
                <h3 className={styles.stepTitle}>Chọn gọng kính</h3>
                <div className={styles.grid3}>
                  {frames.map(f => (
                    <div key={f.frameId}
                      className={`${styles.selectCard} ${sel.frameId === f.frameId ? styles.selected : ''}`}
                      onClick={() => setSel(s => ({...s, frameId: f.frameId}))}>
                      <div className={styles.selectCardImg}>👓</div>
                      <div className={styles.selectCardInfo}>
                        <span className={styles.brand}>{f.brand}</span>
                        <h4>{f.name}</h4>
                        <p>{f.color} · {f.material}</p>
                        <p className={styles.price}>{fmt(f.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{marginTop:'24px'}}
                  disabled={!sel.frameId} onClick={() => setStep(2)}>
                  Tiếp theo →
                </button>
              </div>
            )}

            {/* Step 2: Lens */}
            {step === 2 && (
              <div>
                {/* Banner gọng đã chọn */}
                {selFrame && (
                  <div style={{
                    display:'flex', alignItems:'center', gap:'12px',
                    padding:'12px 16px', marginBottom:'20px',
                    background:'var(--gray-1)', borderRadius:'var(--radius-lg)',
                    border:'1px solid var(--gray-2)'
                  }}>
                    <span style={{fontSize:'12px',color:'var(--gray-5)',fontWeight:600}}>GỌNG ĐÃ CHỌN</span>
                    <span style={{fontWeight:600}}>{selFrame.name}</span>
                    <span style={{fontSize:'12px',color:'var(--gray-4)'}}>#{selFrame.frameId}</span>
                    <span style={{fontSize:'13px',color:'var(--gold)',marginLeft:'auto'}}>{fmt(selFrame.price)}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{marginLeft:'4px'}}>Đổi gọng</button>
                  </div>
                )}
                <h3 className={styles.stepTitle}>Chọn tròng kính</h3>
                <div className={styles.lensGrid}>
                  {lenses.map(l => (
                    <div key={l.lensId}
                      className={`${styles.lensCard} ${sel.lensId === l.lensId ? styles.selected : ''}`}
                      onClick={() => setSel(s => ({...s, lensId: l.lensId, selectedOptionIds: []}))}>
                      <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                        <span className="badge badge-blue">{l.lensType}</span>
                        <span className="badge badge-gray">Index {l.indexValue}</span>
                      </div>
                      <h4>{l.name}</h4>
                      <p style={{fontSize:'13px',color:'var(--gray-5)',marginTop:'4px'}}>{l.material}</p>
                      <p className={styles.price} style={{marginTop:'8px'}}>{fmt(l.price)}</p>
                    </div>
                  ))}
                </div>
                {sel.lensId && selLens?.options?.length > 0 && (
                  <div className={styles.optionsSection}>
                    <h4>Tùy chọn thêm</h4>
                    <div className={styles.optionsGrid}>
                      {selLens.options.map(o => (
                        <label key={o.optionId}
                          className={`${styles.optionItem} ${sel.selectedOptionIds.includes(o.optionId) ? styles.optionSelected : ''}`}>
                          <input type="checkbox" checked={sel.selectedOptionIds.includes(o.optionId)}
                            onChange={() => toggleOption(o.optionId)} />
                          <span>{o.optionName}</span>
                          <span className={styles.optionPrice}>+{fmt(o.extraPrice)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{display:'flex',gap:'8px',marginTop:'24px'}}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Quay lại</button>
                  <button className="btn btn-primary" disabled={!sel.lensId} onClick={() => setStep(3)}>Tiếp theo →</button>
                </div>
              </div>
            )}

            {/* Step 3: Eye Profile */}
            {step === 3 && (
              <div>
                <h3 className={styles.stepTitle}>Chọn hồ sơ mắt</h3>
                {profiles.length === 0 ? (
                  <div style={{textAlign:'center',padding:'40px',color:'var(--gray-5)'}}>
                    <p>Bạn chưa có hồ sơ mắt. Vui lòng tạo hồ sơ mắt trước.</p>
                    <button className="btn btn-primary" style={{marginTop:'16px'}}
                      onClick={() => navigate('/eye-profiles')}>Tạo hồ sơ mắt</button>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {profiles.map(p => (
                      <div key={p.eyeProfileId}
                        className={`${styles.profileCard} ${sel.eyeProfileId === p.eyeProfileId ? styles.selected : ''}`}
                        onClick={() => setSel(s => ({...s, eyeProfileId: p.eyeProfileId}))}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                          <span className={`badge ${p.source==='MANUAL'?'badge-blue':'badge-yellow'}`}>
                            {p.source==='MANUAL'?'Nhập tay':'Upload'}
                          </span>
                          <strong style={{fontSize:'14px'}}>
                            {p.profileName ?? `Hồ sơ #${p.eyeProfileId}`}
                          </strong>
                        </div>
                        <p style={{fontSize:'12px',color:'var(--gray-4)'}}>
                          {new Date(p.createdDate).toLocaleDateString('vi-VN')}
                          {p.prescriptions?.length > 0 && ` · SPH: ${p.prescriptions[0]?.sph ?? '—'} / ${p.prescriptions[1]?.sph ?? '—'}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="form-group" style={{marginTop:'16px'}}>
                  <label className="form-label">Tên thiết kế (tuỳ chọn)</label>
                  <input className="form-input" value={sel.designName}
                    onChange={e => setSel(s => ({...s, designName: e.target.value}))}
                    placeholder="VD: Kính đi làm 2024" />
                </div>
                <div style={{display:'flex',gap:'8px',marginTop:'24px'}}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Quay lại</button>
                  <button className="btn btn-primary" disabled={!sel.eyeProfileId} onClick={() => setStep(4)}>Xem tóm tắt →</button>
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div>
                <h3 className={styles.stepTitle}>Xác nhận thiết kế</h3>
                <div className={styles.confirmCard}>
                  <div className={styles.confirmRow}><span>Gọng kính</span><strong>{selFrame?.name}</strong></div>
                  <div className={styles.confirmRow}><span>Tròng kính</span><strong>{selLens?.name}</strong></div>
                  <div className={styles.confirmRow}><span>Hồ sơ mắt</span><strong>{profiles.find(p=>p.eyeProfileId===sel.eyeProfileId)?.profileName ?? `Hồ sơ #${sel.eyeProfileId}`}</strong></div>
                  {selOptions.length > 0 && (
                    <div className={styles.confirmRow}>
                      <span>Tùy chọn thêm</span>
                      <strong>{selOptions.map(o => o.optionName).join(', ')}</strong>
                    </div>
                  )}
                  {sel.designName && (
                    <div className={styles.confirmRow}><span>Tên thiết kế</span><strong>{sel.designName}</strong></div>
                  )}
                  <hr className="divider"/>
                  <div className={`${styles.confirmRow} ${styles.confirmTotal}`}>
                    <span>Tổng giá</span>
                    <strong>{fmt(totalPrice)}</strong>
                  </div>
                </div>
                <div style={{display:'flex',gap:'8px',marginTop:'24px'}}>
                  <button className="btn btn-outline" onClick={() => setStep(3)}>← Quay lại</button>
                  <button className="btn btn-primary btn-lg" onClick={handleCreate} disabled={busy}>
                    {busy ? <span className="spinner"/> : '🛒 Thêm vào giỏ hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side preview */}
          <div className={styles.preview}>
            <h4>Thiết kế của bạn</h4>
            <div className={styles.previewItem}>
              <span>Gọng:</span><span>{selFrame?.name ?? '—'}</span>
            </div>
            <div className={styles.previewItem}>
              <span>Tròng:</span><span>{selLens?.name ?? '—'}</span>
            </div>
            {selOptions.length > 0 && selOptions.map(o => (
              <div key={o.optionId} className={styles.previewItem}>
                <span>{o.optionName}:</span><span>+{fmt(o.extraPrice)}</span>
              </div>
            ))}
            <hr className="divider"/>
            <div className={styles.previewTotal}>
              <span>Tổng:</span>
              <span style={{fontFamily:'var(--font-display)',fontSize:'1.3rem'}}>{fmt(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}