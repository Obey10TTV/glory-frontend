import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'

const CartPage = () => {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()

  const shippingPrice = totalPrice >= 75 ? 0 : 8

  return (
    <div style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '16px', marginBottom: '32px'
        }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#888',
              fontFamily: 'inherit'
            }}
          >
            <FiArrowLeft size={16} /> Continue Shopping
          </button>
        </div>

        <h1 style={{
          fontSize: '28px', fontWeight: '700',
          color: '#111', marginBottom: '32px'
        }}>
          Your Bag ({totalItems})
        </h1>

        {cartItems.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0'
          }}>
            <FiShoppingBag size={48} style={{ color: '#ddd', marginBottom: '16px' }} />
            <div style={{
              fontSize: '18px', fontWeight: '600',
              color: '#111', marginBottom: '8px'
            }}>
              Your bag is empty
            </div>
            <div style={{
              fontSize: '14px', color: '#888',
              marginBottom: '24px'
            }}>
              Add some products to get started
            </div>
            <button
              onClick={() => navigate('/products')}
              className='glory-btn'
              style={{ padding: '13px 32px', fontSize: '13px' }}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '32px', alignItems: 'start'
          }}>

            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '0.5px solid #eee', overflow: 'hidden'
            }}>
              {totalPrice < 75 && (
                <div style={{
                  background: '#fdf0f5', padding: '12px 24px',
                  fontSize: '12px', color: '#c97a9a',
                  fontWeight: '500', textAlign: 'center'
                }}>
                  You're ${(75 - totalPrice).toLocaleString()} away from free shipping! 🎉
                </div>
              )}
              {totalPrice >= 75 && (
                <div style={{
                  background: '#f0fdf4', padding: '12px 24px',
                  fontSize: '12px', color: '#2ecc71',
                  fontWeight: '500', textAlign: 'center'
                }}>
                  ✓ You've unlocked free shipping!
                </div>
              )}

              {cartItems.map((item, i) => (
                <div key={item._id} style={{
                  display: 'flex', gap: '16px',
                  padding: '20px 24px',
                  borderBottom: i < cartItems.length - 1 ? '0.5px solid #eee' : 'none',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '90px', height: '90px',
                    borderRadius: '12px', overflow: 'hidden',
                    background: '#fdf0f5', flexShrink: 0,
                    cursor: 'pointer'
                  }}
                    onClick={() => navigate(`/products/${item._id}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '10px', color: '#c97a9a',
                      fontWeight: '600', letterSpacing: '0.08em',
                      marginBottom: '4px', textTransform: 'uppercase'
                    }}>
                      {item.brand}
                    </div>
                    <div style={{
                      fontSize: '14px', fontWeight: '600',
                      color: '#111', marginBottom: '4px',
                      cursor: 'pointer'
                    }}
                      onClick={() => navigate(`/products/${item._id}`)}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      {item.category}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '0', border: '0.5px solid #eee',
                    borderRadius: '999px', overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeFromCart(item._id)
                        } else {
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      }}
                      style={{
                        width: '34px', height: '34px',
                        border: 'none', background: '#f5f5f5',
                        cursor: 'pointer', fontSize: '16px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >−</button>
                    <span style={{
                      padding: '0 14px', fontSize: '13px',
                      fontWeight: '600', color: '#111'
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      style={{
                        width: '34px', height: '34px',
                        border: 'none', background: '#f5f5f5',
                        cursor: 'pointer', fontSize: '16px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >+</button>
                  </div>

                  <div style={{
                    fontSize: '15px', fontWeight: '700',
                    color: '#111', minWidth: '100px',
                    textAlign: 'right'
                  }}>
                    ${(item.price * item.quantity).toLocaleString()}
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#ccc',
                      display: 'flex', alignItems: 'center',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}

              <div style={{
                padding: '16px 24px',
                borderTop: '0.5px solid #eee',
                display: 'flex', justifyContent: 'flex-end'
              }}>
                <button
                  onClick={clearCart}
                  style={{
                    background: 'none', border: 'none',
                    fontSize: '12px', color: '#e74c3c',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: '500'
                  }}
                >
                  Clear bag
                </button>
              </div>
            </div>

            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '0.5px solid #eee', padding: '24px',
              position: 'sticky', top: '80px'
            }}>
              <div style={{
                fontSize: '16px', fontWeight: '700',
                color: '#111', marginBottom: '20px'
              }}>
                Order Summary
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: '12px', marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '13px', color: '#666'
                }}>
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '13px', color: '#666'
                }}>
                  <span>Shipping</span>
                  <span style={{ color: shippingPrice === 0 ? '#2ecc71' : '#111' }}>
                    {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toLocaleString()}`}
                  </span>
                </div>
                <div style={{
                  height: '0.5px', background: '#eee',
                  margin: '4px 0'
                }} />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '16px', fontWeight: '700', color: '#111'
                }}>
                  <span>Total</span>
                  <span>${(totalPrice + shippingPrice).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className='glory-btn'
                style={{
                  width: '100%', padding: '15px',
                  fontSize: '14px', marginBottom: '12px'
                }}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/products')}
                style={{
                  width: '100%', padding: '13px',
                  fontSize: '13px', fontWeight: '500',
                  border: '0.5px solid #eee',
                  borderRadius: '999px',
                  background: '#fff', color: '#888',
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Continue Shopping
              </button>

              <div style={{
                marginTop: '20px', padding: '16px',
                background: '#fafaf9', borderRadius: '10px',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                {[
                  '🔒 Secure checkout',
                  '✓ 100% authentic products',
                  '↩️ Easy 30-day returns'
                ].map((item, i) => (
                  <div key={i} style={{
                    fontSize: '11px', color: '#888',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default CartPage