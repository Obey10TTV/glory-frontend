export const formatCurrency = (value) => {
  const amount = Number(value) || 0

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount)
}
