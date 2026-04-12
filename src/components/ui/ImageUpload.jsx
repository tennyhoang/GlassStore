/**
 * ImageUpload.jsx
 *
 * Component upload anh truc tiep len Cloudinary (unsigned upload).
 * Khong can backend xu ly file — frontend upload thang len Cloudinary API.
 *
 * Cach setup Cloudinary (mien phi):
 *   1. Dang ky tai cloudinary.com
 *   2. Dashboard → Settings → Upload → Upload presets
 *   3. Tao preset moi: Signing Mode = "Unsigned"
 *   4. Dien cloud_name va upload_preset vao cac hang CLOUD_NAME, UPLOAD_PRESET ben duoi
 *
 * Cach dung:
 *   <ImageUpload
 *     value={form.imageUrl}
 *     onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
 *   />
 */

import { useState, useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// CAU HINH CLOUDINARY — dien vao day sau khi dang ky
// ─────────────────────────────────────────────────────────────────────────────
const CLOUD_NAME    = 'doy14nwx0'     // vi du: 'dxyz1234'
const UPLOAD_PRESET = 'glassstore_unsigned'  // vi du: 'glassstore_unsigned'
// ─────────────────────────────────────────────────────────────────────────────

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function ImageUpload({ value, onChange, label = 'Anh san pham' }) {
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [error,     setError]     = useState('')
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    setError('')

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Chi chap nhan file anh (JPG, PNG, WebP)')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File qua lon — toi da 5MB')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file',           file)
      formData.append('upload_preset',  UPLOAD_PRESET)
      formData.append('folder',         'glassstore/products')

      // Dung XMLHttpRequest de theo doi tien do upload
      const url = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', CLOUDINARY_URL)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText)
            resolve(res.secure_url)
          } else {
            reject(new Error('Upload that bai'))
          }
        }

        xhr.onerror = () => reject(new Error('Loi mang'))
        xhr.send(formData)
      })

      onChange(url)
    } catch (err) {
      setError(err.message ?? 'Upload that bai, thu lai')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e) => e.preventDefault()

  const clearImage = (e) => {
    e.stopPropagation()
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      {/* Preview anh hien tai */}
      {value && !uploading && (
        <div style={{
          position: 'relative', width: '100%', aspectRatio: '4/3',
          borderRadius: 10, overflow: 'hidden', marginBottom: 10,
          border: '1.5px solid #E5E7EB', background: '#F9FAFB',
        }}>
          <img
            src={value}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <button
            type="button"
            onClick={clearImage}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', border: 'none',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Xoa anh"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: `2px dashed ${uploading ? '#60A5FA' : error ? '#FCA5A5' : '#D1D5DB'}`,
          borderRadius: 10,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: uploading ? '#EFF6FF' : '#FAFAFA',
          transition: '200ms',
        }}
      >
        {uploading ? (
          <>
            <div style={{ marginBottom: 10 }}>
              <div style={{
                width: '100%', height: 6, background: '#E5E7EB',
                borderRadius: 3, overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`, height: '100%',
                  background: '#3B82F6', borderRadius: 3,
                  transition: 'width 200ms'
                }} />
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#3B82F6', margin: 0 }}>
              Dang upload... {progress}%
            </p>
          </>
        ) : value ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Image size={16} color="#6B7280" />
            <span style={{ fontSize: 13, color: '#6B7280' }}>
              Click de thay anh moi
            </span>
          </div>
        ) : (
          <>
            <Upload size={28} color="#9CA3AF" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: '0 0 4px' }}>
              Keo tha anh vao day hoac click de chon
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              JPG, PNG, WebP — toi da 5MB
            </p>
          </>
        )}
      </div>

      {/* Input file an */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* Nhap URL thu cong */}
      <div style={{ marginTop: 8 }}>
        <input
          type="url"
          className="form-input"
          placeholder="Hoac dan URL anh truc tiep..."
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Loi */}
      {error && (
        <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{error}</p>
      )}
    </div>
  )
}