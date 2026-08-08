import React, { useEffect, useMemo, useState } from 'react'
import { ListingPropertyType, PropertyListingForm as PropertyListingData } from '../../types'
import { createPropertyListing, isValidThaiPhone, ListingDraftInput } from '../../utils/propertyListing'
import HouseListingForm from './HouseListingForm'
import LandListingForm from './LandListingForm'

const typeIcons: Record<ListingPropertyType, string> = {
  ที่ดิน: 'landscape',
  บ้านเดี่ยว: 'home',
  บ้านแฝด: 'house',
  ทาวน์เฮ้าส์: 'holiday_village',
  ตึกแถว: 'apartment',
}

type PropertyListingFormProps = {
  initialValue: ListingDraftInput
  draftKey: string
  onBack: () => void
  onCancel: () => void
  onSave: (listing: PropertyListingData) => Promise<boolean>
}

function readDraft(key: string, fallback: ListingDraftInput) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const restored = JSON.parse(raw) as ListingDraftInput
    return restored.propertyId === fallback.propertyId && restored.surveyId === fallback.surveyId ? restored : fallback
  } catch {
    return fallback
  }
}

export default function PropertyListingForm({ initialValue, draftKey, onBack, onCancel, onSave }: PropertyListingFormProps) {
  const [value, setValue] = useState<ListingDraftInput>(() => readDraft(draftKey, initialValue))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const isLand = value.propertyType === 'ที่ดิน'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(value))
        setSaveMessage('บันทึกแบบร่างแล้ว')
      } catch {
        setSaveMessage('ไม่สามารถบันทึกแบบร่างอัตโนมัติได้')
      }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [draftKey, value])

  const selectedLabel = useMemo(() => `${value.propertyType}`, [value.propertyType])
  const update = (patch: Partial<ListingDraftInput>) => {
    setValue((current) => ({ ...current, ...patch }))
    setErrors({})
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (isLand && value.landRai * 400 + value.landNgan * 100 + value.landSqWah <= 0) nextErrors.land = 'กรุณาระบุเนื้อที่'
    if (value.price <= 0) nextErrors.price = 'กรุณาระบุราคาเสนอขาย'
    if (!isLand && (!value.usableAreaSqm || value.usableAreaSqm <= 0)) nextErrors.usableArea = 'กรุณาระบุพื้นที่'
    if (!isValidThaiPhone(value.phone)) nextErrors.phone = 'กรุณาตรวจสอบเบอร์โทรผู้ขาย'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    const listing = createPropertyListing(value)
    if (await onSave(listing)) window.localStorage.removeItem(draftKey)
  }

  return (
    <section className="listing-form-page">
      <header className="listing-header">
        <button type="button" onClick={onBack} aria-label="ย้อนกลับ"><span className="material-symbols-rounded">arrow_back</span></button>
        <div><h1>{isLand ? 'ข้อมูลประกาศขายที่ดิน' : 'ข้อมูลประกาศขาย'}</h1><p>{value.propertyId}</p></div>
      </header>
      <main className="listing-form-scroll">
        <div className="listing-selected-type"><span className="material-symbols-rounded">{typeIcons[value.propertyType]}</span><div><small>ประเภททรัพย์</small><strong>{selectedLabel}</strong></div><button type="button" onClick={onBack}>เปลี่ยน</button></div>
        {isLand
          ? <LandListingForm value={value} errors={errors} onChange={update} />
          : <HouseListingForm value={value} errors={errors} onChange={update} />}
        <p className="listing-autosave" role="status">{saveMessage}</p>
      </main>
      <nav className="listing-action-bar" aria-label="การทำงานแบบฟอร์ม">
        <button type="button" onClick={() => setConfirmCancel(true)}>ยกเลิก</button>
        <button type="button" className="primary" onClick={() => void submit()}>บันทึกข้อมูล</button>
      </nav>
      {confirmCancel ? (
        <div className="listing-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="listing-cancel-title">
          <div><h2 id="listing-cancel-title">ต้องการยกเลิกข้อมูลที่กรอกหรือไม่?</h2><p>แบบร่างจะยังเก็บไว้จนกว่าคุณจะออกจากแบบฟอร์ม</p><div><button type="button" onClick={() => setConfirmCancel(false)}>ยกเลิก</button><button type="button" className="danger" onClick={() => { window.localStorage.removeItem(draftKey); onCancel() }}>ออกจากแบบฟอร์ม</button></div></div>
        </div>
      ) : null}
    </section>
  )
}
