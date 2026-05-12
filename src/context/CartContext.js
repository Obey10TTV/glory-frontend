import { createContext, useState, useContext } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(
    localStorage.getItem('gloryCart')
      ? JSON.parse(localStorage.getItem('gloryCart'))
      : []
  )

  const addToCart = (product) => {
    const exists = cartItems.find(item => item._id === product._id)
    
    let updatedCart
    if (exists) {
      updatedCart = cartItems.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      updatedCart = [...cartItems, { ...product, quantity: 1 }]
    }
    
    setCartItems(updatedCart)
    localStorage.setItem('gloryCart', JSON.stringify(updatedCart))
  }

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item._id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('gloryCart', JSON.stringify(updatedCart))
  }

  const updateQuantity = (id, quantity) => {
    const updatedCart = cartItems.map(item =>
      item._id === id ? { ...item, quantity } : item
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