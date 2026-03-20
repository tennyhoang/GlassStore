import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { productApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'

function fmt(n) { return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '—' }

export default function StaffProductsPage() {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState('frames')
  const [frames, setFrames] = useState([])
  const [lenses, setLenses] = useState([])
  const [ready,  setReady]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { type, item? }

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      productApi.getFrames().then(r => setFrames(r.data.data ?? [])),
      productApi.getLenses().then(r => setLenses(r.data.data ?? [])),
      productApi.getReadyMade().then(r => setReady(r.data.data ?? [])),
    ]).finally(() => setLoading(false))
  }
  useEffect(() => { fetchAll() }, [])

  const deleteFrame = async (id) => {
    if (!confirm('Ẩn gọng kính này?')) return
    try { await productApi.deleteFrame(id); toast.success('Đã ẩn'); fetchAll() }
    catch { toast.error('Có lỗi xảy ra') }
  }
  const deleteLens = async (id) => {
    if (!confirm('Ẩn tròng kính này?')) return
    try { await productApi.deleteLens(id); toast.success('Đã ẩn'); fetchAll() }
    catch { toast.error('Có lỗi xảy ra') }
  }
  const deleteReady = async (id) => {
    if (!confirm('Ẩn sản phẩm này?')) return
    try { await productApi.deleteReadyMade(id); toast.success('Đã ẩn'); fetchAll() }
    catch { toast.error('Có lỗi xảy ra') }
  }

  const toggleStatus = async (item, type) => {
    const newStatus = item.status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE'
    try {
      if (type === 'frame') {
        await productApi.updateFrame(item.frameId, {...item, status: newStatus, stockQuantity: item.stockQuantity})
      } else if (type === 'lens') {
        await productApi.updateLens(item.lensId, {...item, status: newStatus})
      } else {
        await productApi.updateReadyMade(item.productId, {...item, status: newStatus})
      }
      toast.success('Đã cập nhật trạng thái!')
      fetchAll()
    } catch { toast.error('Có lỗi xảy ra') }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Quản lý sản phẩm</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: tab })}>
          <Plus size={15}/> Thêm mới
        </button>
      </div>

      <div className={styles.filterTabs}>
        {[['frames','Gọng kính'],['lenses','Tròng kính'],['ready','Kính làm sẵn']].map(([k,l]) => (
          <button key={k} className={`${styles.filterTab} ${tab===k?styles.filterActive:''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {loading ? <div className={styles.loading}><span className="spinner"/></div> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              {tab === 'frames' && <tr><th>Tên</th><th>Thương hiệu</th><th>Màu</th><th>Chất liệu</th><th>Giá</th><th>Tồn kho</th><th>TT</th><th></th></tr>}
              {tab === 'lenses' && <tr><th>Tên</th><th>Loại</th><th>Vật liệu</th><th>Index</th><th>Giá</th><th>TT</th><th></th></tr>}
              {tab === 'ready'  && <tr><th>Tên</th><th>Thương hiệu</th><th>Giá</th><th>Tồn kho</th><th>TT</th><th></th></tr>}
            </thead>
            <tbody>
              {tab === 'frames' && frames.map(f => (
                <tr key={f.frameId}>
                  <td><strong>{f.name}</strong></td>
                  <td>{f.brand}</td><td>{f.color}</td><td>{f.material}</td>
                  <td>{fmt(f.price)}</td><td>{f.stockQuantity}</td>
                  <td><span className={`badge ${f.status==='AVAILABLE'?'badge-green':'badge-gray'}`}>{f.status==='AVAILABLE'?'Đang bán':'Ngừng bán'}</span></td>
                  <td><div className={styles.actions}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal({type:'frames',item:f})}><Pencil size={14}/></button>
                    <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={() => deleteFrame(f.frameId)}><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
              {tab === 'lenses' && lenses.map(l => (
                <tr key={l.lensId}>
                  <td><strong>{l.name}</strong></td>
                  <td><span className="badge badge-blue">{l.lensType}</span></td>
                  <td>{l.material}</td><td>{l.indexValue}</td>
                  <td>{fmt(l.price)}</td>
                  <td>
                    <span className={`badge ${l.status==='AVAILABLE'?'badge-green':'badge-gray'}`}>{l.status==='AVAILABLE'?'Đang bán':'Ngừng bán'}</span>
                    {isAdmin && (
                      <button className="btn btn-ghost btn-sm" style={{marginLeft:'6px',fontSize:'11px'}}
                        onClick={() => toggleStatus(l,'lens')}>
                        {l.status==='AVAILABLE'?'Tắt':'Bật'}
                      </button>
                    )}
                  </td>
                  <td><div className={styles.actions}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal({type:'lenses',item:l})}><Pencil size={14}/></button>
                    <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={() => deleteLens(l.lensId)}><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
              {tab === 'ready' && ready.map(r => (
                <tr key={r.productId}>
                  <td><strong>{r.name}</strong></td>
                  <td>{r.brand}</td><td>{fmt(r.price)}</td><td>{r.stockQuantity}</td>
                  <td>
                    <span className={`badge ${r.status==='AVAILABLE'?'badge-green':r.status==='OUT_OF_STOCK'?'badge-yellow':'badge-gray'}`}>
                      {r.status==='AVAILABLE'?'Đang bán':r.status==='OUT_OF_STOCK'?'Hết hàng':'Ngừng bán'}
                    </span>
                    {isAdmin && (
                      <button className="btn btn-ghost btn-sm" style={{marginLeft:'6px',fontSize:'11px'}}
                        onClick={() => toggleStatus(r,'ready')}>
                        {r.status==='AVAILABLE'?'Đánh dấu hết':'Mở bán'}
                      </button>
                    )}
                  </td>
                  <td><div className={styles.actions}>
                    <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={() => deleteReady(r.productId)}><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <ProductModal modal={modal} onClose={() => setModal(null)} onSaved={fetchAll}/>}
    </div>
  )
}

function ProductModal({ modal, onClose, onSaved }) {
  const { type, item } = modal
  const isEdit = !!item

  const initFrame = () => ({ name:'', brand:'', color:'', material:'', shape:'', price:'', stockQuantity:'', imageUrl:'' })
  const initLens  = () => ({ name:'', lensType:'', material:'', indexValue:'', price:'' })
  const initReady = () => ({ name:'', brand:'', price:'', stockQuantity:'', imageUrl:'', description:'' })

  const init = type==='frames' ? initFrame() : type==='lenses' ? initLens() : initReady()
  const [form, setForm] = useState(isEdit ? { ...init, ...item } : init)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setBusy(true)
      const data = { ...form }
      if (type === 'frames') {
        isEdit ? await productApi.updateFrame(item.frameId, data) : await productApi.createFrame(data)
      } else if (type === 'lenses') {
        isEdit ? await productApi.updateLens(item.lensId, data) : await productApi.createLens(data)
      } else {
        isEdit ? await productApi.updateReadyMade(item.productId, data) : await productApi.createReadyMade(data)
      }
      toast.success(isEdit ? 'Đã cập nhật' : 'Đã thêm mới')
      onSaved(); onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  const titles = { frames:'gọng kính', lenses:'tròng kính', ready:'kính làm sẵn' }

  const toggleStatus = async (item, type) => {
    const newStatus = item.status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE'
    try {
      if (type === 'frame') {
        await productApi.updateFrame(item.frameId, {...item, status: newStatus, stockQuantity: item.stockQuantity})
      } else if (type === 'lens') {
        await productApi.updateLens(item.lensId, {...item, status: newStatus})
      } else {
        await productApi.updateReadyMade(item.productId, {...item, status: newStatus})
      }
      toast.success('Đã cập nhật trạng thái!')
      fetchAll()
    } catch { toast.error('Có lỗi xảy ra') }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>{isEdit ? 'Chỉnh sửa' : 'Thêm'} {titles[type]}</h3>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {type === 'frames' && <>
            <div className="form-group"><label className="form-label">Tên *</label><input className="form-input" value={form.name} onChange={set('name')} required/></div>
            <div className={styles.row2}>
              <div className="form-group"><label className="form-label">Thương hiệu</label><input className="form-input" value={form.brand} onChange={set('brand')}/></div>
              <div className="form-group"><label className="form-label">Màu sắc</label><input className="form-input" value={form.color} onChange={set('color')}/></div>
            </div>
            <div className={styles.row2}>
              <div className="form-group"><label className="form-label">Chất liệu</label><input className="form-input" value={form.material} onChange={set('material')}/></div>
              <div className="form-group"><label className="form-label">Kiểu dáng</label><input className="form-input" value={form.shape} onChange={set('shape')}/></div>
            </div>
            <div className={styles.row2}>
              <div className="form-group"><label className="form-label">Giá (VNĐ) *</label><input className="form-input" type="number" value={form.price} onChange={set('price')} required/></div>
              <div className="form-group"><label className="form-label">Tồn kho</label><input className="form-input" type="number" value={form.stockQuantity} onChange={set('stockQuantity')}/></div>
            </div>
            <div className="form-group"><label className="form-label">URL ảnh</label><input className="form-input" value={form.imageUrl} onChange={set('imageUrl')}/></div>
          </>}
          {type === 'lenses' && <>
            <div className="form-group"><label className="form-label">Tên *</label><input className="form-input" value={form.name} onChange={set('name')} required/></div>
            <div className={styles.row2}>
              <div className="form-group"><label className="form-label">Loại tròng</label>
                <select className="form-input" value={form.lensType} onChange={set('lensType')}>
                  <option value="">Chọn loại</option>
                  {['SINGLE_VISION','BIFOCAL','PROGRESSIVE','BLUE_LIGHT'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Vật liệu</label><input className="form-input" value={form.material} onChange={set('material')}/></div>
            </div>
            <div className={styles.row2}>
              <div className="form-group"><label className="form-label">Index</label><input className="form-input" type="number" step="0.01" value={form.indexValue} onChange={set('indexValue')}/></div>
              <div className="form-group"><label className="form-label">Giá (VNĐ) *</label><input className="form-input" type="number" value={form.price} onChange={set('price')} required/></div>
            </div>
          </>}
          {type === 'ready' && <>
            <div className="form-group"><label className="form-label">Tên *</label><input className="form-input" value={form.name} onChange={set('name')} required/></div>
            <div className={styles.row2}>
              <div className="form-group"><label className="form-label">Thương hiệu</label><input className="form-input" value={form.brand} onChange={set('brand')}/></div>
              <div className="form-group"><label className="form-label">Giá (VNĐ) *</label><input className="form-input" type="number" value={form.price} onChange={set('price')} required/></div>
            </div>
            <div className={styles.row2}>
              <div className="form-group"><label className="form-label">Tồn kho</label><input className="form-input" type="number" value={form.stockQuantity} onChange={set('stockQuantity')}/></div>
              <div className="form-group"><label className="form-label">URL ảnh</label><input className="form-input" value={form.imageUrl} onChange={set('imageUrl')}/></div>
            </div>
            <div className="form-group"><label className="form-label">Mô tả</label><textarea className="form-input" rows={3} value={form.description} onChange={set('description')} style={{resize:'vertical'}}/></div>
          </>}
          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner"/> : isEdit ? 'Lưu' : 'Thêm'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}