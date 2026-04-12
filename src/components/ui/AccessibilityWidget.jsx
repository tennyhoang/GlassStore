/**
 * AccessibilityWidget.jsx
 *
 * Widget noi o goc man hinh de nguoi dung chinh:
 *   - Co chu: Binh thuong / Lon / Rat lon
 *   - Tuong phan: Binh thuong / Cao
 *
 * Luu lua chon vao localStorage de ghi nho giua cac lan vao web.
 * Apply bang data-attribute tren <html> de CSS co the hook vao.
 *
 * Cach dung: them vao App.jsx
 *   import AccessibilityWidget from './components/ui/AccessibilityWidget'
 *   // roi dat <AccessibilityWidget /> o cuoi <Routes> hoac trong layout
 */

import { useState, useEffect } from 'react'

const FONT_OPTIONS = [
  { value: 'normal', label: 'Binh thuong', icon: 'A',  iconSize: 14 },
  { value: 'large',  label: 'Chu lon',     icon: 'A',  iconSize: 18 },
  { value: 'xlarge', label: 'Chu rat lon', icon: 'A',  iconSize: 22 },
]

function loadPref(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}
function savePref(key, val) {
  try { localStorage.setItem(key, val) } catch {}
}

export default function AccessibilityWidget() {
  const [open,     setOpen]     = useState(false)
  const [fontSize, setFontSize] = useState(() => loadPref('a11y-font', 'normal'))
  const [contrast, setContrast] = useState(() => loadPref('a11y-contrast', 'normal'))

  // Apply vao <html> element moi khi thay doi
  useEffect(() => {
    document.documentElement.setAttribute('data-fontsize', fontSize)
    savePref('a11y-font', fontSize)
  }, [fontSize])

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', contrast)
    savePref('a11y-contrast', contrast)
  }, [contrast])

  // Dong khi click ra ngoai
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!e.target.closest('[data-a11y-widget]')) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const reset = () => {
    setFontSize('normal')
    setContrast('normal')
  }

  const isDefault = fontSize === 'normal' && contrast === 'normal'

  return (
    <div
      data-a11y-widget
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Tuy chinh hien thi"
          style={{
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            borderRadius: 16,
            padding: '20px 20px 16px',
            width: 260,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#111', margin: 0 }}>
              Co chu va tuong phan
            </p>
            {!isDefault && (
              <button
                onClick={reset}
                style={{
                  fontSize: 12, color: '#6B7280', background: '#F3F4F6',
                  border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer'
                }}
              >
                Dat lai
              </button>
            )}
          </div>

          {/* Font size */}
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 8, letterSpacing: '0.06em' }}>
            CO CHU
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {FONT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value)}
                aria-pressed={fontSize === opt.value}
                title={opt.label}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 4px',
                  borderRadius: 10,
                  border: fontSize === opt.value
                    ? '2px solid #1a1a2e'
                    : '1.5px solid #E5E7EB',
                  background: fontSize === opt.value ? '#1a1a2e' : '#fff',
                  cursor: 'pointer',
                  transition: '150ms',
                }}
              >
                <span style={{
                  fontSize: opt.iconSize,
                  fontWeight: 700,
                  color: fontSize === opt.value ? '#fff' : '#374151',
                  lineHeight: 1,
                }}>
                  {opt.icon}
                </span>
                <span style={{
                  fontSize: 10,
                  color: fontSize === opt.value ? '#D1D5DB' : '#9CA3AF',
                }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Contrast */}
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 8, letterSpacing: '0.06em' }}>
            TUONG PHAN
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'normal', label: 'Binh thuong', preview: ['#6B7280', '#374151'] },
              { value: 'high',   label: 'Tuong phan cao', preview: ['#111', '#000'] },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setContrast(opt.value)}
                aria-pressed={contrast === opt.value}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 8px',
                  borderRadius: 10,
                  border: contrast === opt.value
                    ? '2px solid #1a1a2e'
                    : '1.5px solid #E5E7EB',
                  background: contrast === opt.value ? '#1a1a2e' : '#fff',
                  cursor: 'pointer',
                  transition: '150ms',
                }}
              >
                {/* Preview */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {opt.preview.map((c, i) => (
                    <div key={i} style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: contrast === opt.value ? (i === 0 ? '#9CA3AF' : '#E5E7EB') : c,
                    }} />
                  ))}
                </div>
                <span style={{
                  fontSize: 11,
                  color: contrast === opt.value ? '#D1D5DB' : '#6B7280',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Mo tuy chinh hien thi"
        aria-expanded={open}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#1a1a2e',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          fontSize: 20,
          transition: '200ms',
          position: 'relative',
        }}
      >
        {/* Icon: chu A */}
        <span style={{ fontWeight: 700, fontSize: 22, lineHeight: 1 }}>A</span>

        {/* Dot bao hieu dang bat tuy chinh */}
        {!isDefault && (
          <span style={{
            position: 'absolute',
            top: 4, right: 4,
            width: 10, height: 10,
            borderRadius: '50%',
            background: '#F59E0B',
            border: '2px solid #1a1a2e',
          }} />
        )}
      </button>
    </div>
  )
}