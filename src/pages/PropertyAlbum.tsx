import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { usePropertiesQuery } from '../hooks/useBackendQueries'

export default function PropertyAlbum() {
  const navigate = useNavigate()
  const { data: items = [] } = usePropertiesQuery()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) => [item.owner, item.province, item.address, item.type || '', item.sellerPhone || ''].join(' ').toLowerCase().includes(needle))
  }, [items, query])

  return (
    <Layout title="รายการทรัพย์">
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <button type="button" style={{ border: 'none', borderRadius: 16, padding: 14, background: 'var(--krungsri)', color: '#fff', fontWeight: 800 }} onClick={() => navigate('/camera')}>
            บันทึกทรัพย์ใหม่
          </button>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาเจ้าของ จังหวัด ที่อยู่ เบอร์โทร หรือประเภท"
            style={{ width: '100%', padding: 12, borderRadius: 14, border: '1px solid rgba(17,24,39,0.08)', background: '#fff' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map((property) => (
            <button
              key={property.id}
              type="button"
              onClick={() => navigate(`/property/${property.id}`)}
              style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 16, border: '1px solid rgba(17,24,39,0.08)', background: '#fff', textAlign: 'left' }}
            >
              <div
                style={{
                  width: 88,
                  height: 68,
                  borderRadius: 12,
                  backgroundImage: property.images?.[0] ? `url(${property.images[0]})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flex: '0 0 auto',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>{property.owner}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{property.type || 'ยังไม่ระบุประเภท'} • {property.province}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>{property.sellerPhone || 'ยังไม่ระบุเบอร์'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
