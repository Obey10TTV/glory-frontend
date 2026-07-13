import { createContext, useState, useContext } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(
    localStorage.getItem('gloryCart')
      ? JSON.parse(localStorage.getItem('gloryCart'))
      : []
  )

  const addToCart = (product) => {
    const cartKey = product.cartKey || `${product._id}:${product.variantId || 'default'}`
    const requestedQuantity = Math.max(1, Number(product.quantity) || 1)
    const exists = cartItems.find(item => (item.cartKey || `${item._id}:default`) === cartKey)
    
    let updatedCart
    if (exists) {
      updatedCart = cartItems.map(item =>
        (item.cartKey || `${item._id}:default`) === cartKey
          ? { ...item, quantity: item.quantity + requestedQuantity }
          : item
      )
    } else {
      updatedCart = [...cartItems, { ...product, cartKey, quantity: requestedQuantity }]
    }
    
    setCartItems(updatedCart)
    localStorage.setItem('gloryCart', JSON.stringify(updatedCart))
  }

  const removeFromCart = (key) => {
    const updatedCart = cartItems.filter(item => (item.cartKey || item._id) !== key)
    setCartItems(updatedCart)
    localStorage.setItem('gloryCart', JSON.stringify(updatedCart))
  }

  const updateQuantity = (key, quantity) => {
    const updatedCart = cartItems.map(item =>
      (item.cartKey || item._id) === key ? { ...item, quantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('gloryCart', JSON.stringify(updatedCart))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('gloryCart')
  }

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  )

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
