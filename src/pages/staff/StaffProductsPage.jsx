import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Image } from 'lucide-react'
import { productApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'
import { fmtCurrency } from '../../utils/format'
import ImageUpload from '../../components/ui/ImageUpload'

export default function StaffProductsPage() {
  const { isAdmin } = useAuth()
  const [tab,     setTab]     = useState('frames')
  const [frames,  setFrames]  = useState([])
  const [lenses,  setLenses]  = useState([])
  const [ready,   setReady]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      productApi.getFrames().then(r   => setFrames(r.data.data ?? [])),
      productApi.getLenses().then(r   => setLenses(r.data.data ?? [])),
      productApi.getReadyMade().then(r => setReady(r.data.data  ?? [])),
    ]).finally(() => setLoading(false))
  }
  useEffect(() => { fetchAll() }, [])

  const deleteFrame = async (id) => {
    if (!window.confirm('An gong kinh nay?')) return
    try { await productApi.deleteFrame(id); toast.success('Da an'); fetchAll() }
    catch { toast.error('Co loi xay ra') }
  }
  const deleteLens = async (id) => {
    if (!window.confirm('An trong kinh nay?')) return
    try { await productApi.deleteLens(id); toast.success('Da an'); fetchAll() }
    catch { toast.error('Co loi xay ra') }
  }
  const deleteReady = async (id) => {
    if (!window.confirm('An san pham nay?')) return
    try { await productApi.deleteReadyMade(id); toast.success('Da an'); fetchAll() }
    catch { toast.error('Co loi xay ra') }
  }

  const toggleStatus = async (item, type) => {
    const newStatus = item.status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE'
    try {
      if (type === 'frame') {
        await productApi.updateFrame(item.frameId, { ...item, status: newStatus })
        setFrames(fs => fs.map(f => f.frameId === item.frameId ? { ...f, status: newStatus } : f))
      } else if (type === 'lens') {
        await productApi.updateLens(item.lensId, { ...item, status: newStatus })
        setLenses(ls => ls.map(l => l.lensId === item.lensId ? { ...l, status: newStatus } : l))
      } else {
        await productApi.updateReadyMade(item.productId, { ...item, status: newStatus })
        setReady(rs => rs.map(r => r.productId === item.productId ? { ...r, status: newStatus } : r))
      }
      toast.success('Da cap nhat trang thai!')
    } catch { toast.error('Co loi xay ra') }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Quan ly san pham</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: tab })}>
          <Plus size={15} /> Them moi
        </button>
      </div>

      <div className={styles.filterTabs}>
        {[['frames','Gong kinh'],['lenses','Trong kinh'],['ready','Kinh lam san']].map(([k, l]) => (
          <button key={k}
            className={`${styles.filterTab} ${tab === k ? styles.filterActive : ''}`}
            onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}><span className="spinner" /></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {tab === 'frames' && <><th>Anh</th><th>Ten</th><th>Thuong hieu</th><th>Mau / Chat lieu / Dang</th><th>Gia</th><th>Ton kho</th><th>Trang thai</th><th></th></>}
                {tab === 'lenses' && <><th>Ten</th><th>Loai</th><th>Chat lieu</th><th>Index</th><th>Gia</th><th>Trang thai</th><th></th></>}
                {tab === 'ready'  && <><th>Anh</th><th>Ten</th><th>Thuong hieu</th><th>Gia</th><th>Ton kho</th><th>Trang thai</th><th></th></>}
              </tr>
            </thead>
            <tbody>
              {tab === 'frames' && frames.map(f => (
                <tr key={f.frameId}>
                  {/* Thumbnail */}
                  <td style={{ width: 56 }}>
                    {f.imageUrl ? (
                      <img src={f.imageUrl} alt={f.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E7EB' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, background: '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Image size={18} color="#D1D5DB" />
                      </div>
                    )}
                  </td>
                  <td><strong style={{ fontSize: 14 }}>{f.name}</strong></td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>{f.brand}</td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>
                    {[f.color, f.material, f.shape].filter(Boolean).join(' · ')}
                  </td>
                  <td style={{ fontWeight: 600 }}>{fmtCurrency(f.price)}</td>
                  <td style={{ textAlign: 'center' }}>{f.stockQuantity ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className={`badge ${f.status === 'AVAILABLE' ? 'badge-green' : f.status === 'OUT_OF_STOCK' ? 'badge-yellow' : 'badge-gray'}`}>
                        {f.status === 'AVAILABLE' ? 'Dang ban' : f.status === 'OUT_OF_STOCK' ? 'Het hang' : 'Ngung ban'}
                      </span>
                      {isAdmin && f.status !== 'DISCONTINUED' && (
                        <button
                          style={{
                            padding: '3px 10px', fontSize: 12, fontWeight: 600,
                            borderRadius: 6, cursor: 'pointer', border: 'none',
                            background: f.status === 'AVAILABLE' ? '#FFF3E0' : '#E8F5E9',
                            color:      f.status === 'AVAILABLE' ? '#E65100' : '#2E7D32',
                          }}
                          onClick={() => toggleStatus(f, 'frame')}>
                          {f.status === 'AVAILABLE' ? 'Het hang' : 'Mo ban'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'frames', item: f })}><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteFrame(f.frameId)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {tab === 'lenses' && lenses.map(l => (
                <tr key={l.lensId}>
                  <td><strong style={{ fontSize: 14 }}>{l.name}</strong></td>
                  <td><span className="badge badge-blue">{l.lensType}</span></td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>{l.material}</td>
                  <td style={{ fontSize: 13 }}>{l.indexValue}</td>
                  <td style={{ fontWeight: 600 }}>{fmtCurrency(l.price)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${l.status === 'AVAILABLE' ? 'badge-green' : 'badge-gray'}`}>
                        {l.status === 'AVAILABLE' ? 'Dang ban' : 'Ngung ban'}
                      </span>
                      {isAdmin && (
                        <button
                          style={{
                            padding: '3px 10px', fontSize: 12, fontWeight: 600,
                            borderRadius: 6, cursor: 'pointer', border: 'none',
                            background: l.status === 'AVAILABLE' ? '#FFF3E0' : '#E8F5E9',
                            color:      l.status === 'AVAILABLE' ? '#E65100' : '#2E7D32',
                          }}
                          onClick={() => toggleStatus(l, 'lens')}>
                          {l.status === 'AVAILABLE' ? 'Tat ban' : 'Mo ban'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'lenses', item: l })}><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteLens(l.lensId)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {tab === 'ready' && ready.map(r => (
                <tr key={r.productId}>
                  <td style={{ width: 56 }}>
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E7EB' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, background: '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Image size={18} color="#D1D5DB" />
                      </div>
                    )}
                  </td>
                  <td><strong style={{ fontSize: 14 }}>{r.name}</strong></td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>{r.brand}</td>
                  <td style={{ fontWeight: 600 }}>{fmtCurrency(r.price)}</td>
                  <td style={{ textAlign: 'center' }}>{r.stockQuantity ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className={`badge ${r.status === 'AVAILABLE' ? 'badge-green' : r.status === 'OUT_OF_STOCK' ? 'badge-yellow' : 'badge-gray'}`}>
                        {r.status === 'AVAILABLE' ? 'Dang ban' : r.status === 'OUT_OF_STOCK' ? 'Het hang' : 'Ngung ban'}
                      </span>
                      {isAdmin && r.status !== 'DISCONTINUED' && (
                        <button
                          style={{
                            padding: '3px 10px', fontSize: 12, fontWeight: 600,
                            borderRadius: 6, cursor: 'pointer', border: 'none',
                            background: r.status === 'AVAILABLE' ? '#FFF3E0' : '#E8F5E9',
                            color:      r.status === 'AVAILABLE' ? '#E65100' : '#2E7D32',
                          }}
                          onClick={() => toggleStatus(r, 'ready')}>
                          {r.status === 'AVAILABLE' ? 'Het hang' : 'Mo ban'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'ready', item: r })}><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteReady(r.productId)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <ProductModal modal={modal} onClose={() => setModal(null)} onSaved={fetchAll} />}
    </div>
  )
}

// ── Product Modal ─────────────────────────────────────────────────────────────

function ProductModal({ modal, onClose, onSaved }) {
  const { type, item } = modal
  const isEdit = !!item

  const initFrame = () => ({ name: '', brand: '', color: '', material: '', shape: '', price: '', stockQuantity: '', imageUrl: '' })
  const initLens  = () => ({ name: '', lensType: '', material: '', indexValue: '', price: '' })
  const initReady = () => ({ name: '', brand: '', price: '', stockQuantity: '', imageUrl: '', description: '' })

  const init = type === 'frames' ? initFrame() : type === 'lenses' ? initLens() : initReady()
  const [form, setForm] = useState(isEdit ? { ...init, ...item } : init)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setImg = (url) => setForm(f => ({ ...f, imageUrl: url }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setBusy(true)
      if (type === 'frames') {
        isEdit
          ? await productApi.updateFrame(item.frameId, form)
          : await productApi.createFrame(form)
      } else if (type === 'lenses') {
        isEdit
          ? await productApi.updateLens(item.lensId, form)
          : await productApi.createLens(form)
      } else {
        isEdit
          ? await productApi.updateReadyMade(item.productId, form)
          : await productApi.createReadyMade(form)
      }
      toast.success(isEdit ? 'Da cap nhat' : 'Da them moi')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Co loi xay ra')
    } finally { setBusy(false) }
  }

  const titles = { frames: 'gong kinh', lenses: 'trong kinh', ready: 'kinh lam san' }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}
        style={{ maxWidth: 620 }}>
        <h3>{isEdit ? 'Chinh sua' : 'Them'} {titles[type]}</h3>
        <form onSubmit={handleSubmit} className={styles.modalForm}>

          {/* FRAMES */}
          {type === 'frames' && <>
            {/* Upload anh */}
            <ImageUpload value={form.imageUrl} onChange={setImg} label="Anh gong kinh" />

            <div className="form-group">
              <label className="form-label">Ten *</label>
              <input className="form-input" value={form.name} onChange={set('name')} required />
            </div>
            <div className={styles.row2}>
              <div className="form-group">
                <label className="form-label">Thuong hieu</label>
                <input className="form-input" value={form.brand} onChange={set('brand')} />
              </div>
              <div className="form-group">
                <label className="form-label">Mau sac</label>
                <input className="form-input" value={form.color} onChange={set('color')} />
              </div>
            </div>
            <div className={styles.row2}>
              <div className="form-group">
                <label className="form-label">Chat lieu</label>
                <input className="form-input" value={form.material} onChange={set('material')} />
              </div>
              <div className="form-group">
                <label className="form-label">Kieu dang</label>
                <select className="form-input" value={form.shape} onChange={set('shape')}>
                  <option value="">-- Chon --</option>
                  {['Oval','Rectangle','Round','Square','Cat Eye','Aviator','Browline'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.row2}>
              <div className="form-group">
                <label className="form-label">Gia (VND) *</label>
                <input className="form-input" type="number" value={form.price} onChange={set('price')} required min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Ton kho</label>
                <input className="form-input" type="number" value={form.stockQuantity} onChange={set('stockQuantity')} min="0" />
              </div>
            </div>
          </>}

          {/* LENSES */}
          {type === 'lenses' && <>
            <div className="form-group">
              <label className="form-label">Ten *</label>
              <input className="form-input" value={form.name} onChange={set('name')} required />
            </div>
            <div className={styles.row2}>
              <div className="form-group">
                <label className="form-label">Loai trong</label>
                <select className="form-input" value={form.lensType} onChange={set('lensType')}>
                  <option value="">Chon loai</option>
                  {['SINGLE_VISION','BIFOCAL','PROGRESSIVE','BLUE_LIGHT'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vat lieu</label>
                <input className="form-input" value={form.material} onChange={set('material')} />
              </div>
            </div>
            <div className={styles.row2}>
              <div className="form-group">
                <label className="form-label">Index</label>
                <input className="form-input" type="number" step="0.01" value={form.indexValue} onChange={set('indexValue')} />
              </div>
              <div className="form-group">
                <label className="form-label">Gia (VND) *</label>
                <input className="form-input" type="number" value={form.price} onChange={set('price')} required min="0" />
              </div>
            </div>
          </>}

          {/* READY MADE */}
          {type === 'ready' && <>
            {/* Upload anh */}
            <ImageUpload value={form.imageUrl} onChange={setImg} label="Anh san pham" />

            <div className="form-group">
              <label className="form-label">Ten *</label>
              <input className="form-input" value={form.name} onChange={set('name')} required />
            </div>
            <div className={styles.row2}>
              <div className="form-group">
                <label className="form-label">Thuong hieu</label>
                <input className="form-input" value={form.brand} onChange={set('brand')} />
              </div>
              <div className="form-group">
                <label className="form-label">Gia (VND) *</label>
                <input className="form-input" type="number" value={form.price} onChange={set('price')} required min="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ton kho</label>
              <input className="form-input" type="number" value={form.stockQuantity} onChange={set('stockQuantity')} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Mo ta</label>
              <textarea className="form-input" rows={3} value={form.description}
                onChange={set('description')} style={{ resize: 'vertical' }} />
            </div>
          </>}

          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huy</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <span className="spinner" /> : isEdit ? 'Luu' : 'Them'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}