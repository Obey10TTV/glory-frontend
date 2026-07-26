const UK_NAMES = new Set(['united kingdom', 'uk', 'great britain', 'gb'])

export const isUnitedKingdom = (country = '') => UK_NAMES.has(String(country).trim().toLowerCase())

export const getShippingPrice = (itemsPrice, country = 'United Kingdom') => {
  const amount = Number(itemsPrice) || 0
  const ukDestination = isUnitedKingdom(country)
  const freeShippingThreshold = ukDestination ? 75 : 150
  const standardRate = ukDestination ? 4.95 : 14.95

  return amount >= freeShippingThreshold ? 0 : standardRate
}
