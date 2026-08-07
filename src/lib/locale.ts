export function formatThaiDate(value: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('th-TH', options || { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

export function formatThaiDateTime(value: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(
    'th-TH',
    options || { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  ).format(new Date(value))
}

export function formatThaiTime(value: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('th-TH', options || { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function formatThaiCurrency(value: number) {
  return `฿ ${new Intl.NumberFormat('th-TH').format(value)} บาท`
}
