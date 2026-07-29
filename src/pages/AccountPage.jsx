import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { useUser } from '../context/UserContext'
import {
  addOrderSupportNote,
  cancelOrder,
  cancelAccountDeletion,
  confirmRecoveryCodeRegeneration,
  confirmTwoFactorDisable,
  confirmTwoFactorEnable,
  exportMyData,
  getMyOrders,
  getSessions,
  openOrderDispute,
  requestAccountDeletion,
  revokeAllSessions,
  revokeSession,
  startRecoveryCodeRegeneration,
  startTwoFactorDisable,
  startTwoFactorEnable
} from '../api'
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiDownload,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiMessageSquare,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiSmartphone,
  FiTrash2,
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
  const [sessions, setSessions] = useState([])
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [orderActionId, setOrderActionId] = useState('')
  const [issueOrderId, setIssueOrderId] = useState('')
  const [issueType, setIssueType] = useState('damaged')
  const [issueMessage, setIssueMessage] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [privacyPassword, setPrivacyPassword] = useState('')
  const [privacyLoading, setPrivacyLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchAccountData = async () => {
      try {
        const [orderResponse, sessionResponse] = await Promise.all([
          getMyOrders(),
          getSessions()
        ])
        setOrders(orderResponse.data)
        setSessions(sessionResponse.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccountData()
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
        : securityStep === 'recovery'
          ? await confirmRecoveryCodeRegeneration({ otp: securityCode })
          : await confirmTwoFactorDisable({ otp: securityCode })

      if (securityStep !== 'recovery') login(data)
      if (Array.isArray(data.recoveryCodes)) setRecoveryCodes(data.recoveryCodes)
      setSecurityStep(null)
      setSecurityCode('')
      setSecurityMessage(
        securityStep === 'enable'
          ? 'Two-factor authentication is now enabled.'
          : securityStep === 'recovery'
            ? 'New recovery codes created. Your previous codes no longer work.'
          : 'Two-factor authentication has been disabled.'
      )
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not verify the code')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleStartRecoveryCodes = async () => {
    setSecurityLoading(true)
    setSecurityError('')
    setRecoveryCodes([])
    try {
      const { data } = await startRecoveryCodeRegeneration()
      setSecurityStep('recovery')
      setSecurityMessage(data.message)
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not start recovery code regeneration')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId) => {
    setSecurityLoading(true)
    setSecurityError('')
    try {
      await revokeSession(sessionId)
      setSessions(current => current.filter(session => session.sessionId !== sessionId))
      setSecurityMessage('Session signed out.')
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not sign out that session')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleRevokeAllSessions = async () => {
    setSecurityLoading(true)
    setSecurityError('')
    try {
      await revokeAllSessions()
      await logout()
      navigate('/login')
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not sign out all sessions')
      setSecurityLoading(false)
    }
  }

  const handleCancelOrder = async (order) => {
    const reason = order.isPaid
      ? 'Buyer requested cancellation before fulfilment.'
      : 'Buyer cancelled before payment.'
    setOrderActionId(order._id)
    try {
      const { data } = await cancelOrder(order._id, { reason })
      setOrders(current => current.map(item => item._id === data._id ? data : item))
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not update this order')
    } finally {
      setOrderActionId('')
    }
  }

  const replaceOrder = (updatedOrder) => {
    setOrders(current => current.map(order => order._id === updatedOrder._id ? updatedOrder : order))
  }

  const handleOpenDispute = async (orderId) => {
    setOrderActionId(orderId)
    setSecurityError('')
    try {
      const { data } = await openOrderDispute(orderId, { type: issueType, message: issueMessage })
      replaceOrder(data)
      setIssueMessage('')
      setSupportMessage('')
      setSecurityMessage('Your order issue was sent to Glory support.')
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not report this issue')
    } finally {
      setOrderActionId('')
    }
  }

  const handleSupportMessage = async (orderId) => {
    setOrderActionId(orderId)
    setSecurityError('')
    try {
      const { data } = await addOrderSupportNote(orderId, { message: supportMessage })
      replaceOrder(data)
      setSupportMessage('')
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not send this message')
    } finally {
      setOrderActionId('')
    }
  }

  const handleDataExport = async () => {
    setPrivacyLoading(true)
    setSecurityError('')
    try {
      const { data } = await exportMyData()
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `glory-data-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      setSecurityMessage('Your Glory data export is ready.')
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not create your data export')
    } finally {
      setPrivacyLoading(false)
    }
  }

  const handleDeletionRequest = async () => {
    if (!privacyPassword || !window.confirm('Submit an account deletion request? Active orders must be resolved first.')) return
    setPrivacyLoading(true)
    setSecurityError('')
    try {
      const { data } = await requestAccountDeletion({ password: privacyPassword })
      login({ ...user, privacy: data.privacy })
      setPrivacyPassword('')
      setSecurityMessage(data.message)
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not submit the deletion request')
    } finally {
      setPrivacyLoading(false)
    }
  }

  const handleCancelDeletion = async () => {
    setPrivacyLoading(true)
    setSecurityError('')
    try {
      const { data } = await cancelAccountDeletion()
      login({ ...user, privacy: data.privacy })
      setSecurityMessage(data.message)
    } catch (error) {
      setSecurityError(error.response?.data?.message || 'Could not cancel the deletion request')
    } finally {
      setPrivacyLoading(false)
    }
  }

  const statusColor = (status) => {
    if (status === 'Delivered') return '#2ecc71'
    if (status === 'Shipped') return '#3498db'
    if (status === 'Processing') return '#f39c12'
    if (status === 'Cancelled') return '#e74c3c'
    if (status === 'CancellationRequested') return '#b45309'
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
              { id: 'privacy', label: 'Privacy', icon: <FiLock size={16} /> },
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
                {securityError && <Message type='error' text={securityError} />}
                {securityMessage && <Message type='success' text={securityMessage} />}

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
                              {new Date(order.createdAt).toLocaleDateString('en-GB', {
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
                            <div key={i} className='glory-account-order-item' style={orderItemStyle}>
                              <img src={item.image} alt={item.name} />
                              <span>
                                <strong>{item.name}</strong> x {item.quantity}
                                <small>
                                  {item.fulfillmentStatus || 'Pending'}
                                  {item.trackingNumber ? ` - Tracking: ${item.trackingNumber}` : ''}
                                </small>
                              </span>
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

                        {['Pending', 'Processing'].includes(order.status) && (
                          <button
                            type='button'
                            className='glory-outline-action glory-order-cancel-action'
                            disabled={orderActionId === order._id}
                            onClick={() => handleCancelOrder(order)}
                          >
                            {orderActionId === order._id
                              ? 'Updating...'
                              : order.isPaid ? 'Request cancellation' : 'Cancel order'}
                          </button>
                        )}

                        <div className='glory-order-support'>
                          <div className='glory-order-support-summary'>
                            <div>
                              <strong>Order support</strong>
                              <span>
                                {order.dispute?.openedAt
                                  ? `Issue ${order.dispute.status.toLowerCase()}`
                                  : 'Report damage, missing items, or listing problems'}
                              </span>
                            </div>
                            <button
                              type='button'
                              className='glory-outline-action'
                              onClick={() => setIssueOrderId(current => current === order._id ? '' : order._id)}
                              aria-expanded={issueOrderId === order._id}
                            >
                              <FiMessageSquare size={15} />
                              {issueOrderId === order._id ? 'Close' : 'Get help'}
                            </button>
                          </div>

                          {order.refundStatus && order.refundStatus !== 'None' && (
                            <div className='glory-order-refund-state'>
                              Refund: {order.refundStatus}
                              {order.refundedAmount > 0 ? ` (${formatCurrency(order.refundedAmount)})` : ''}
                            </div>
                          )}

                          {issueOrderId === order._id && (
                            <div className='glory-order-support-panel'>
                              {(order.supportNotes || []).length > 0 && (
                                <div className='glory-order-thread'>
                                  {order.supportNotes.map(note => (
                                    <div key={note._id} className={`is-${note.authorRole}`}>
                                      <strong>{note.authorRole === 'admin' ? 'Glory support' : note.authorRole}</strong>
                                      <p>{note.message}</p>
                                      <time>{new Date(note.createdAt).toLocaleString('en-GB')}</time>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {!order.dispute?.openedAt && !['Cancelled', 'CancellationRequested'].includes(order.status) ? (
                                <div className='glory-issue-form'>
                                  <label>
                                    Issue type
                                    <select value={issueType} onChange={event => setIssueType(event.target.value)}>
                                      <option value='damaged'>Damaged item</option>
                                      <option value='missing'>Missing item</option>
                                      <option value='wrong_item'>Wrong item</option>
                                      <option value='not_as_described'>Not as described</option>
                                      <option value='other'>Something else</option>
                                    </select>
                                  </label>
                                  <label>
                                    What happened?
                                    <textarea
                                      value={issueMessage}
                                      onChange={event => setIssueMessage(event.target.value)}
                                      maxLength={1000}
                                      placeholder='Include the item and the clearest details you can.'
                                    />
                                  </label>
                                  <button
                                    type='button'
                                    className='glory-btn'
                                    disabled={orderActionId === order._id || issueMessage.trim().length < 10}
                                    onClick={() => handleOpenDispute(order._id)}
                                  >
                                    Submit issue
                                  </button>
                                </div>
                              ) : (
                                <div className='glory-issue-form'>
                                  <label>
                                    Add a message
                                    <textarea
                                      value={supportMessage}
                                      onChange={event => setSupportMessage(event.target.value)}
                                      maxLength={1000}
                                      placeholder='Reply to Glory support about this order.'
                                    />
                                  </label>
                                  <button
                                    type='button'
                                    className='glory-btn'
                                    disabled={orderActionId === order._id || supportMessage.trim().length < 2}
                                    onClick={() => handleSupportMessage(order._id)}
                                  >
                                    Send message
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
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

                {recoveryCodes.length > 0 && (
                  <div className='glory-recovery-panel' role='status'>
                    <strong>Store these recovery codes offline</strong>
                    <p>Each code works once. They will not be displayed again after you leave this page.</p>
                    <div>
                      {recoveryCodes.map(code => <code key={code}>{code}</code>)}
                    </div>
                  </div>
                )}

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
                    <div className='glory-profile-actions'>
                      <button
                        onClick={() => handleStartTwoFactor(twoFactorEnabled ? 'disable' : 'enable')}
                        disabled={securityLoading}
                        className={twoFactorEnabled ? 'glory-outline-action' : 'glory-btn'}
                      >
                        {securityLoading
                          ? 'Sending code...'
                          : twoFactorEnabled
                            ? 'Disable 2FA'
                            : 'Enable 2FA'}
                      </button>
                      {twoFactorEnabled && (
                        <button
                          type='button'
                          onClick={handleStartRecoveryCodes}
                          disabled={securityLoading}
                          className='glory-outline-action'
                        >
                          <FiRefreshCw size={15} /> New recovery codes
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={otpPanelStyle}>
                      <div>
                        <label style={labelStyle}>
                          {securityStep === 'enable'
                            ? 'Setup code'
                            : securityStep === 'recovery' ? 'Recovery code confirmation' : 'Disable code'}
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

                <div className='glory-session-section'>
                  <div className='glory-session-heading'>
                    <div>
                      <strong>Active sessions</strong>
                      <span>Devices currently signed in to your Glory account.</span>
                    </div>
                    {sessions.length > 1 && (
                      <button type='button' onClick={handleRevokeAllSessions} disabled={securityLoading}>
                        Sign out everywhere
                      </button>
                    )}
                  </div>
                  <div className='glory-session-list'>
                    {sessions.map(session => (
                      <div key={session.sessionId} className='glory-session-row'>
                        <FiSmartphone size={19} />
                        <div>
                          <strong>{session.deviceLabel}</strong>
                          <span>
                            {session.current ? 'This device' : `Last active ${new Date(session.lastUsedAt).toLocaleDateString('en-GB')}`}
                          </span>
                        </div>
                        {!session.current && (
                          <button
                            type='button'
                            onClick={() => handleRevokeSession(session.sessionId)}
                            disabled={securityLoading}
                            aria-label={`Sign out ${session.deviceLabel}`}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === 'privacy' && (
              <Panel>
                <SectionTitle title='Privacy & Data' />
                {securityError && <Message type='error' text={securityError} />}
                {securityMessage && <Message type='success' text={securityMessage} />}
                <div className='glory-privacy-options'>
                  <div>
                    <FiDownload size={20} />
                    <span>
                      <strong>Download your data</strong>
                      <small>Receive a JSON copy of your profile, orders, reviews, and seller listings.</small>
                    </span>
                    <button type='button' className='glory-outline-action' onClick={handleDataExport} disabled={privacyLoading}>
                      Download
                    </button>
                  </div>

                  <div className='is-danger'>
                    <FiTrash2 size={20} />
                    <span>
                      <strong>Delete your account</strong>
                      <small>Requests are reviewed so orders, refunds, and required transaction records remain protected.</small>
                    </span>
                    {user?.privacy?.deletionStatus === 'pending' ? (
                      <button type='button' className='glory-outline-action' onClick={handleCancelDeletion} disabled={privacyLoading}>
                        Cancel request
                      </button>
                    ) : (
                      <div className='glory-privacy-confirm'>
                        <label htmlFor='privacy-password'>Current password</label>
                        <input
                          id='privacy-password'
                          type='password'
                          autoComplete='current-password'
                          value={privacyPassword}
                          onChange={event => setPrivacyPassword(event.target.value)}
                        />
                        <button type='button' onClick={handleDeletionRequest} disabled={privacyLoading || !privacyPassword}>
                          Request deletion
                        </button>
                      </div>
                    )}
                  </div>
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
