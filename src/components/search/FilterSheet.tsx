import React, { memo, useState } from 'react'
import { BottomSheet } from '../ui'

export type SearchFilters = {
  province: string
  district: string
  propertyType: string
  priceRange: string
  area: string
  officer: string
  date: string
}

type FilterSheetProps = {
  open: boolean
  value: SearchFilters
  onClose: () => void
  onApply: (filters: SearchFilters) => void
}

function FilterSheet({ open, value, onClose, onApply }: FilterSheetProps) {
  const [draft, setDraft] = useState<SearchFilters>(value)

  return (
    <BottomSheet open={open} onClose={onClose} snapPoints={[0.38, 0.72, 0.9]} initialSnap={1}>
      <div className="ais-filter-sheet">
        <div className="ais-block-title">Filter</div>
        <div className="ais-filter-grid">
          <input value={draft.province} onChange={(event) => setDraft({ ...draft, province: event.target.value })} placeholder="จังหวัด" />
          <input value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })} placeholder="อำเภอ" />
          <input value={draft.propertyType} onChange={(event) => setDraft({ ...draft, propertyType: event.target.value })} placeholder="ประเภททรัพย์" />
          <input value={draft.priceRange} onChange={(event) => setDraft({ ...draft, priceRange: event.target.value })} placeholder="ช่วงราคา" />
          <input value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })} placeholder="พื้นที่" />
          <input value={draft.officer} onChange={(event) => setDraft({ ...draft, officer: event.target.value })} placeholder="ผู้บันทึก" />
          <input value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} placeholder="วันที่" />
        </div>
        <div className="ais-inline-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="is-primary" onClick={() => onApply(draft)}>Apply</button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default memo(FilterSheet)
