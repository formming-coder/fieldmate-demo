import React from 'react'
import { calculateLandArea, formatThaiNumber } from '../../utils/propertyListing'

type LandAreaCalculatorProps = {
  rai: number
  ngan: number
  sqWah: number
  onChange: (field: 'landRai' | 'landNgan' | 'landSqWah', value: number) => void
  optional?: boolean
  error?: string
}

export default function LandAreaCalculator({ rai, ngan, sqWah, onChange, optional = false, error }: LandAreaCalculatorProps) {
  const total = calculateLandArea(rai, ngan, sqWah)
  const fields = [
    { key: 'landRai' as const, label: 'ไร่', value: rai },
    { key: 'landNgan' as const, label: 'งาน', value: ngan },
    { key: 'landSqWah' as const, label: 'ตร.ว.', value: sqWah },
  ]

  return (
    <fieldset className="listing-fieldset">
      <legend>เนื้อที่ {optional ? <small>(ไม่บังคับ)</small> : null}</legend>
      <div className="listing-area-inputs">
        {fields.map((field) => (
          <label key={field.key}>
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={field.value || ''}
              onChange={(event) => onChange(field.key, Math.max(0, Number(event.target.value) || 0))}
              aria-label={field.label}
            />
            <span>{field.label}</span>
          </label>
        ))}
      </div>
      <div className="listing-calculation-line"><span>รวมพื้นที่</span><strong>{total > 0 ? `${formatThaiNumber(total)} ตร.ว.` : '-'}</strong></div>
      {error ? <p className="listing-error" role="alert">{error}</p> : null}
    </fieldset>
  )
}
