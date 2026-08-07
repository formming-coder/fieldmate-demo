import React, { useState } from 'react'
import Layout from '../components/Layout'

export default function AISearch(){
  const [query,setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  const run = () => {
    setResults([{id:'r1', text:`ผลลัพธ์สำหรับ: ${query}`}])
  }

  return (
    <Layout title="ค้นหาข้อมูล">
      <div style={{display:'grid', gap:12}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาจังหวัด อำเภอ ถนน หมู่บ้าน โครงการ เบอร์โทร ราคา หรือชื่อผู้สำรวจ" style={{padding:12, borderRadius:10, border:'1px solid #eee'}} />
        <div style={{display:'flex', gap:8}}>
          <button onClick={run} style={{background:'var(--krungsri)', padding:10, borderRadius:10, border:'none'}}>ค้นหา</button>
        </div>

        <div style={{display:'grid', gap:8}}>
          {results.map(r => (
            <div key={r.id} style={{padding:10, borderRadius:10, background:'var(--card)'}}>{r.text}</div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
