import { useState, useEffect, useRef } from 'react'
import { Plus, Eye, FileText, XCircle, ChevronDown, ChevronUp, Upload, Image } from 'lucide-react'
import { eyeProfileApi } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './EyeProfilePage.module.css'

export default function EyeProfilePage() {
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [expanded, setExpanded] = useState(null)

  const fetchProfiles = () => {
    setLoading(true)
    eyeProfileApi.getMyProfiles()
      .then(r => setProfiles(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải hồ sơ mắt'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchProfiles() }, [])

  const handleDeactivate = async (id) => {
    if (!confirm('Vô hiệu hoá hồ sơ này?')) return
    try {
      await eyeProfileApi.deactivate(id)
      toast.success('Đã vô hiệu hoá')
      fetchProfiles()
    } catch { toast.error('Có lỗi xảy ra') }
  }

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <h1>Hồ sơ mắt</h1>
              <p>Quản lý số đo mắt của bạn</p>
            </div>
            <div className={styles.headerBtns}>
              <button className="btn btn-outline btn-sm" onClick={() => setModal('upload')}>
                <Upload size={15}/> Upload đơn thuốc
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setModal('manual')}>
                <Plus size={15}/> Nhập số đo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {loading ? (
          <div className={styles.loadingState}><span className="spinner"/></div>
        ) : profiles.length === 0 ? (
          <div className={styles.empty}>
            <Eye size={48} strokeWidth={1} />
            <h3>Chưa có hồ sơ mắt</h3>
            <p>Tạo hồ sơ mắt để bắt đầu thiết kế kính theo số đo của bạn</p>
            <button className="btn btn-primary" onClick={() => setModal('manual')}>
              <Plus size={16}/> Tạo hồ sơ mắt
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {profiles.map(p => (
              <div key={p.eyeProfileId} className={`${styles.profileCard} ${p.status === 'INACTIVE' ? styles.inactive : ''}`}>
                <div className={styles.profileHeader} onClick={() => setExpanded(expanded === p.eyeProfileId ? null : p.eyeProfileId)}>
                  <div className={styles.profileMeta}>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                      {p.status === 'ACTIVE' ? 'Đang dùng' : 'Vô hiệu'}
                    </span>
                    <span className={`badge ${p.source === 'MANUAL' ? 'badge-blue' : 'badge-yellow'}`}>
                      {p.source === 'MANUAL' ? 'Nhập tay' : 'Upload'}
                    </span>
                    <span className={styles.profileName}>
                      {p.profileName ?? `Hồ sơ #${p.eyeProfileId}`}
                    </span>
                    <span className={styles.profileDate}>
                      {new Date(p.createdDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className={styles.profileActions}>
                    {p.status === 'ACTIVE' && (
                      <button className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); handleDeactivate(p.eyeProfileId) }}>
                        <XCircle size={15}/> Vô hiệu hoá
                      </button>
                    )}
                    {expanded === p.eyeProfileId ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </div>
                </div>

                {expanded === p.eyeProfileId && (
                  <div className={styles.profileBody}>
                    {p.prescriptions?.length > 0 ? (
                      <div className={styles.prescriptionTable}>
                        <table>
                          <thead>
                            <tr>
                              <th>Mắt</th>
                              <th>SPH<br/><small>Độ cầu</small></th>
                              <th>CYL<br/><small>Độ trụ</small></th>
                              <th>AXIS<br/><small>Trục</small></th>
                              <th>PD<br/><small>Đồng tử</small></th>
                              <th>ADD<br/><small>Độ thêm</small></th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.prescriptions.map(rx => (
                              <tr key={rx.prescriptionId}>
                                <td><strong>{rx.eyeSide === 'LEFT' ? '👁 Trái' : '👁 Phải'}</strong></td>
                                <td>{rx.sph ?? '—'}</td>
                                <td>{rx.cyl ?? '—'}</td>
                                <td>{rx.axis ?? '—'}</td>
                                <td>{rx.pd ?? '—'}</td>
                                <td>{rx.add ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : p.files?.length > 0 ? (
                      <div className={styles.files}>
                        {p.files.map(f => (
                          <div key={f.fileId} className={styles.filePreview}>
                            {f.fileUrl && f.fileUrl.startsWith('/uploads/') ? (
                              <a href={`http://localhost:8080${f.fileUrl}`} target="_blank" rel="noreferrer">
                                <img src={`http://localhost:8080${f.fileUrl}`} alt="Đơn thuốc"
                                  className={styles.fileImg}
                                  onError={e => { e.target.style.display='none' }}/>
                              </a>
                            ) : (
                              <div className={styles.fileLink}>
                                <FileText size={16}/>
                                <span>{f.fileUrl ?? 'File đã upload'}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{color:'var(--gray-4)'}}>Không có dữ liệu</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modal === 'manual' && <ManualModal onClose={() => setModal(null)} onSaved={fetchProfiles}/>}
      {modal === 'upload' && <UploadModal onClose={() => setModal(null)} onSaved={fetchProfiles}/>}
    </div>
  )
}

/* ── Manual Modal ── */
function ManualModal({ onClose, onSaved }) {
  const initEye = (side) => ({ eyeSide: side, sph:'', cyl:'', axis:'', pd:'', add:'' })
  const [profileName, setProfileName] = useState('')
  const [right, setRight] = useState(initEye('RIGHT'))
  const [left,  setLeft]  = useState(initEye('LEFT'))
  const [busy,  setBusy]  = useState(false)

  const setField = (side, k, v) => {
    if (side === 'RIGHT') setRight(p => ({...p, [k]: v}))
    else setLeft(p => ({...p, [k]: v}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profileName.trim()) { toast.error('Vui lòng đặt tên hồ sơ mắt'); return }
    try {
      setBusy(true)
      const clean = (o) => {
        const r = {}
        Object.entries(o).forEach(([k, v]) => {
          if (k === 'eyeSide') {
            r[k] = v
          } else if (v !== '' && v !== null && v !== undefined) {
            const num = parseFloat(v)
            if (!isNaN(num)) r[k] = num
          }
        })
        return r
      }
      await eyeProfileApi.createManual({
        profileName: profileName.trim(),
        rightEye: clean(right),
        leftEye:  clean(left),
      })
      toast.success('Tạo hồ sơ mắt thành công!')
      onSaved(); onClose()
    } catch (err) {
      const errData = err.response?.data
      if (errData?.data && typeof errData.data === 'object') {
        const msgs = Object.values(errData.data).join('\n')
        toast.error(msgs)
      } else {
        toast.error(errData?.message ?? 'Có lỗi xảy ra')
      }
    } finally { setBusy(false) }
  }

  const fieldConfig = [
    { key:'sph',  label:'SPH — Độ cầu',        placeholder:'-2.50', hint:'-20.00 đến +20.00', step:'0.25' },
    { key:'cyl',  label:'CYL — Độ trụ',        placeholder:'-0.25', hint:'-10.00 đến 0.00',   step:'0.25' },
    { key:'axis', label:'AXIS — Trục loạn thị',placeholder:'175',   hint:'0 đến 180 độ',       step:'1'    },
    { key:'pd',   label:'PD — Khoảng đồng tử', placeholder:'62',    hint:'50 đến 80 mm',       step:'0.5'  },
    { key:'add',  label:'ADD — Độ thêm (lão)',  placeholder:'',      hint:'0 đến +4.00 (tuỳ chọn)', step:'0.25' },
  ]

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Nhập số đo mắt</h3>
        <p style={{fontSize:'13px',color:'var(--gray-5)',marginBottom:'20px'}}>
          Điền số đo từ đơn thuốc kính của bạn. Các trường không có thể để trống.
        </p>
        <form onSubmit={handleSubmit}>
          {/* Tên hồ sơ — bắt buộc */}
          <div className="form-group" style={{marginBottom:'24px'}}>
            <label className="form-label">Tên hồ sơ mắt <span style={{color:'red'}}>*</span></label>
            <input className="form-input" value={profileName}
              onChange={e => setProfileName(e.target.value)}
              placeholder="VD: Kính đi làm 2024, Kính đọc sách..." autoFocus />
          </div>

          {[['RIGHT', right, '👁 Mắt phải (OD)'], ['LEFT', left, '👁 Mắt trái (OS)']].map(([side, data, label]) => (
            <div key={side} className={styles.eyeSection}>
              <p className={styles.eyeLabel}>{label}</p>
              <div className={styles.eyeFieldsGrid}>
                {fieldConfig.map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type="number"
                      step={f.step} value={data[f.key]}
                      onChange={e => setField(side, f.key, e.target.value)}
                      placeholder={f.placeholder} />
                    <span className={styles.fieldHint}>{f.hint}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <span className="spinner"/> : 'Lưu hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Upload Modal ── */
function UploadModal({ onClose, onSaved }) {
  const [profileName, setProfileName] = useState('')
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [busy,    setBusy]    = useState(false)
  const fileRef = useRef()

  const handleFileChange = (f) => {
    if (!f) return
    const allowed = ['image/jpeg','image/png','image/gif','image/webp','application/pdf']
    if (!allowed.includes(f.type)) {
      toast.error('Chỉ chấp nhận JPG, PNG, GIF, WEBP hoặc PDF')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn, tối đa 5MB')
      return
    }
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profileName.trim()) { toast.error('Vui lòng đặt tên hồ sơ mắt'); return }
    if (!file) { toast.error('Vui lòng chọn file'); return }
    try {
      setBusy(true)
      // Gửi multipart/form-data — đúng với BE mới
      const formData = new FormData()
      formData.append('profileName', profileName.trim())
      formData.append('file', file)
      await eyeProfileApi.createUpload(formData)
      toast.success('Upload hồ sơ thành công!')
      onSaved(); onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Upload đơn thuốc mắt</h3>
        <p style={{fontSize:'13px',color:'var(--gray-5)',marginBottom:'20px'}}>
          Chụp ảnh đơn thuốc kính và upload lên đây
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom:'16px'}}>
            <label className="form-label">Tên hồ sơ mắt <span style={{color:'red'}}>*</span></label>
            <input className="form-input" value={profileName}
              onChange={e => setProfileName(e.target.value)}
              placeholder="VD: Đơn thuốc tháng 6/2024" autoFocus />
          </div>

          <div className={`${styles.dropZone} ${file ? styles.dropZoneActive : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0]) }}>
            {preview ? (
              <img src={preview} alt="Preview" className={styles.previewImg}/>
            ) : file ? (
              <div className={styles.fileSelected}>
                <FileText size={40} strokeWidth={1} style={{color:'var(--gold)'}}/>
                <p style={{fontWeight:600}}>{file.name}</p>
                <span>{(file.size/1024).toFixed(0)} KB</span>
              </div>
            ) : (
              <div className={styles.dropPlaceholder}>
                <Image size={48} strokeWidth={1} style={{color:'var(--gray-3)',marginBottom:'12px'}}/>
                <p>Kéo thả file vào đây hoặc <strong style={{color:'var(--ink)'}}>nhấn để chọn</strong></p>
                <span>JPG, PNG, WEBP, PDF — Tối đa 5MB</span>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
            style={{display:'none'}}
            onChange={e => handleFileChange(e.target.files[0])} />

          {file && (
            <button type="button" className="btn btn-ghost btn-sm" style={{marginTop:'8px'}}
              onClick={() => { setFile(null); setPreview(null) }}>
              ✕ Chọn lại
            </button>
          )}

          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy || !file}>
              {busy ? <span className="spinner"/> : 'Lưu hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
