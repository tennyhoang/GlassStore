import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { productApi } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import styles from './ShopPage.module.css'
import { fmtCurrency } from '../utils/format'

const TABS = [
  { key: 'frames', label: 'Gong kinh' },
  { key: 'lenses', label: 'Trong kinh' },
  { key: 'ready',  label: 'Kinh lam san' },
]

const SORT_OPTIONS = [
  { value: 'default',    label: 'Mac dinh' },
  { value: 'price_asc',  label: 'Gia thap -> cao' },
  { value: 'price_desc', label: 'Gia cao -> thap' },
  { value: 'name_asc',   label: 'Ten A -> Z' },
  { value: 'stock_desc', label: 'Con nhieu hang' },
]

// Icon hinh dang gong
const SHAPE_ICONS = {
  'Oval':      '⬭',
  'Rectangle': '⬜',
  'Round':     '⭕',
  'Square':    '🔲',
  'Cat Eye':   '🐱',
  'Aviator':   '🔻',
  'Browline':  '🔰',
  'Wayframe':  '🔲',
}

// FilterGroup co the collapse
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '0.5px solid #F3F4F6', paddingBottom: 16, marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '0 0 10px', fontSize: 13, fontWeight: 700,
          color: '#374151', letterSpacing: '0.03em'
        }}
      >
        {title.toUpperCase()}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && children}
    </div>
  )
}

// Chip chon filter
function Chip({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 20,
        border: active ? '2px solid #1a1a2e' : '1.5px solid #E5E7EB',
        background: active ? '#1a1a2e' : '#fff',
        color: active ? '#fff' : '#374151',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        transition: '150ms', margin: '0 4px 6px 0',
        minHeight: 36,
      }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {label}
    </button>
  )
}

export default function ShopPage() {
  const [tab,     setTab]     = useState('frames')
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [meta,    setMeta]    = useState({ brands: [], shapes: [], materials: [], colors: [] })
  const [showSidebar, setShowSidebar] = useState(true)

  // Filter state
  const [search,   setSearch]   = useState('')
  const [sortBy,   setSortBy]   = useState('default')
  const [brand,    setBrand]    = useState('')
  const [shape,    setShape]    = useState('')
  const [material, setMaterial] = useState('')
  const [color,    setColor]    = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  // Load du lieu khi doi tab
  useEffect(() => {
    setLoading(true)
    resetFilters()
    const fetchers = {
      frames: () => Promise.all([
        productApi.getFrames().then(r => setItems(r.data.data ?? [])),
        productApi.getFramesMeta()
          .then(r => setMeta(r.data.data ?? { brands: [], shapes: [], materials: [], colors: [] }))
          .catch(() => {}),
      ]),
      lenses: () => productApi.getLenses().then(r => setItems(r.data.data ?? [])),
      ready:  () => productApi.getReadyMade().then(r => setItems(r.data.data ?? [])),
    }
    fetchers[tab]?.().finally(() => setLoading(false))
  }, [tab])

  // Lay distinct values tu data neu metadata API chua ready
  const brands    = meta.brands.length    ? meta.brands    : [...new Set(items.map(i => i.brand).filter(Boolean))].sort()
  const shapes    = meta.shapes.length    ? meta.shapes    : [...new Set(items.map(i => i.shape).filter(Boolean))].sort()
  const materials = meta.materials.length ? meta.materials : [...new Set(items.map(i => i.material).filter(Boolean))].sort()
  const colors    = meta.colors.length    ? meta.colors    : [...new Set(items.map(i => i.color).filter(Boolean))].sort()
  const lensTypes = [...new Set(items.map(i => i.lensType).filter(Boolean))].sort()

  const resetFilters = useCallback(() => {
    setSearch(''); setSortBy('default')
    setBrand(''); setShape(''); setMaterial(''); setColor('')
    setPriceMin(''); setPriceMax(''); setInStockOnly(false)
  }, [])

  const hasFilter = search || brand || shape || material || color
    || priceMin || priceMax || inStockOnly || sortBy !== 'default'

  // Apply filter + sort client-side
  const filtered = useMemo(() => {
    let result = [...items]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.brand?.toLowerCase().includes(q) ||
        i.material?.toLowerCase().includes(q) ||
        i.color?.toLowerCase().includes(q) ||
        i.shape?.toLowerCase().includes(q)
      )
    }
    if (brand)    result = result.filter(i => i.brand    === brand)
    if (shape)    result = result.filter(i => i.shape    === shape)
    if (material) result = result.filter(i => i.material === material)
    if (color)    result = result.filter(i => i.color    === color)
    if (priceMin) result = result.filter(i => (i.price ?? 0) >= Number(priceMin))
    if (priceMax) result = result.filter(i => (i.price ?? 0) <= Number(priceMax))
    if (inStockOnly) result = result.filter(i => (i.stockQuantity ?? 0) > 0 && i.status !== 'OUT_OF_STOCK')

    if (sortBy === 'price_asc')  result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sortBy === 'price_desc') result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    if (sortBy === 'name_asc')   result.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    if (sortBy === 'stock_desc') result.sort((a, b) => (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0))

    return result
  }, [items, search, brand, shape, material, color, priceMin, priceMax, inStockOnly, sortBy])

  // ── Sidebar filter ───────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside style={{
      width: 220, flexShrink: 0,
      display: showSidebar ? 'block' : 'none',
    }}>
      <div style={{
        background: '#fff', border: '1.5px solid #E5E7EB',
        borderRadius: 14, padding: '18px 16px',
        position: 'sticky', top: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>Bo loc</span>
          {hasFilter && (
            <button onClick={resetFilters} style={{
              fontSize: 12, color: '#6B7280', background: '#F3F4F6',
              border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer'
            }}>
              Xoa het
            </button>
          )}
        </div>

        {/* Khoang gia */}
        <FilterGroup title="Khoang gia">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="number" placeholder="Tu (VND)"
              value={priceMin} onChange={e => setPriceMin(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8,
                border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none'
              }}
            />
            <input
              type="number" placeholder="Den (VND)"
              value={priceMax} onChange={e => setPriceMax(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8,
                border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none'
              }}
            />
            {/* Quick price ranges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {[
                ['< 1M',   '',          '1000000'],
                ['1-3M',   '1000000',   '3000000'],
                ['3-5M',   '3000000',   '5000000'],
                ['> 5M',   '5000000',   ''],
              ].map(([label, min, max]) => (
                <button
                  key={label}
                  onClick={() => { setPriceMin(min); setPriceMax(max) }}
                  style={{
                    padding: '4px 10px', fontSize: 12, borderRadius: 6,
                    border: '1px solid #E5E7EB', background: '#F9FAFB',
                    cursor: 'pointer', color: '#374151'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </FilterGroup>

        {/* Con hang */}
        <FilterGroup title="Tinh trang">
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', fontSize: 14, color: '#374151',
            padding: '4px 0'
          }}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#1a1a2e' }}
            />
            Chi hien con hang
          </label>
        </FilterGroup>

        {/* Thuong hieu */}
        {brands.length > 0 && (
          <FilterGroup title="Thuong hieu">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {brands.map(b => (
                <Chip key={b} label={b} active={brand === b}
                  onClick={() => setBrand(brand === b ? '' : b)} />
              ))}
            </div>
          </FilterGroup>
        )}

        {/* Hinh dang gong (chi frames) */}
        {tab === 'frames' && shapes.length > 0 && (
          <FilterGroup title="Hinh dang gong">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {shapes.map(s => (
                <Chip key={s} label={s} active={shape === s}
                  icon={SHAPE_ICONS[s]}
                  onClick={() => setShape(shape === s ? '' : s)} />
              ))}
            </div>
          </FilterGroup>
        )}

        {/* Chat lieu */}
        {materials.length > 0 && (
          <FilterGroup title="Chat lieu">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {materials.map(m => (
                <Chip key={m} label={m} active={material === m}
                  onClick={() => setMaterial(material === m ? '' : m)} />
              ))}
            </div>
          </FilterGroup>
        )}

        {/* Mau sac (chi frames) */}
        {tab === 'frames' && colors.length > 0 && (
          <FilterGroup title="Mau sac" defaultOpen={false}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {colors.map(c => (
                <Chip key={c} label={c} active={color === c}
                  onClick={() => setColor(color === c ? '' : c)} />
              ))}
            </div>
          </FilterGroup>
        )}

        {/* Loai trong (chi lenses) */}
        {tab === 'lenses' && lensTypes.length > 0 && (
          <FilterGroup title="Loai trong">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {lensTypes.map(t => (
                <Chip key={t} label={t} active={material === t}
                  onClick={() => setMaterial(material === t ? '' : t)} />
              ))}
            </div>
          </FilterGroup>
        )}
      </div>
    </aside>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Cua hang</h1>
          <p>Kham pha bo suu tap kinh mat cao cap</p>
        </div>
      </div>

      <div className="container section">
        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Toggle sidebar */}
          <button
            onClick={() => setShowSidebar(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', minHeight: 44,
              border: '1.5px solid #E5E7EB', borderRadius: 10,
              background: showSidebar ? '#1a1a2e' : '#fff',
              color: showSidebar ? '#fff' : '#374151',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: '150ms', flexShrink: 0,
            }}
          >
            <SlidersHorizontal size={16} />
            Bo loc
            {hasFilter && (
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#F59E0B', display: 'inline-block',
              }} />
            )}
          </button>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none'
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Tim kiem ${tab === 'frames' ? 'gong kinh' : tab === 'lenses' ? 'trong kinh' : 'kinh lam san'}...`}
              style={{
                width: '100%', padding: '10px 36px', minHeight: 44,
                border: '1.5px solid #E5E7EB', borderRadius: 10,
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: '#9CA3AF', padding: 4,
              }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '10px 14px', minHeight: 44,
              border: '1.5px solid #E5E7EB', borderRadius: 10,
              fontSize: 14, background: '#fff', color: '#374151',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasFilter && (
            <button onClick={resetFilters} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', minHeight: 44,
              border: '1.5px solid #E5E7EB', borderRadius: 10,
              background: 'none', color: '#6B7280', fontSize: 14, cursor: 'pointer',
              flexShrink: 0,
            }}>
              <X size={14} /> Xoa loc
            </button>
          )}
        </div>

        {/* Active filter pills */}
        {hasFilter && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {brand    && <span style={pillStyle}>{brand} <button style={pillX} onClick={() => setBrand('')}>×</button></span>}
            {shape    && <span style={pillStyle}>{shape} <button style={pillX} onClick={() => setShape('')}>×</button></span>}
            {material && <span style={pillStyle}>{material} <button style={pillX} onClick={() => setMaterial('')}>×</button></span>}
            {color    && <span style={pillStyle}>{color} <button style={pillX} onClick={() => setColor('')}>×</button></span>}
            {priceMin && <span style={pillStyle}>Tu {fmtCurrency(Number(priceMin))} <button style={pillX} onClick={() => setPriceMin('')}>×</button></span>}
            {priceMax && <span style={pillStyle}>Den {fmtCurrency(Number(priceMax))} <button style={pillX} onClick={() => setPriceMax('')}>×</button></span>}
            {inStockOnly && <span style={pillStyle}>Con hang <button style={pillX} onClick={() => setInStockOnly(false)}>×</button></span>}
            {search   && <span style={pillStyle}>"{search}" <button style={pillX} onClick={() => setSearch('')}>×</button></span>}
          </div>
        )}

        {/* Result count */}
        <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 20 }}>
          {loading ? 'Dang tai...' : `Tim thay ${filtered.length} san pham`}
        </p>

        {/* Body: sidebar + grid */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <Sidebar />

          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div className={styles.grid}>
                {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <Search size={44} strokeWidth={1} />
                <p style={{ fontSize: 16, marginTop: 12 }}>Khong tim thay san pham phu hop</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={resetFilters}>
                  Xoa bo loc
                </button>
              </div>
            ) : tab === 'lenses' ? (
              <LensGrid items={filtered} />
            ) : (
              <div className={styles.grid}>
                {filtered.map(item => (
                  <ProductCard
                    key={item.frameId ?? item.productId}
                    item={item}
                    type={tab === 'ready' ? 'ready' : 'frame'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Pill styles ───────────────────────────────────────────────────────────────
const pillStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '4px 12px', borderRadius: 20, fontSize: 13,
  background: '#1a1a2e', color: '#fff', fontWeight: 500,
}
const pillX = {
  background: 'none', border: 'none', color: '#9CA3AF',
  cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0,
}

// ── Lens grid ─────────────────────────────────────────────────────────────────
function LensGrid({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(lens => (
        <div key={lens.lensId} style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto',
          alignItems: 'center', gap: 20, padding: '18px 22px',
          background: '#fff', border: '1.5px solid #E5E7EB',
          borderRadius: 14, transition: '150ms',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 12, padding: '2px 10px', borderRadius: 20,
                background: '#DBEAFE', color: '#1D4ED8', fontWeight: 600
              }}>{lens.lensType}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {lens.lensId}</span>
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#111' }}>{lens.name}</h4>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
              {lens.material} · Index {lens.indexValue}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 260 }}>
            {lens.options?.map(o => (
              <span key={o.optionId} style={{
                padding: '4px 10px', background: '#F9FAFB',
                borderRadius: 20, fontSize: 12, color: '#374151',
                border: '1px solid #E5E7EB'
              }}>
                {o.optionName} +{fmtCurrency(o.extraPrice)}
              </span>
            ))}
          </div>
          <p style={{
            fontSize: '1.15rem', fontFamily: 'var(--font-display)',
            fontWeight: 600, color: '#111', whiteSpace: 'nowrap'
          }}>
            {fmtCurrency(lens.price)}
          </p>
        </div>
      ))}
    </div>
  )
}