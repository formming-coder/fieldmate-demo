import React from 'react'
import { ComparableProperty } from '../../types'
import { ComparableFilters } from '../../services/assessment/comparableService'

type ComparableListProps = { items: ComparableProperty[]; filters: ComparableFilters; onFilters: (filters: ComparableFilters) => void; onOpen: (item: ComparableProperty) => void }

export default function ComparableList({ items, filters, onFilters, onOpen }: ComparableListProps) {
  return (
    <section className="as-card">
      <h2>ทรัพย์เปรียบเทียบใกล้เคียง</h2>
      <div className="aa-filter-grid">
        <label><span>ประเภททรัพย์</span><select value={filters.type} onChange={(event) => onFilters({ ...filters, type: event.target.value })}><option value="">ทั้งหมด</option>{Array.from(new Set(items.map((item) => item.type))).map((type) => <option key={type}>{type}</option>)}</select></label>
        <label><span>ระยะทาง</span><select value={filters.maxDistanceKm} onChange={(event) => onFilters({ ...filters, maxDistanceKm: Number(event.target.value) })}><option value={1}>ไม่เกิน 1 กม.</option><option value={3}>ไม่เกิน 3 กม.</option><option value={5}>ไม่เกิน 5 กม.</option><option value={20}>ทั้งหมด</option></select></label>
        <label><span>พื้นที่สูงสุด</span><input type="number" value={filters.maxArea} onChange={(event) => onFilters({ ...filters, maxArea: Number(event.target.value) || 1000 })} /></label>
        <label><span>ราคาสูงสุด</span><input type="number" value={filters.maxPrice} onChange={(event) => onFilters({ ...filters, maxPrice: Number(event.target.value) || 100000000 })} /></label>
        <label><span>อายุทรัพย์</span><select value={filters.maxAgeYears} onChange={(event) => onFilters({ ...filters, maxAgeYears: Number(event.target.value) })}><option value={5}>ไม่เกิน 5 ปี</option><option value={10}>ไม่เกิน 10 ปี</option><option value={30}>ทั้งหมด</option></select></label>
        <label><span>สถานะ</span><select value={filters.status} onChange={(event) => onFilters({ ...filters, status: event.target.value })}><option value="">ทั้งหมด</option>{Array.from(new Set(items.map((item) => item.status))).map((status) => <option key={status}>{status}</option>)}</select></label>
      </div>
      <div className="aa-comparable-list">{items.map((item) => <button type="button" key={item.id} onClick={() => onOpen(item)}><img src={item.image} alt={item.title} /><div><strong>{item.title}</strong><span>{item.type} · {item.area} ตร.ม.</span><span>{item.distanceKm.toFixed(1)} กม. · คล้าย {item.similarity}%</span><span>{item.price.toLocaleString('th-TH')} บาท · {item.pricePerSqm.toLocaleString('th-TH')} บาท/ตร.ม.</span><small>อัปเดต {new Date(item.updatedAt).toLocaleDateString('th-TH')}</small></div><span className="material-symbols-rounded">chevron_right</span></button>)}</div>
      {!items.length ? <div className="aa-empty">ไม่พบทรัพย์ตามตัวกรอง</div> : null}
    </section>
  )
}