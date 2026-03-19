import { useState, useEffect, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { productApi } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import styles from './ShopPage.module.css'

const TABS = [
  { key: 'frames', label: 'Gọng kính' },
  { key: 'lenses', label: 'Tròng kính' },
  { key: 'ready',  label: 'Kính làm sẵn' },
]

function fmt(n) {
  return n ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—'
}

export default function ShopPage() {
  const [tab,      setTab]      = useState('frames')
  const [frames,   setFrames]   = useState([])
  const [lenses,   setLenses]   = useState([])
  const [ready,    setReady]    = useState([])
  const [loading,  setLoading]  = useState(true)

  // Search & Filter state
  const [search,    setSearch]    = useState('')
  const [sortBy,    setSortBy]    = useState('default')
  const [filterBrand,  setFilterBrand]  = useState('')
  const [filterColor,  setFilterColor]  = useState('')
  const [filterMat,    setFilterMat]    = useState('')
  const [filterType,   setFilterType]   = useState('')
  const [priceMin,     setPriceMin]     = useState('')
  const [priceMax,     setPriceMax]     = useState('')
  const [showFilter,   setShowFilter]   = useState(false)

  useEffect(() => {
    setLoading(true)
    // Reset filter khi đổi tab
    setSearch('')
    setFilterBrand(''); setFilterColor('')
    setFilterMat(''); setFilterType(''); setPriceMin(''); setPriceMax('')
    const fetchers = {
      frames: () => productApi.getFrames().then(r => setFrames(r.data.data ?? [])),
      lenses: () => productApi.getLenses().then(r => setLenses(r.data.data ?? [])),
      ready:  () => productApi.getReadyMade().then(r => setReady(r.data.data ?? [])),
    }
    fetchers[tab]?.().finally(() => setLoading(false))
  }, [tab])

  const rawItems = tab === 'frames' ? frames : tab === 'lenses' ? lenses : ready

  // ── Lấy options cho filter dropdown ──
  const brands  = [...new Set(rawItems.map(i => i.brand).filter(Boolean))]
  const colors  = [...new Set(frames.map(i => i.color).filter(Boolean))]
  const mats    = [...new Set(rawItems.map(i => i.material).filter(Boolean))]
  const types   = [...new Set(lenses.map(i => i.lensType).filter(Boolean))]

  // ── Áp dụng search + filter + sort ──
  const filtered = useMemo(() => {
    let result = [...rawItems]

    // Search theo tên / brand
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.brand?.toLowerCase().includes(q) ||
        i.material?.toLowerCase().includes(q) ||
        i.color?.toLowerCase().includes(q)
      )
    }

    // Filter brand
    if (filterBrand) result = result.filter(i => i.brand === filterBrand)
    // Filter color (chỉ frames)
    if (filterColor) result = result.filter(i => i.color === filterColor)
    // Filter material
    if (filterMat)   result = result.filter(i => i.material === filterMat)
    // Filter lens type
    if (filterType)  result = result.filter(i => i.lensType === filterType)
    // Filter giá
    if (priceMin) result = result.filter(i => (i.price ?? 0) >= Number(priceMin))
    if (priceMax) result = result.filter(i => (i.price ?? 0) <= Number(priceMax))

    // Sort
    if (sortBy === 'price_asc')  result.sort((a,b) => (a.price??0) - (b.price??0))
    if (sortBy === 'price_desc') result.sort((a,b) => (b.price??0) - (a.price??0))
    if (sortBy === 'name_asc')   result.sort((a,b) => a.name?.localeCompare(b.name))

    return result
  }, [rawItems, search, filterBrand, filterColor, filterMat, filterType, priceMin, priceMax, sortBy])

  const hasFilter = search || filterBrand || filterColor || filterMat || filterType || priceMin || priceMax

  const clearAll = () => {
    setSearch('')
    setFilterBrand(''); setFilterColor('')
    setFilterMat(''); setFilterType(''); setPriceMin(''); setPriceMax('')
    setSortBy('default')
  }

  return (
    <div className="page-enter">
      <div className={styles.header}>
        <div className="container">
          <h1>Cửa hàng</h1>
          <p>Khám phá bộ sưu tập kính mắt cao cấp</p>
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

        {/* Search + Filter bar */}
        <div className={styles.toolbar}>
          {/* Search box */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon}/>
            <input
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Tìm kiếm ${tab === 'frames' ? 'gọng kính' : tab === 'lenses' ? 'tròng kính' : 'kính làm sẵn'}...`}
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>
                <X size={14}/>
              </button>
            )}
          </div>

          {/* Sort */}
          <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="default">Mặc định</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
            <option value="name_asc">Tên A → Z</option>
          </select>

          {/* Filter toggle */}
          <button
            className={`${styles.filterBtn} ${showFilter ? styles.filterBtnActive : ''}`}
            onClick={() => setShowFilter(s => !s)}>
            <SlidersHorizontal size={16}/>
            Lọc
            {hasFilter && <span className={styles.filterDot}/>}
          </button>

          {/* Clear all */}
          {hasFilter && (
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>
              <X size={14}/> Xoá lọc
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className={styles.filterPanel}>
            {/* Giá */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>Khoảng giá (VNĐ)</p>
              <div className={styles.priceRange}>
                <input className="form-input" type="number" placeholder="Từ"
                  value={priceMin} onChange={e => setPriceMin(e.target.value)}/>
                <span>—</span>
                <input className="form-input" type="number" placeholder="Đến"
                  value={priceMax} onChange={e => setPriceMax(e.target.value)}/>
              </div>
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>Thương hiệu</p>
                <div className={styles.filterChips}>
                  {brands.map(b => (
                    <button key={b}
                      className={`${styles.chip} ${filterBrand === b ? styles.chipActive : ''}`}
                      onClick={() => setFilterBrand(filterBrand === b ? '' : b)}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color — chỉ frames */}
            {tab === 'frames' && colors.length > 0 && (
              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>Màu sắc</p>
                <div className={styles.filterChips}>
                  {colors.map(c => (
                    <button key={c}
                      className={`${styles.chip} ${filterColor === c ? styles.chipActive : ''}`}
                      onClick={() => setFilterColor(filterColor === c ? '' : c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material */}
            {mats.length > 0 && (
              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>Chất liệu</p>
                <div className={styles.filterChips}>
                  {mats.map(m => (
                    <button key={m}
                      className={`${styles.chip} ${filterMat === m ? styles.chipActive : ''}`}
                      onClick={() => setFilterMat(filterMat === m ? '' : m)}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lens type — chỉ lenses */}
            {tab === 'lenses' && types.length > 0 && (
              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>Loại tròng</p>
                <div className={styles.filterChips}>
                  {types.map(t => (
                    <button key={t}
                      className={`${styles.chip} ${filterType === t ? styles.chipActive : ''}`}
                      onClick={() => setFilterType(filterType === t ? '' : t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kết quả */}
        <div className={styles.resultBar}>
          <span>{filtered.length} sản phẩm{hasFilter ? ' (đã lọc)' : ''}</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Search size={40} strokeWidth={1}/>
            <p>Không tìm thấy sản phẩm phù hợp</p>
            <button className="btn btn-outline btn-sm" onClick={clearAll}>Xoá bộ lọc</button>
          </div>
        ) : tab === 'lenses' ? (
          <div className={styles.lensGrid}>
            {filtered.map(lens => (
              <div key={lens.lensId} className={styles.lensCard}>
                <div className={styles.lensInfo}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                    <span className="badge badge-blue">{lens.lensType}</span>
                    <span style={{fontSize:'11px',color:'var(--gray-4)',fontWeight:600}}>ID: {lens.lensId}</span>
                  </div>
                  <h4>{lens.name}</h4>
                  <p>{lens.material} · Index {lens.indexValue}</p>
                </div>
                <div className={styles.lensOptions}>
                  {lens.options?.map(o => (
                    <span key={o.optionId} className={styles.optionChip}>
                      {o.optionName} +{fmt(o.extraPrice)}
                    </span>
                  ))}
                </div>
                <p className={styles.lensPrice}>{fmt(lens.price)}</p>
              </div>
            ))}
          </div>
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
  )
}