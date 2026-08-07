import React from 'react'
import Layout from '../components/Layout'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import s from './Dashboard.module.css'

export default function PropertyAlbum(){
  const { data: items = [] } = usePropertiesQuery()

  return (
    <Layout title="อัลบั้มทรัพย์สิน">
      <div style={{display:'grid', gap:12}}>
        <div style={{display:'flex', gap:8}}>
          <input placeholder="ค้นหาจังหวัด อำเภอ ถนน หมู่บ้าน โครงการ เบอร์โทร ราคา หรือชื่อผู้สำรวจ" style={{flex:1, padding:10, borderRadius:10, border:'1px solid #eee'}} />
        </div>

        <div style={{display:'grid', gap:10}}>
          {items.map(p => (
            <div key={p.id} style={{display:'flex', gap:12, alignItems:'center', padding:10, borderRadius:10, background:'var(--card)'}}>
              <div style={{width:96, height:68, borderRadius:8, backgroundImage: p.images?.[0] ? `url(${p.images[0]})` : undefined, backgroundSize:'cover', backgroundPosition:'center'}} />
              <div>
                <div style={{fontWeight:700}}>{p.owner}</div>
                <div style={{color:'var(--muted)'}}>{p.province} • {new Date(p.lastInspection).toLocaleDateString('th-TH')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
