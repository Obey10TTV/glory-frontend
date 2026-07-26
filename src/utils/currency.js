export const formatCurrency = (value) => {
  const amount = Number(value) || 0

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount)
}
