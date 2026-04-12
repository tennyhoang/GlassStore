import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { productApi, eyeProfileApi, designApi, cartApi } from '../../services/api'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import styles from './DesignPage.module.css'
import { fmtCurrency, fmtDate } from '../../utils/format'

export default function DesignPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { fetchCart } = useCart()

  // frameOnly=true: chi mua gong, bo qua trong + ho so mat
  const frameOnly = searchParams.get('frameOnly') === 'true'

  const [frames,   setFrames]   = useState([])
  const [lenses,   setLenses]   = useState([])
  const [profiles, setProfiles] = useState([])
  const [sel, setSel] = useState({
    frameId: null, lensId: null, eyeProfileId: null,
    selectedOptionIds: [], designName: ''
  })
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const loaders = [
      productApi.getFrames().then(r => {
        const data = r.data.data ?? []
        setFrames(data)
        const preselect = Number(searchParams.get('frameId'))
        if (preselect && data.find(f => f.frameId === preselect)) {
          setSel(s => ({ ...s, frameId: preselect }))
          // Van giu step 1 de user thay gong da chon roi moi Next
        }
      }),
    ]
    if (!frameOnly) {
      loaders.push(
        productApi.getLenses().then(r => setLenses(r.data.data ?? [])),
        eyeProfileApi.getMyProfiles().then(r =>
          setProfiles((r.data.data ?? []).filter(p => p.status === 'ACTIVE'))
        )
      )
    }
    Promise.all(loaders).catch(() => toast.error('Khong the tai du lieu'))
  }, [])

  const selFrame   = frames.find(f => f.frameId === sel.frameId)
  const selLens    = lenses.find(l => l.lensId   === sel.lensId)
  const selOptions = selLens?.options?.filter(o => sel.selectedOptionIds.includes(o.optionId)) ?? []
  const totalPrice = (selFrame?.price ?? 0)
    + (frameOnly ? 0 : (selLens?.price ?? 0))
    + selOptions.reduce((s, o) => s + (o.extraPrice ?? 0), 0)

  const toggleOption = (id) => setSel(s => ({
    ...s,
    selectedOptionIds: s.selectedOptionIds.includes(id)
      ? s.selectedOptionIds.filter(x => x !== id)
      : [...s.selectedOptionIds, id]
  }))

  const handleCreate = async () => {
    try {
      setBusy(true)
      if (frameOnly) {
        // Mua chi gong — goi truc tiep cartApi.addItem voi frameId
        await cartApi.addItem({ frameId: sel.frameId, quantity: 1 })
        await fetchCart()
        toast.success('Da them gong kinh vao gio hang!')
        navigate('/cart')
      } else {
        // Thiet ke day du — tao design roi them vao gio
        if (!sel.frameId || !sel.lensId || !sel.eyeProfileId) {
          toast.error('Vui long chon day du gong, trong va ho so mat')
          return
        }
        const res = await designApi.create(sel)
        await cartApi.addItem({ designId: res.data.data.designId, quantity: 1 })
        await fetchCart()
        toast.success('Da them thiet ke vao gio hang!')
        navigate('/cart')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Co loi xay ra')
    } finally { setBusy(false) }
  }

  // frameOnly: 2 buoc | normal: 4 buoc
  const steps = frameOnly
    ? ['Chon gong', 'Xac nhan']
    : ['Chon gong', 'Chon trong', 'Ho so mat', 'Xac nhan']

  const confirmStep = frameOnly ? 2 : 4

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>{frameOnly ? 'Mua gong kinh' : 'Thiet ke kinh'}</h1>
          <p>{frameOnly
            ? 'Chon gong kinh — khong kem trong kinh'
            : 'Tao doi kinh hoan hao theo doi mat cua ban'
          }</p>
        </div>
      </div>

      <div className="container section-sm">

        {/* Banner frameOnly */}
        {frameOnly && (
          <div style={{
            padding: '12px 16px', marginBottom: 24, borderRadius: 12,
            background: '#FEF3C7', border: '1px solid #FCD34D',
            fontSize: 14, color: '#92400E',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</span>
            <span>
              Ban dang mua <strong>chi gong kinh</strong>, khong kem trong.
              Can lam kinh day du?{' '}
              <button
                style={{
                  color: '#92400E', fontWeight: 700, textDecoration: 'underline',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14,
                }}
                onClick={() => navigate(sel.frameId ? `/design?frameId=${sel.frameId}` : '/design')}
              >
                Thiet ke theo yeu cau
              </button>
            </span>
          </div>
        )}

        {/* Steps */}
        <div className={styles.stepper}>
          {steps.map((s, i) => (
            <div key={i}
              className={`${styles.stepItem} ${step > i + 1 ? styles.stepDone : ''} ${step === i + 1 ? styles.stepActive : ''}`}>
              <div className={styles.stepCircle}>{step > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < steps.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>

            {/* ── STEP 1: Chon gong ── */}
            {step === 1 && (
              <div>
                <h3 className={styles.stepTitle}>Chon gong kinh</h3>
                {sel.frameId && (
                  <div style={{
                    padding: '10px 14px', marginBottom: 16, borderRadius: 10,
                    background: '#EFF6FF', border: '1px solid #BFDBFE',
                    fontSize: 14, color: '#1D4ED8',
                  }}>
                    Da chon: <strong>{selFrame?.name}</strong> —
                    click vao gong khac de doi, hoac nhan "Tiep theo" de xac nhan
                  </div>
                )}
                <div className={styles.grid3}>
                  {frames.map(f => (
                    <div key={f.frameId}
                      className={`${styles.selectCard} ${sel.frameId === f.frameId ? styles.selected : ''}`}
                      onClick={() => setSel(s => ({ ...s, frameId: f.frameId }))}>
                      {f.imageUrl ? (
                        <img src={f.imageUrl} alt={f.name}
                          style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className={styles.selectCardImg}>👓</div>
                      )}
                      <div className={styles.selectCardInfo}>
                        <span className={styles.brand}>{f.brand}</span>
                        <h4>{f.name}</h4>
                        <p>{[f.color, f.material, f.shape].filter(Boolean).join(' · ')}</p>
                        <p className={styles.price}>{fmtCurrency(f.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ marginTop: 24 }}
                  disabled={!sel.frameId}
                  onClick={() => setStep(frameOnly ? confirmStep : 2)}>
                  Tiep theo →
                </button>
              </div>
            )}

            {/* ── STEP 2 (normal): Chon trong ── */}
            {!frameOnly && step === 2 && (
              <div>
                {selFrame && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', marginBottom: 20,
                    background: 'var(--gray-1)', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--gray-2)',
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-5)', fontWeight: 600 }}>GONG DA CHON</span>
                    <span style={{ fontWeight: 600 }}>{selFrame.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--gold)', marginLeft: 'auto' }}>
                      {fmtCurrency(selFrame.price)}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Doi gong</button>
                  </div>
                )}
                <h3 className={styles.stepTitle}>Chon trong kinh</h3>
                <div className={styles.lensGrid}>
                  {lenses.map(l => (
                    <div key={l.lensId}
                      className={`${styles.lensCard} ${sel.lensId === l.lensId ? styles.selected : ''}`}
                      onClick={() => setSel(s => ({ ...s, lensId: l.lensId, selectedOptionIds: [] }))}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span className="badge badge-blue">{l.lensType}</span>
                        <span className="badge badge-gray">Index {l.indexValue}</span>
                      </div>
                      <h4>{l.name}</h4>
                      <p style={{ fontSize: 13, color: 'var(--gray-5)', marginTop: 4 }}>{l.material}</p>
                      <p className={styles.price} style={{ marginTop: 8 }}>{fmtCurrency(l.price)}</p>
                    </div>
                  ))}
                </div>
                {sel.lensId && selLens?.options?.length > 0 && (
                  <div className={styles.optionsSection}>
                    <h4>Tuy chon them</h4>
                    <div className={styles.optionsGrid}>
                      {selLens.options.map(o => (
                        <label key={o.optionId}
                          className={`${styles.optionItem} ${sel.selectedOptionIds.includes(o.optionId) ? styles.optionSelected : ''}`}>
                          <input type="checkbox" checked={sel.selectedOptionIds.includes(o.optionId)}
                            onChange={() => toggleOption(o.optionId)} />
                          <span>{o.optionName}</span>
                          <span className={styles.optionPrice}>+{fmtCurrency(o.extraPrice)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Quay lai</button>
                  <button className="btn btn-primary" disabled={!sel.lensId} onClick={() => setStep(3)}>
                    Tiep theo →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 (normal): Ho so mat ── */}
            {!frameOnly && step === 3 && (
              <div>
                <h3 className={styles.stepTitle}>Chon ho so mat</h3>
                {profiles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-5)' }}>
                    <p>Ban chua co ho so mat. Vui long tao ho so mat truoc.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }}
                      onClick={() => navigate('/eye-profiles')}>
                      Tao ho so mat
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {profiles.map(p => (
                      <div key={p.eyeProfileId}
                        className={`${styles.profileCard} ${sel.eyeProfileId === p.eyeProfileId ? styles.selected : ''}`}
                        onClick={() => setSel(s => ({ ...s, eyeProfileId: p.eyeProfileId }))}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span className={`badge ${p.source === 'MANUAL' ? 'badge-blue' : 'badge-yellow'}`}>
                            {p.source === 'MANUAL' ? 'Nhap tay' : 'Upload'}
                          </span>
                          <strong style={{ fontSize: 14 }}>
                            {p.profileName ?? `Ho so #${p.eyeProfileId}`}
                          </strong>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--gray-4)' }}>
                          {fmtDate(p.createdDate)}
                          {p.prescriptions?.length > 0 &&
                            ` · SPH: ${p.prescriptions[0]?.sph ?? '—'} / ${p.prescriptions[1]?.sph ?? '—'}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Ten thiet ke (tuy chon)</label>
                  <input className="form-input" value={sel.designName}
                    onChange={e => setSel(s => ({ ...s, designName: e.target.value }))}
                    placeholder="VD: Kinh di lam 2024" />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Quay lai</button>
                  <button className="btn btn-primary" disabled={!sel.eyeProfileId}
                    onClick={() => setStep(4)}>
                    Xem tom tat →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP CONFIRM ── */}
            {step === confirmStep && (
              <div>
                <h3 className={styles.stepTitle}>
                  {frameOnly ? 'Xac nhan mua gong' : 'Xac nhan thiet ke'}
                </h3>
                <div className={styles.confirmCard}>
                  <div className={styles.confirmRow}>
                    <span>Gong kinh</span>
                    <strong>{selFrame?.name ?? '—'}</strong>
                  </div>
                  {frameOnly ? (
                    <div className={styles.confirmRow}>
                      <span>Loai</span>
                      <strong style={{ color: '#92400E' }}>Chi gong — khong kem trong</strong>
                    </div>
                  ) : (
                    <>
                      <div className={styles.confirmRow}>
                        <span>Trong kinh</span>
                        <strong>{selLens?.name ?? '—'}</strong>
                      </div>
                      <div className={styles.confirmRow}>
                        <span>Ho so mat</span>
                        <strong>
                          {profiles.find(p => p.eyeProfileId === sel.eyeProfileId)?.profileName
                            ?? `Ho so #${sel.eyeProfileId}`}
                        </strong>
                      </div>
                    </>
                  )}
                  {selOptions.length > 0 && (
                    <div className={styles.confirmRow}>
                      <span>Tuy chon</span>
                      <strong>{selOptions.map(o => o.optionName).join(', ')}</strong>
                    </div>
                  )}
                  {sel.designName && (
                    <div className={styles.confirmRow}>
                      <span>Ten thiet ke</span>
                      <strong>{sel.designName}</strong>
                    </div>
                  )}
                  <hr className="divider" />
                  <div className={`${styles.confirmRow} ${styles.confirmTotal}`}>
                    <span>Tong gia</span>
                    <strong>{fmtCurrency(totalPrice)}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                  <button className="btn btn-outline"
                    onClick={() => setStep(frameOnly ? 1 : 3)}>
                    ← Quay lai
                  </button>
                  <button className="btn btn-primary btn-lg"
                    onClick={handleCreate} disabled={busy}>
                    {busy
                      ? <span className="spinner" />
                      : frameOnly
                        ? '🛒 Them gong vao gio hang'
                        : '🛒 Them vao gio hang'
                    }
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Preview sidebar */}
          <div className={styles.preview}>
            <h4>{frameOnly ? 'Gong da chon' : 'Thiet ke cua ban'}</h4>
            <div className={styles.previewItem}>
              <span>Gong:</span>
              <span>{selFrame?.name ?? '—'}</span>
            </div>
            {!frameOnly && (
              <div className={styles.previewItem}>
                <span>Trong:</span>
                <span>{selLens?.name ?? '—'}</span>
              </div>
            )}
            {selOptions.map(o => (
              <div key={o.optionId} className={styles.previewItem}>
                <span>{o.optionName}:</span>
                <span>+{fmtCurrency(o.extraPrice)}</span>
              </div>
            ))}
            <hr className="divider" />
            <div className={styles.previewTotal}>
              <span>Tong:</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                {fmtCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}