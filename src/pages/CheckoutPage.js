import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { createOrder, initializePayment } from '../api'
import Message from '../components/Message'
import { FiCheck } from 'react-icons/fi'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user } = useUser()

  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Paystack')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const shippingPrice = totalPrice >= 30000 ? 0 : 2000
  const totalAmount = totalPrice + shippingPrice

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    setError('')
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        shippingAddress: { fullName, address, city, state, phone },
        paymentMethod,
        itemsPrice: totalPrice,
        shippingPrice,
        totalPrice: totalAmount
      }

      const { data: order } = await createOrder(orderData)

      if (paymentMethod === 'Paystack') {
        const { data: payment } = await initializePayment({
          email: user.email,
          amount: totalAmount,
          orderId: order._id
        })
        clearCart()
        window.location.href = payment.data.authorization_url
      } else {
        clearCart()
        navigate(`/account`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '28px', fontWeight: '700',
          color: '#111', marginBottom: '8px'
        }}>
          Checkout
        </h1>

        {/* PROGRESS STEPS */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '0', marginBottom: '40px'
        }}>
          {['Shipping', 'Payment', 'Review'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: i + 1 < step ? 'pointer' : 'default'
              }}
                onClick={() => i + 1 < step && setStep(i + 1)}
              >
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: step > i + 1 ? '#2ecc71' : step === i + 1 ? '#111' : '#eee',
                  color: step >= i + 1 ? '#fff' : '#aaa',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700',
                  transition: 'all 0.3s'
                }}>
                  {step > i + 1 ? <FiCheck size={14} /> : i + 1}
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: '500',
                  color: step === i + 1 ? '#111' : '#aaa'
                }}>
                  {s}
                </span>
              </div>
              {i < 2 && (
                <div style={{
                  width: '60px', height: '1px',
                  background: step > i + 1 ? '#2ecc71' : '#eee',
                  margin: '0 12px', transition: 'background 0.3s'
                }} />
              )}
            </div>
          ))}
        </div>

        {error && <Message type='error' text={error} />}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '28px', alignItems: 'start'
        }}>

          {/* LEFT PANEL */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '28px', border: '0.5px solid #eee'
          }}>

            {/* STEP 1 — SHIPPING */}
            {step === 1 && (
              <div>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  color: '#111', marginBottom: '20px'
                }}>
                  Shipping Address
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder='Your full name'
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder='08012345678'
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Street Address</label>
                    <input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder='House number, street name'
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>City</label>
                      <input
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder='Your city'
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>State</label>
                      <select
                        value={state}
                        onChange={e => setState(e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                      >
                        <option value=''>Select state</option>
                        {nigerianStates.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!fullName || !address || !city || !state || !phone) {
                      setError('Please fill in all shipping details')
                      return
                    }
                    setError('')
                    setStep(2)
                  }}
                  className='glory-btn'
                  style={{
                    width: '100%', padding: '14px',
                    fontSize: '14px', marginTop: '24px'
                  }}
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 2 — PAYMENT */}
            {step === 2 && (
              <div>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  color: '#111', marginBottom: '20px'
                }}>
                  Payment Method
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    {
                      value: 'Paystack',
                      label: 'Pay with Paystack',
                      sub: 'Card, Bank Transfer, USSD',
                      icon: '💳'
                    },
                    {
                      value: 'Crypto',
                      label: 'Pay with Crypto',
                      sub: 'USDT, Bitcoin via MetaMask',
                      icon: '🔐'
                    },
                    {
                      value: 'PayOnDelivery',
                      label: 'Pay on Delivery',
                      sub: 'Cash on delivery — Lagos only',
                      icon: '🚚'
                    },
                  ].map(method => (
                    <div
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        gap: '14px', padding: '16px',
                        border: `1.5px solid ${paymentMethod === method.value ? '#111' : '#eee'}`,
                        borderRadius: '12px', cursor: 'pointer',
                        background: paymentMethod === method.value ? '#fafaf9' : '#fff',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{method.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px', fontWeight: '600', color: '#111'
                        }}>
                          {method.label}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {method.sub}
                        </div>
                      </div>
                      <div style={{
                        width: '20px', height: '20px',
                        borderRadius: '50%',
                        border: `1.5px solid ${paymentMethod === method.value ? '#111' : '#ddd'}`,
                        background: paymentMethod === method.value ? '#111' : '#fff',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0
                      }}>
                        {paymentMethod === method.value && (
                          <div style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%', background: '#fff'
                          }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1, padding: '14px',
                      border: '0.5px solid #eee',
                      borderRadius: '999px',
                      background: '#fff', color: '#888',
                      cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '14px', fontWeight: '500'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className='glory-btn'
                    style={{ flex: 2, padding: '14px', fontSize: '14px' }}
                  >
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — REVIEW */}
            {step === 3 && (
              <div>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  color: '#111', marginBottom: '20px'
                }}>
                  Review Your Order
                </div>

                {/* SHIPPING SUMMARY */}
                <div style={{
                  background: '#fafaf9', borderRadius: '12px',
                  padding: '16px', marginBottom: '16px',
                  border: '0.5px solid #eee'
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
                      Shipping to
                    </div>
                    <span
                      onClick={() => setStep(1)}
                      style={{
                        fontSize: '12px', color: '#888',
                        cursor: 'pointer', textDecoration: 'underline'
                      }}
                    >
                      Edit
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                    {fullName} · {phone}<br />
                    {address}, {city}, {state}
                  </div>
                </div>

                {/* PAYMENT SUMMARY */}
                <div style={{
                  background: '#fafaf9', borderRadius: '12px',
                  padding: '16px', marginBottom: '16px',
                  border: '0.5px solid #eee'
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
                      Payment
                    </div>
                    <span
                      onClick={() => setStep(2)}
                      style={{
                        fontSize: '12px', color: '#888',
                        cursor: 'pointer', textDecoration: 'underline'
                      }}
                    >
                      Edit
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#555' }}>
                    {paymentMethod === 'Paystack' ? '💳 Paystack' :
                     paymentMethod === 'Crypto' ? '🔐 Crypto' : '🚚 Pay on Delivery'}
                  </div>
                </div>

                {/* ITEMS */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '13px', fontWeight: '600',
                    color: '#111', marginBottom: '12px'
                  }}>
                    Items ({cartItems.length})
                  </div>
                  {cartItems.map(item => (
                    <div key={item._id} style={{
                      display: 'flex', gap: '12px',
                      alignItems: 'center', marginBottom: '10px'
                    }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '50px', height: '50px',
                          borderRadius: '8px', objectFit: 'cover',
                          background: '#fdf0f5'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      flex: 1, padding: '14px',
                      border: '0.5px solid #eee',
                      borderRadius: '999px',
                      background: '#fff', color: '#888',
                      cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '14px', fontWeight: '500'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className='glory-btn'
                    style={{
                      flex: 2, padding: '14px', fontSize: '14px',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Processing...' : `Place Order — ₦${totalAmount.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '24px', border: '0.5px solid #eee',
            position: 'sticky', top: '80px'
          }}>
            <div style={{
              fontSize: '15px', fontWeight: '700',
              color: '#111', marginBottom: '16px'
            }}>
              Order Summary
            </div>

            {cartItems.map(item => (
              <div key={item._id} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '13px', color: '#666',
                marginBottom: '8px'
              }}>
                <span>{item.name} × {item.quantity}</span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}

            <div style={{ height: '0.5px', background: '#eee', margin: '14px 0' }} />

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '13px', color: '#666', marginBottom: '8px'
            }}>
              <span>Shipping</span>
              <span style={{ color: shippingPrice === 0 ? '#2ecc71' : '#111' }}>
                {shippingPrice === 0 ? 'FREE' : `₦${shippingPrice.toLocaleString()}`}
              </span>
            </div>

            <div style={{ height: '0.5px', background: '#eee', margin: '14px 0' }} />

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '16px', fontWeight: '700', color: '#111'
            }}>
              <span>Total</span>
              <span>₦{totalAmount.toLocaleString()}</span>
            </div>

            <div style={{
              marginTop: '20px', padding: '14px',
              background: '#fafaf9', borderRadius: '10px'
            }}>
              {[
                '🔒 Secure checkout',
                '✓ 100% authentic products',
                '↩️ Easy 30-day returns'
              ].map((item, i) => (
                <div key={i} style={{
                  fontSize: '11px', color: '#888',
                  marginBottom: i < 2 ? '6px' : '0'
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '12px',
  fontWeight: '600', color: '#444',
  marginBottom: '6px'
}

const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '0.5px solid #ddd', borderRadius: '10px',
  fontSize: '13px', color: '#111',
  outline: 'none', background: '#fafaf9',
  boxSizing: 'border-box', fontFamily: 'inherit'
}

export default CheckoutPage