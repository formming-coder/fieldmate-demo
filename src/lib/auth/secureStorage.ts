const PREFIX = 'fmsec:'

function encode(raw: string) {
  if (typeof window === 'undefined') return raw
  return PREFIX + window.btoa(unescape(encodeURIComponent(raw)))
}

function decode(raw: string) {
  if (!raw) return ''
  if (!raw.startsWith(PREFIX)) return raw

  try {
    return decodeURIComponent(escape(window.atob(raw.slice(PREFIX.length))))
  } catch {
    return ''
  }
}

export const secureStorage = {
  get(key: string) {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return decode(raw)
  },
  set(key: string, value: string) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, encode(value))
  },
  remove(key: string) {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  },
}
