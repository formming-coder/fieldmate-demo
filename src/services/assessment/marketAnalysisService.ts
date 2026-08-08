import { ComparableProperty, MarketAnalysis } from '../../types'

export const marketAnalysisService = {
  analyze(items: ComparableProperty[]): MarketAnalysis {
    const count = Math.max(1, items.length)
    const averageListingPrice = Math.round(items.reduce((sum, item) => sum + item.price, 0) / count)
    const averagePricePerSqm = Math.round(items.reduce((sum, item) => sum + item.pricePerSqm, 0) / count)
    const averageDistanceKm = Number((items.reduce((sum, item) => sum + item.distanceKm, 0) / count).toFixed(2))
    const trendPercent = Number((((averagePricePerSqm % 900) / 100) - 4).toFixed(1))
    return { averageListingPrice, averagePricePerSqm, comparableCount: items.length, averageDistanceKm, trend: trendPercent > 1 ? 'เพิ่มขึ้น' : trendPercent < -1 ? 'ลดลง' : 'ทรงตัว', trendPercent }
  },
}