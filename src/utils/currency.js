const localeByCurrency = {
  GBP: 'en-GB',
  USD: 'en-US',
  CAD: 'en-CA'
}

export const formatCurrency = (value, currency = 'GBP', locale) => {
  const amount = Number(value) || 0
  const normalizedCurrency = String(currency || 'GBP').toUpperCase()

  return new Intl.NumberFormat(locale || localeByCurrency[normalizedCurrency] || 'en-GB', {
    style: 'currency',
    currency: normalizedCurrency,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatMinorCurrency = (value, currency = 'GBP', locale) => (
  formatCurrency((Number(value) || 0) / 100, currency, locale)
)
