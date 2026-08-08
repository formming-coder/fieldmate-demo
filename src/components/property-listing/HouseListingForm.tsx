import React from 'react'
import { ListingDraftInput } from '../../utils/propertyListing'
import LandAreaCalculator from './LandAreaCalculator'
import PhoneInput from './PhoneInput'
import PriceCalculator from './PriceCalculator'
import PropertyNotes from './PropertyNotes'

type HouseListingFormProps = {
  value: ListingDraftInput
  errors: Record<string, string>
  onChange: (patch: Partial<ListingDraftInput>) => void
}

const countFields = [
  { key: 'floors' as const, label: 'จำนวนชั้น' },
  { key: 'bedrooms' as const, label: 'ห้องนอน' },
  { key: 'bathrooms' as const, label: 'ห้องน้ำ' },
]

export default function HouseListingForm({ value, errors, onChange }: HouseListingFormProps) {
  return (
    <section className="listing-card">
      <h2>ข้อมูลประกาศขาย</h2>
      <div className="listing-count-grid">
        {countFields.map((field) => (
          <label className="listing-field" key={field.key}>
            <span>{field.label}</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={value[field.key] ?? ''}
              onChange={(event) => onChange({ [field.key]: event.target.value === '' ? null : Math.max(0, Number(event.target.value)) })}
            />
          </label>
        ))}
      </div>
      <PriceCalculator price={value.price} onChange={(price) => onChange({ price })} error={errors.price} />
      <label className="listing-field">
        <span>พื้นที่ใช้สอย</span>
        <div className="listing-input-unit">
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={value.usableAreaSqm ?? ''}
            onChange={(event) => onChange({ usableAreaSqm: event.target.value === '' ? null : Math.max(0, Number(event.target.value)) })}
            aria-label="พื้นที่ใช้สอย"
          />
          <span>ตร.ม.</span>
        </div>
        {errors.usableArea ? <p className="listing-error" role="alert">{errors.usableArea}</p> : null}
      </label>
      <LandAreaCalculator
        rai={value.landRai}
        ngan={value.landNgan}
        sqWah={value.landSqWah}
        onChange={(field, next) => onChange({ [field]: next })}
        optional
      />
      <PhoneInput value={value.phone} onChange={(phone) => onChange({ phone })} error={errors.phone} />
      <PropertyNotes value={value.notes} onChange={(notes) => onChange({ notes })} />
    </section>
  )
}
