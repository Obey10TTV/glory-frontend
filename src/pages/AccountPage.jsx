import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { useUser } from '../context/UserContext'
import {
  confirmTwoFactorDisable,
  confirmTwoFactorEnable,
  getMyOrders,
  startTwoFactorDisable,
  startTwoFactorEnable
} from '../api'
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiPackage,
  FiShield,
  FiUser
} from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'

const AccountPage = () => {
  const navigate = useNavigate()
  const { user, login, logout } = useUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [securityStep, setSecurityStep] = useState(null)
  const [securityCode, setSecurityCode] = useState('')
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityMessage, setSecurityMessage] = useState('')
  const [securityError, setSecurityError] = useState('')

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

  const handleStartTwoFactor = async (mode) => {
    setSecurityLoading(true)
    setSecurityError('')
    setSecurityMessage('')
    setSecurityCode('')

    try {
      const { data } = mode === 'enable'
        ? await startTwoFactorEnable()
        : await startTwoFactorDisable()

      setSecurityStep(mode)
      setSecurityMessage(data.message)
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not start the security check')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleConfirmTwoFactor = async () => {
    if (!securityStep) {
      return
    }

    setSecurityLoading(true)
    setSecurityError('')
    setSecurityMessage('')

    try {
      const { data } = securityStep === 'enable'
        ? await confirmTwoFactorEnable({ otp: securityCode })
        : await confirmTwoFactorDisable({ otp: securityCode })

      login(data)
      setSecurityStep(null)
      setSecurityCode('')
      setSecurityMessage(
        securityStep === 'enable'
          ? 'Two-factor authentication is now enabled.'
          : 'Two-factor authentication has been disabled.'
      )
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not verify the code')
    } finally {
      setSecurityLoading(false)
    }
  }

  const statusColor = (status) => {
    if (status === 'Delivered') return '#2ecc71'
    if (status === 'Shipped') return '#3498db'
    if (status === 'Processing') return '#f39c12'
    if (status === 'Cancelled') return '#e74c3c'
    return '#888'
  }

  const sellerStatus = user?.sellerProfile?.verificationStatus || 'incomplete'
  const twoFactorEnabled = Boolean(user?.twoFactorEnabled)

  return (
    <div className='glory-account-page'>
      <Navbar />

      <main className='glory-account-container'>
        <h1 style={pageTitleStyle}>My Account</h1>

        <div className='glory-account-layout'>
          <aside className='glory-account-sidebar'>
            <div style={userPanelStyle}>
              <div style={avatarStyle}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '3px', overflowWrap: 'anywhere' }}>
                {user?.email}
              </div>
              {user?.isSeller && (
                <div style={sellerBadgeStyle}>
                  Seller: {sellerStatus}
                </div>
              )}
            </div>

            {[
              { id: 'orders', label: 'My Orders', icon: <FiPackage size={16} /> },
              { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
              { id: 'security', label: 'Security', icon: <FiShield size={16} /> },
              { id: 'address', label: 'Addresses', icon: <FiMapPin size={16} /> },
            ].map(item => (
              <SidebarButton
                key={item.id}
                item={item}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}

            {user?.isSeller && (
              <SidebarLink
                label='Seller Dashboard'
                color='#c97a9a'
                onClick={() => navigate('/seller')}
              />
            )}

            {user?.isAdmin && (
              <SidebarLink
                label='Admin Dashboard'
                color='#3498db'
                onClick={() => navigate('/admin')}
              />
            )}

            <button onClick={handleLogout} style={logoutButtonStyle}>
              <FiLogOut size={16} />
              Logout
            </button>
          </aside>

          <section className='glory-account-main'>
            {activeTab === 'orders' && (
              <div>
                <SectionTitle title='My Orders' />

                {loading ? <Loader /> : orders.length === 0 ? (
                  <EmptyState
                    icon={<FiPackage size={40} />}
                    title='No orders yet'
                    text='Start shopping to see your orders here'
                    action='Shop Now'
                    onAction={() => navigate('/products')}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {orders.map(order => (
                      <div key={order._id} style={orderCardStyle}>
                        <div className='glory-account-order-header'>
                          <div>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                              Order #{order._id.slice(-8).toUpperCase()}
                            </div>
                            <div style={{ fontSize: '13px', color: '#555' }}>
                              {new Date(order.createdAt).toLocaleDateString('en-CA', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <span style={{
                              background: `${statusColor(order.status)}15`,
                              color: statusColor(order.status),
                              padding: '4px 12px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {order.status}
                            </span>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>
                              {formatCurrency(order.totalPrice)}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {order.orderItems.map((item, i) => (
                            <div key={i} style={orderItemStyle}>
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                              {item.name} x {item.quantity}
                            </div>
                          ))}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '12px',
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

            {activeTab === 'profile' && (
              <Panel>
                <SectionTitle title='Profile Details' />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input defaultValue={user?.name} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input defaultValue={user?.email} style={inputStyle} disabled />
                  </div>
                  <button className='glory-btn' style={{ padding: '12px 28px', fontSize: '13px', width: 'fit-content' }}>
                    Save Changes
                  </button>
                </div>
              </Panel>
            )}

            {activeTab === 'security' && (
              <Panel>
                <SectionTitle title='Account Security' />
                {securityError && <Message type='error' text={securityError} />}
                {securityMessage && <Message type='success' text={securityMessage} />}

                <div className='glory-security-grid'>
                  <SecurityStatus
                    icon={<FiCheckCircle size={20} />}
                    title='Email verification'
                    text={user?.isEmailVerified === false ? 'Email verification is still required.' : 'Your account email is verified.'}
                    good={user?.isEmailVerified !== false}
                  />
                  <SecurityStatus
                    icon={<FiLock size={20} />}
                    title='Two-factor authentication'
                    text={twoFactorEnabled ? 'Extra email OTP is required at sign in.' : 'Add an extra OTP check before account access.'}
                    good={twoFactorEnabled}
                  />
                </div>

                {user?.isSeller && !twoFactorEnabled && (
                  <div style={sellerSecurityNoticeStyle}>
                    <FiAlertTriangle size={18} style={{ flex: '0 0 auto', marginTop: '2px' }} />
                    <div>
                      <strong>Recommended for sellers</strong>
                      <span> Enable 2FA before managing listings, orders, and store verification details.</span>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {!securityStep ? (
                    <button
                      onClick={() => handleStartTwoFactor(twoFactorEnabled ? 'disable' : 'enable')}
                      disabled={securityLoading}
                      className={twoFactorEnabled ? 'glory-outline-action' : 'glory-btn'}
                      style={{ padding: '12px 22px', fontSize: '13px', width: 'fit-content' }}
                    >
                      {securityLoading
                        ? 'Sending code...'
                        : twoFactorEnabled
                          ? 'Disable 2FA'
                          : 'Enable 2FA'}
                    </button>
                  ) : (
                    <div style={otpPanelStyle}>
                      <div>
                        <label style={labelStyle}>
                          {securityStep === 'enable' ? 'Setup code' : 'Disable code'}
                        </label>
                        <input
                          type='text'
                          inputMode='numeric'
                          maxLength={6}
                          value={securityCode}
                          onChange={e => setSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder='000000'
                          style={{ ...inputStyle, letterSpacing: '0.18em', textAlign: 'center', fontSize: '16px' }}
                        />
                      </div>
                      <div className='glory-profile-actions'>
                        <button
                          onClick={handleConfirmTwoFactor}
                          disabled={securityLoading || securityCode.length !== 6}
                          className='glory-btn'
                          style={{ padding: '12px 22px', fontSize: '13px', opacity: securityLoading || securityCode.length !== 6 ? 0.7 : 1 }}
                        >
                          {securityLoading ? 'Verifying...' : 'Confirm Code'}
                        </button>
                        <button
                          onClick={() => {
                            setSecurityStep(null)
                            setSecurityCode('')
                            setSecurityMessage('')
                          }}
                          className='glory-outline-action'
                          style={{ padding: '12px 22px', fontSize: '13px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            )}

            {activeTab === 'address' && (
              <Panel>
                <SectionTitle title='Saved Addresses' />
                <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontSize: '14px' }}>
                  <FiMapPin size={32} style={{ color: '#ddd', marginBottom: '12px' }} />
                  <div>No saved addresses yet</div>
                  <div style={{ fontSize: '12px', marginTop: '6px' }}>
                    Your addresses will be saved after your first order
                  </div>
                </div>
              </Panel>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

const SidebarButton = ({ item, active, onClick }) => (
  <button onClick={onClick} style={{ ...sidebarButtonStyle, background: active ? '#fafaf9' : '#fff' }}>
    <span style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      fontWeight: active ? '600' : '400',
      color: active ? '#111' : '#555'
    }}>
      {item.icon}
      {item.label}
    </span>
    <FiChevronRight size={14} style={{ color: '#ccc' }} />
  </button>
)

const SidebarLink = ({ label, color, onClick }) => (
  <button onClick={onClick} style={sidebarButtonStyle}>
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color, fontWeight: '500' }}>
      {label}
    </span>
    <FiChevronRight size={14} style={{ color: '#ccc' }} />
  </button>
)

const SectionTitle = ({ title }) => (
  <div style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '20px' }}>
    {title}
  </div>
)

const Panel = ({ children }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '0.5px solid #eee' }}>
    {children}
  </div>
)

const EmptyState = ({ icon, title, text, action, onAction }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '0.5px solid #eee' }}>
    <div style={{ color: '#ddd', marginBottom: '16px' }}>{icon}</div>
    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>
      {title}
    </div>
    <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
      {text}
    </div>
    <button onClick={onAction} className='glory-btn' style={{ padding: '12px 28px', fontSize: '13px' }}>
      {action}
    </button>
  </div>
)

const SecurityStatus = ({ icon, title, text, good }) => (
  <div style={securityStatusStyle}>
    <div style={{ color: good ? '#047857' : '#b45309', display: 'flex' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#777' }}>
        {text}
      </div>
    </div>
  </div>
)

const pageTitleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#111',
  marginBottom: '32px'
}

const userPanelStyle = {
  padding: '24px',
  borderBottom: '0.5px solid #eee',
  background: '#fafaf9'
}

const avatarStyle = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  background: '#111',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '12px'
}

const sellerBadgeStyle = {
  display: 'inline-block',
  marginTop: '8px',
  background: '#fdf0f5',
  borderRadius: '999px',
  padding: '3px 10px',
  fontSize: '10px',
  color: '#c97a9a',
  fontWeight: '600',
  textTransform: 'capitalize'
}

const sidebarButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px',
  cursor: 'pointer',
  border: 0,
  borderBottom: '0.5px solid #eee',
  fontFamily: 'inherit',
  textAlign: 'left',
  minHeight: '48px'
}

const logoutButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 20px',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#e74c3c',
  fontWeight: '500',
  border: 0,
  background: '#fff',
  fontFamily: 'inherit',
  minHeight: '48px'
}

const orderCardStyle = {
  background: '#fff',
  borderRadius: '14px',
  padding: '20px',
  border: '0.5px solid #eee'
}

const orderItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#fafaf9',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '12px',
  color: '#555'
}

const securityStatusStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '16px',
  border: '0.5px solid #eee',
  borderRadius: '14px',
  background: '#fafaf9'
}

const sellerSecurityNoticeStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  marginTop: '18px',
  background: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '14px',
  color: '#9a3412',
  fontSize: '12px',
  lineHeight: '1.6',
  padding: '14px 16px'
}

const otpPanelStyle = {
  display: 'grid',
  gap: '14px',
  maxWidth: '360px'
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#444',
  marginBottom: '6px'
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '0.5px solid #ddd',
  borderRadius: '10px',
  fontSize: '13px',
  color: '#111',
  outline: 'none',
  background: '#fafaf9',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  minHeight: '44px'
}

export default AccountPage
