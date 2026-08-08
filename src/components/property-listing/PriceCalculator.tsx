import React from 'react'
import { calculatePricePerSqWah, formatThaiNumber, parseNumericValue } from '../../utils/propertyListing'

type PriceCalculatorProps = {
  price: number
  totalLandSqWah?: number
  onChange: (price: number) => void
  error?: string
  showUnitPrice?: boolean
}

export default function PriceCalculator({ price, totalLandSqWah = 0, onChange, error, showUnitPrice = false }: PriceCalculatorProps) {
  const pricePerSqWah = calculatePricePerSqWah(price, totalLandSqWah)
  return (
    <div className="listing-price-block">
      <label className="listing-field">
        <span>ราคาเสนอขาย</span>
        <div className="listing-input-unit">
          <input
            type="text"
            inputMode="numeric"
            value={price ? formatThaiNumber(price, 0) : ''}
            onChange={(event) => onChange(parseNumericValue(event.target.value))}
            placeholder="0"
            aria-label="ราคาเสนอขาย"
          />
          <span>บาท</span>
        </div>
        {price > 0 ? <small>฿{formatThaiNumber(price, 0)}</small> : null}
        {error ? <p className="listing-error" role="alert">{error}</p> : null}
      </label>
      {showUnitPrice ? (
        <div className="listing-readonly" aria-label="ราคาต่อ ตร.ว.">
          <span>ราคาต่อ ตร.ว.</span>
          <strong>{pricePerSqWah === null ? '-' : `${formatThaiNumber(pricePerSqWah, 2)} บาท/ตร.ว.`}</strong>
          <small>คำนวณอัตโนมัติ</small>
        </div>
      ) : null}
    </div>
  )
}
