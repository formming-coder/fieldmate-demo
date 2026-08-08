import React from 'react'
import { normalizeThaiPhone } from '../../utils/propertyListing'

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  return (
    <label className="listing-field">
      <span>เบอร์โทรผู้ขาย</span>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={(event) => onChange(normalizeThaiPhone(event.target.value))}
        placeholder="08XXXXXXXX"
      />
      <small>ใช้เพื่อการสำรวจภายในเท่านั้น</small>
      {error ? <p className="listing-error" role="alert">{error}</p> : null}
    </label>
  )
}
