import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { useUser } from '../context/UserContext'
import { getMyOrders } from '../api'
import { FiPackage, FiUser, FiMapPin, FiLogOut, FiChevronRight } from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'

const AccountPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    const fetchOrders = async () => {
      try {
        const { data } = await getMyOrders()
        setOrders(data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const statusColor = (status) => {
    if (status === 'Delivered') return '#2ecc71'
    if (status === 'Shipped') return '#3498db'
    if (status === 'Processing') return '#f39c12'
    if (status === 'Cancelled') return '#e74c3c'
    return '#888'
  }

  return (
    <div style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '28px', fontWeight: '700',
          color: '#111', marginBottom: '32px'
        }}>
          My Account
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '28px', alignItems: 'start'
        }}>

          {/* SIDEBAR */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '0.5px solid #eee', overflow: 'hidden',
            position: 'sticky', top: '80px'
          }}>
            {/* USER INFO */}
            <div style={{
              padding: '24px',
              borderBottom: '0.5px solid #eee',
              background: '#fafaf9'
            }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '50%', background: '#111',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '20px', fontWeight: '700',
                  color: '#fff'
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{
                fontSize: '15px', fontWeight: '700', color: '#111'
              }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>
                {user?.email}
              </div>
              {user?.isSeller && (
                <div style={{
                  display: 'inline-block', marginTop: '8px',
                  background: '#fdf0f5', borderRadius: '999px',
                  padding: '3px 10px', fontSize: '10px',
                  color: '#c97a9a', fontWeight: '600'
                }}>
                  Verified Seller
                </div>
              )}
            </div>

            {/* NAV ITEMS */}
            {[
              { id: 'orders', label: 'My Orders', icon: <FiPackage size={16} /> },
              { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
              { id: 'address', label: 'Addresses', icon: <FiMapPin size={16} /> },
            ].map(item => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px', cursor: 'pointer',
                  background: activeTab === item.id ? '#fafaf9' : '#fff',
                  borderBottom: '0.5px solid #eee',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', fontSize: '13px',
                  fontWeight: activeTab === item.id ? '600' : '400',
                  color: activeTab === item.id ? '#111' : '#555'
                }}>
                  {item.icon}
                  {item.label}
                </div>
                <FiChevronRight size={14} style={{ color: '#ccc' }} />
              </div>
            ))}

            {user?.isSeller && (
              <div
                onClick={() => navigate('/seller')}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px', cursor: 'pointer',
                  borderBottom: '0.5px solid #eee',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', fontSize: '13px', color: '#c97a9a',
                  fontWeight: '500'
                }}>
                  Seller Dashboard
                </div>
                <FiChevronRight size={14} style={{ color: '#ccc' }} />
              </div>
            )}

            {user?.isAdmin && (
              <div
                onClick={() => navigate('/admin')}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px', cursor: 'pointer',
                  borderBottom: '0.5px solid #eee',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', fontSize: '13px', color: '#3498db',
                  fontWeight: '500'
                }}>
                  Admin Dashboard
                </div>
                <FiChevronRight size={14} style={{ color: '#ccc' }} />
              </div>
            )}

            <div
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center',
                gap: '10px', padding: '14px 20px',
                cursor: 'pointer', fontSize: '13px',
                color: '#e74c3c', fontWeight: '500',
                transition: 'background 0.2s'
              }}
            >
              <FiLogOut size={16} />
              Logout
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div>

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  color: '#111', marginBottom: '20px'
                }}>
                  My Orders
                </div>

                {loading ? <Loader /> : orders.length === 0 ? (
                  <div style={{
                    background: '#fff', borderRadius: '16px',
                    padding: '60px', textAlign: 'center',
                    border: '0.5px solid #eee'
                  }}>
                    <FiPackage size={40} style={{ color: '#ddd', marginBottom: '16px' }} />
                    <div style={{
                      fontSize: '16px', fontWeight: '600',
                      color: '#111', marginBottom: '8px'
                    }}>
                      No orders yet
                    </div>
                    <div style={{
                      fontSize: '13px', color: '#888',
                      marginBottom: '20px'
                    }}>
                      Start shopping to see your orders here
                    </div>
                    <button
                      onClick={() => navigate('/products')}
                      className='glory-btn'
                      style={{ padding: '12px 28px', fontSize: '13px' }}
                    >
                      Shop Now
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {orders.map(order => (
                      <div key={order._id} style={{
                        background: '#fff', borderRadius: '14px',
                        padding: '20px', border: '0.5px solid #eee',
                        cursor: 'pointer'
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', marginBottom: '12px'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '12px', color: '#888', marginBottom: '4px'
                            }}>
                              Order #{order._id.slice(-8).toUpperCase()}
                            </div>
                            <div style={{ fontSize: '13px', color: '#555' }}>
                              {new Date(order.createdAt).toLocaleDateString('en-CA', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </div>
                          </div>
                          <div style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'flex-end', gap: '6px'
                          }}>
                            <span style={{
                              background: `${statusColor(order.status)}15`,
                              color: statusColor(order.status),
                              padding: '4px 12px', borderRadius: '999px',
                              fontSize: '11px', fontWeight: '600'
                            }}>
                              {order.status}
                            </span>
                            <div style={{
                              fontSize: '15px', fontWeight: '700', color: '#111'
                            }}>
                              {formatCurrency(order.totalPrice)}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {order.orderItems.map((item, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center',
                              gap: '6px', background: '#fafaf9',
                              borderRadius: '8px', padding: '6px 10px',
                              fontSize: '12px', color: '#555'
                            }}>
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: '24px', height: '24px',
                                  borderRadius: '4px', objectFit: 'cover'
                                }}
                              />
                              {item.name} × {item.quantity}
                            </div>
                          ))}
                        </div>

                        <div style={{
                          display: 'flex', alignItems: 'center',
                          gap: '6px', marginTop: '12px',
                          fontSize: '12px',
                          color: order.isPaid ? '#2ecc71' : '#e74c3c'
                        }}>
                          {order.isPaid ? 'Paid' : 'Not paid'}
                          <span style={{ color: '#ddd', margin: '0 4px' }}>-</span>
                          <span style={{ color: order.isDelivered ? '#2ecc71' : '#888' }}>
                            {order.isDelivered ? 'Delivered' : 'Not delivered'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div style={{
                background: '#fff', borderRadius: '16px',
                padding: '28px', border: '0.5px solid #eee'
              }}>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  color: '#111', marginBottom: '20px'
                }}>
                  Profile Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      defaultValue={user?.name}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      defaultValue={user?.email}
                      style={inputStyle}
                      disabled
                    />
                  </div>
                  <button
                    className='glory-btn'
                    style={{ padding: '12px 28px', fontSize: '13px', width: 'fit-content' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* ADDRESS TAB */}
            {activeTab === 'address' && (
              <div style={{
                background: '#fff', borderRadius: '16px',
                padding: '28px', border: '0.5px solid #eee'
              }}>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  color: '#111', marginBottom: '20px'
                }}>
                  Saved Addresses
                </div>
                <div style={{
                  textAlign: 'center', padding: '40px',
                  color: '#888', fontSize: '14px'
                }}>
                  <FiMapPin size={32} style={{ color: '#ddd', marginBottom: '12px' }} />
                  <div>No saved addresses yet</div>
                  <div style={{ fontSize: '12px', marginTop: '6px' }}>
                    Your addresses will be saved after your first order
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '12px',
  fontWeight: '600', color: '#444', marginBottom: '6px'
}

const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '0.5px solid #ddd', borderRadius: '10px',
  fontSize: '13px', color: '#111', outline: 'none',
  background: '#fafaf9', boxSizing: 'border-box',
  fontFamily: 'inherit'
}

export default AccountPage
