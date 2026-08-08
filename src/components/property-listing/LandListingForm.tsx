import React from 'react'
import { ListingDraftInput } from '../../utils/propertyListing'
import LandAreaCalculator from './LandAreaCalculator'
import PhoneInput from './PhoneInput'
import PriceCalculator from './PriceCalculator'
import PropertyNotes from './PropertyNotes'

type LandListingFormProps = {
  value: ListingDraftInput
  errors: Record<string, string>
  onChange: (patch: Partial<ListingDraftInput>) => void
}

export default function LandListingForm({ value, errors, onChange }: LandListingFormProps) {
  const total = value.landRai * 400 + value.landNgan * 100 + value.landSqWah
  return (
    <section className="listing-card">
      <h2>ข้อมูลประกาศขายที่ดิน</h2>
      <LandAreaCalculator
        rai={value.landRai}
        ngan={value.landNgan}
        sqWah={value.landSqWah}
        onChange={(field, next) => onChange({ [field]: next })}
        error={errors.land}
      />
      <PriceCalculator price={value.price} totalLandSqWah={total} onChange={(price) => onChange({ price })} error={errors.price} showUnitPrice />
      <PhoneInput value={value.phone} onChange={(phone) => onChange({ phone })} error={errors.phone} />
      <PropertyNotes value={value.notes} onChange={(notes) => onChange({ notes })} />
    </section>
  )
}
