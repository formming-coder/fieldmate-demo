import React from 'react'
import Layout from '../components/Layout'
import { usePropertiesQuery } from '../hooks/useBackendQueries'

export default function AISummary(){
  const { data: props = [] } = usePropertiesQuery()

  return (
    <Layout title="สรุปข้อมูล AI">
      <div style={{display:'grid', gap:12}}>
        {props.map(p => (
          <div key={p.id} style={{padding:12, borderRadius:12, background:'var(--card)'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div style={{fontWeight:700}}>{p.owner}</div>
              <div style={{color:'var(--muted)'}}>{p.province}</div>
            </div>
            <div style={{marginTop:8}}>
              <div><strong>OCR:</strong> ที่อยู่: เขตบางนา กรุงเทพมหานคร</div>
              <div><strong>ประเภทที่ตรวจพบ:</strong> ที่พักอาศัย</div>
              <div><strong>สภาพ:</strong> ดี</div>
              <div><strong>คำแนะนำ:</strong> ตรวจหลังคาและระบบระบายน้ำ</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
