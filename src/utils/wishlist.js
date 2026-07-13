const WISHLIST_KEY = 'gloryWishlist'

export const getWishlistIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch (error) {
    return []
  }
}

export const isWishlisted = (productId) => getWishlistIds().includes(productId)

export const toggleWishlist = (productId) => {
  const saved = new Set(getWishlistIds())
  const nextState = !saved.has(productId)

  if (nextState) {
    saved.add(productId)
  } else {
    saved.delete(productId)
  }

  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([...saved]))
  } catch (error) {
    // Keep the current UI responsive when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent('glory:wishlist-change', {
    detail: { productId, wished: nextState }
  }))
  return nextState
}
