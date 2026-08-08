import { ComparableProperty, Property } from '../../types'

export type ComparableFilters = {
  type: string
  maxDistanceKm: number
  minArea: number
  maxArea: number
  minPrice: number
  maxPrice: number
  maxAgeYears: number
  status: string
}

function distanceKm(from: Property, to: Property) {
  const radians = (value: number) => value * Math.PI / 180
  const latitude = radians(to.latitude - from.latitude)
  const longitude = radians(to.longitude - from.longitude)
  const value = Math.sin(latitude / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitude / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

function buildComparable(target: Property, property: Property, index: number): ComparableProperty {
  const area = 85 + ((index * 37 + property.id.length * 11) % 210)
  const distance = Math.max(0.2, distanceKm(target, property))
  const typeMatch = (property.type || '') === (target.type || '')
  const priceDifference = Math.abs(property.marketPrice - target.marketPrice) / Math.max(1, target.marketPrice)
  const similarity = Math.max(58, Math.min(98, Math.round(98 - distance * 5 - priceDifference * 25 - (typeMatch ? 0 : 9))))
  return {
    id: `comparable-${property.id}-${index}`,
    propertyId: property.id,
    title: `${property.owner} ${property.province}`,
    image: property.images[0] || target.images[0] || '',
    type: property.type || 'ทรัพย์สิน',
    area,
    price: property.marketPrice,
    pricePerSqm: Math.round(property.marketPrice / area),
    distanceKm: Number(distance.toFixed(2)),
    similarity,
    updatedAt: property.lastInspection,
    ageYears: 2 + ((index * 3) % 18),
    status: property.status || 'ประกาศขาย',
    selected: index < 4,
  }
}

export const comparableService = {
  findNearby(target: Property, properties: Property[]) {
    const source = properties.filter((property) => property.id !== target.id)
    const expanded = [...source]
    while (expanded.length < 10 && source.length) expanded.push({ ...source[expanded.length % source.length], id: `${source[expanded.length % source.length].id}-demo-${expanded.length}` })
    return expanded.map((property, index) => buildComparable(target, property, index)).sort((a, b) => b.similarity - a.similarity).slice(0, 12)
  },

  filter(items: ComparableProperty[], filters: ComparableFilters) {
    return items.filter((item) => (!filters.type || item.type === filters.type)
      && item.distanceKm <= filters.maxDistanceKm
      && item.area >= filters.minArea && item.area <= filters.maxArea
      && item.price >= filters.minPrice && item.price <= filters.maxPrice
      && item.ageYears <= filters.maxAgeYears
      && (!filters.status || item.status === filters.status))
  },
}