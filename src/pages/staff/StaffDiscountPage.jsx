import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import styles from './StaffPage.module.css'
import dStyles from './StaffDiscountPage.module.css'

function fmt(n) {
  return n ? new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n) : '—'
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('vi-VN') : '—'
}

export default function StaffDiscountPage() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | { item? }

  const fetch = () => {
    setLoading(true)
    api.get('/discounts')
      .then(r => setItems(r.data.data ?? []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Xoá mã giảm giá này?')) return
    try {
      await api.delete(`/discounts/${id}`)
      toast.success('Đã xoá')
      fetch()
    } catch { toast.error('Có lỗi xảy ra') }
  }

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/discounts/${id}/toggle`)
      toast.success(res.data.message)
      fetch()
    } catch { toast.error('Có lỗi xảy ra') }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h2>Quản lý khuyến mãi</h2>
          <p style={{fontSize:'14px',color:'var(--gray-5)'}}>Tạo và quản lý mã giảm giá</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({})}>
          <Plus size={15}/> Tạo mã mới
        </button>
      </div>

      {/* Stats tổng quan */}
      <div className={dStyles.statsRow}>
        <div className={dStyles.statBox}>
          <Tag size={18} style={{color:'var(--gold)'}}/>
          <div>
            <p className={dStyles.statLabel}>Tổng mã</p>
            <p className={dStyles.statVal}>{items.length}</p>
          </div>
        </div>
        <div className={dStyles.statBox}>
          <ToggleRight size={18} style={{color:'#2e7d32'}}/>
          <div>
            <p className={dStyles.statLabel}>Đang hoạt động</p>
            <p className={dStyles.statVal}>{items.filter(i => i.active).length}</p>
          </div>
        </div>
        <div className={dStyles.statBox}>
          <ToggleLeft size={18} style={{color:'var(--gray-4)'}}/>
          <div>
            <p className={dStyles.statLabel}>Đã tắt</p>
            <p className={dStyles.statVal}>{items.filter(i => !i.active).length}</p>
          </div>
        </div>
      </div>

      {loading ? <div className={styles.loading}><span className="spinner"/></div>
      : items.length === 0 ? (
        <div className={styles.empty}>
          <p>Chưa có mã giảm giá nào</p>
          <button className="btn btn-primary btn-sm" style={{marginTop:'12px'}}
            onClick={() => setModal({})}>
            <Plus size={14}/> Tạo mã đầu tiên
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã giảm giá</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Giảm tối đa</th>
                <th>Đã dùng</th>
                <th>Hạn dùng</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(d => (
                <tr key={d.discountId}>
                  <td>
                    <span className={dStyles.codeTag}>{d.code}</span>
                  </td>
                  <td>
                    <span className={`badge ${d.discountType === 'PERCENTAGE' ? 'badge-blue' : 'badge-yellow'}`}>
                      {d.discountType === 'PERCENTAGE' ? '% Phần trăm' : '₫ Cố định'}
                    </span>
                  </td>
                  <td>
                    <strong>
                      {d.discountType === 'PERCENTAGE'
                        ? `${d.discountValue}%`
                        : fmt(d.discountValue)}
                    </strong>
                  </td>
                  <td>{fmt(d.minOrderAmount)}</td>
                  <td>{fmt(d.maxDiscountAmount)}</td>
                  <td>
                    <span style={{fontSize:'13px'}}>
                      {d.usedCount ?? 0}
                      {d.usageLimit ? ` / ${d.usageLimit}` : ' / ∞'}
                    </span>
                  </td>
                  <td style={{fontSize:'13px',color: d.expiryDate && new Date(d.expiryDate) < new Date() ? 'var(--red)' : 'inherit'}}>
                    {fmtDate(d.expiryDate)}
                    {d.expiryDate && new Date(d.expiryDate) < new Date() && (
                      <span className="badge badge-red" style={{marginLeft:'6px',fontSize:'10px'}}>Hết hạn</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleToggle(d.discountId)}
                      style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',
                        fontWeight:500, color: d.active ? '#2e7d32' : 'var(--gray-4)',
                        padding:'4px 8px', borderRadius:'var(--radius-sm)',
                        background: d.active ? '#e8f5e9' : 'var(--gray-1)',
                        transition:'var(--transition)'}}>
                      {d.active
                        ? <><ToggleRight size={16}/> Đang bật</>
                        : <><ToggleLeft  size={16}/> Đã tắt</>}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => setModal({ item: d })}>
                        <Pencil size={14}/>
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}}
                        onClick={() => handleDelete(d.discountId)}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <DiscountModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetch() }}
        />
      )}
    </div>
  )
}

/* ── Modal tạo / sửa ── */
function DiscountModal({ item, onClose, onSaved }) {
  const isEdit = !!item
  const [form, setForm] = useState({
    code:             item?.code             ?? '',
    discountType:     item?.discountType     ?? 'PERCENTAGE',
    discountValue:    item?.discountValue    ?? '',
    minOrderAmount:   item?.minOrderAmount   ?? '',
    maxDiscountAmount:item?.maxDiscountAmount ?? '',
    usageLimit:       item?.usageLimit       ?? '',
    expiryDate:       item?.expiryDate ? item.expiryDate.substring(0,10) : '',
    active:           item?.active ?? true,
  })
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code.trim())      { toast.error('Nhập mã giảm giá'); return }
    if (!form.discountValue)    { toast.error('Nhập giá trị giảm'); return }
    if (form.discountType === 'PERCENTAGE' && (Number(form.discountValue) < 1 || Number(form.discountValue) > 100)) {
      toast.error('Phần trăm giảm phải từ 1-100%'); return
    }
    try {
      setBusy(true)
      const body = {
        code:              form.code.toUpperCase().trim(),
        discountType:      form.discountType,
        discountValue:     Number(form.discountValue),
        minOrderAmount:    form.minOrderAmount   ? Number(form.minOrderAmount)    : null,
        maxDiscountAmount: form.maxDiscountAmount? Number(form.maxDiscountAmount) : null,
        usageLimit:        form.usageLimit       ? Number(form.usageLimit)        : null,
        expiryDate:        form.expiryDate       ? new Date(form.expiryDate).toISOString() : null,
        active:            form.active,
      }
      if (isEdit) {
        await api.put(`/discounts/${item.discountId}`, body)
        toast.success('Đã cập nhật mã giảm giá')
      } else {
        await api.post('/discounts', body)
        toast.success('Đã tạo mã giảm giá mới!')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra')
    } finally { setBusy(false) }
  }

  // Preview giá trị giảm
  const previewDiscount = () => {
    if (!form.discountValue) return null
    if (form.discountType === 'PERCENTAGE') return `Giảm ${form.discountValue}%`
    return `Giảm ${new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(form.discountValue)}`
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${dStyles.modal}`} onClick={e => e.stopPropagation()}>
        <h3>{isEdit ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h3>
        <form onSubmit={handleSubmit} className={styles.modalForm}>

          {/* Mã + loại */}
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Mã giảm giá <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={form.code} onChange={set('code')}
                placeholder="VD: WELCOME10, SALE50K"
                style={{textTransform:'uppercase', fontWeight:700, letterSpacing:'.05em'}}/>
              <span style={{fontSize:'11px',color:'var(--gray-4)'}}>Mã tự động viết HOA</span>
            </div>
            <div className="form-group">
              <label className="form-label">Loại giảm giá <span style={{color:'red'}}>*</span></label>
              <select className="form-input" value={form.discountType}
                onChange={e => setForm(f => ({...f, discountType: e.target.value}))}>
                <option value="PERCENTAGE">% Phần trăm</option>
                <option value="FIXED_AMOUNT">₫ Số tiền cố định</option>
              </select>
            </div>
          </div>

          {/* Giá trị giảm */}
          <div className="form-group">
            <label className="form-label">
              Giá trị giảm <span style={{color:'red'}}>*</span>
              {form.discountType === 'PERCENTAGE' && ' (1–100)'}
            </label>
            <input className="form-input" type="number"
              value={form.discountValue} onChange={set('discountValue')}
              placeholder={form.discountType === 'PERCENTAGE' ? '10' : '50000'}
              min="0" step={form.discountType === 'PERCENTAGE' ? '1' : '1000'}/>
            {previewDiscount() && (
              <span className={dStyles.preview}>{previewDiscount()}</span>
            )}
          </div>

          {/* Điều kiện */}
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Đơn hàng tối thiểu (VNĐ)</label>
              <input className="form-input" type="number"
                value={form.minOrderAmount} onChange={set('minOrderAmount')}
                placeholder="0 = không giới hạn" min="0" step="1000"/>
            </div>
            <div className="form-group">
              <label className="form-label">Giảm tối đa (VNĐ)</label>
              <input className="form-input" type="number"
                value={form.maxDiscountAmount} onChange={set('maxDiscountAmount')}
                placeholder="Chỉ áp dụng với % giảm" min="0" step="1000"/>
            </div>
          </div>

          {/* Giới hạn */}
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Giới hạn lượt dùng</label>
              <input className="form-input" type="number"
                value={form.usageLimit} onChange={set('usageLimit')}
                placeholder="Để trống = không giới hạn" min="1"/>
            </div>
            <div className="form-group">
              <label className="form-label">Ngày hết hạn</label>
              <input className="form-input" type="date"
                value={form.expiryDate} onChange={set('expiryDate')}
                min={new Date().toISOString().substring(0,10)}/>
            </div>
          </div>

          {/* Active toggle */}
          {isEdit && (
            <label className={dStyles.activeToggle}>
              <input type="checkbox" checked={form.active}
                onChange={e => setForm(f => ({...f, active: e.target.checked}))}/>
              <span className={dStyles.toggleSwitch}/>
              <span>{form.active ? 'Đang hoạt động' : 'Đã tắt'}</span>
            </label>
          )}

          <div className={styles.modalBtns}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <span className="spinner"/> : isEdit ? 'Lưu thay đổi' : 'Tạo mã'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
