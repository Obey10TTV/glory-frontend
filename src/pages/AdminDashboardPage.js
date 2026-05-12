import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { useUser } from '../context/UserContext'
import { getAdminStats, getAllUsers, getAllOrders, deleteUser } from '../api'
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage, FiTrash2, FiEye } from 'react-icons/fi'
import Message from '../components/Message'

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!user.isAdmin) { navigate('/'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllOrders()
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setOrders(ordersRes.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await deleteUser(id)
      setSuccess('User deleted successfully')
      setUsers(users.filter(u => u._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const statusColor = (status) => {
    if (status === 'Delivered') return '#2ecc71'
    if (status === 'Shipped') return '#3498db'
    if (status === 'Processing') return '#f39c12'
    if (status === 'Cancelled') return '#e74c3c'
    return '#888'
  }

  const tabs = ['overview', 'orders', 'users']

  return (
    <div style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            Welcome back, {user?.name} — here's what's happening on Glory today.
          </p>
        </div>

        {error && <Message type='error' text={error} />}
        {success && <Message type='success' text={success} />}

        {/* TABS */}
        <div style={{
          display: 'flex', gap: '0',
          borderBottom: '0.5px solid #eee',
          marginBottom: '28px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px', border: 'none',
                background: 'none', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer',
                fontFamily: 'inherit', textTransform: 'capitalize',
                color: activeTab === tab ? '#111' : '#888',
                borderBottom: activeTab === tab ? '2px solid #111' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                {/* STATS CARDS */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px', marginBottom: '32px'
                }}>
                  {[
                    {
                      label: 'Total Users',
                      value: stats?.totalUsers || 0,
                      icon: <FiUsers size={22} />,
                      color: '#c97a9a',
                      bg: '#fdf0f5'
                    },
                    {
                      label: 'Total Products',
                      value: stats?.totalProducts || 0,
                      icon: <FiPackage size={22} />,
                      color: '#3498db',
                      bg: '#eaf4fd'
                    },
                    {
                      label: 'Total Orders',
                      value: stats?.totalOrders || 0,
                      icon: <FiShoppingBag size={22} />,
                      color: '#f39c12',
                      bg: '#fef9e7'
                    },
                    {
                      label: 'Total Revenue',
                      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
                      icon: <FiDollarSign size={22} />,
                      color: '#2ecc71',
                      bg: '#f0fdf4'
                    },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      background: '#fff', borderRadius: '16px',
                      padding: '24px', border: '0.5px solid #eee',
                      display: 'flex', flexDirection: 'column', gap: '12px'
                    }}>
                      <div style={{
                        width: '48px', height: '48px',
                        borderRadius: '12px', background: stat.bg,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: stat.color
                      }}>
                        {stat.icon}
                      </div>
                      <div>
                        <div style={{
                          fontSize: '26px', fontWeight: '800', color: '#111'
                        }}>
                          {stat.value}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RECENT ORDERS */}
                <div style={{
                  background: '#fff', borderRadius: '16px',
                  border: '0.5px solid #eee', overflow: 'hidden',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    padding: '20px 24px',
                    borderBottom: '0.5px solid #eee',
                    fontSize: '15px', fontWeight: '700', color: '#111'
                  }}>
                    Recent Orders
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#fafaf9' }}>
                        {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                          <th key={h} style={{
                            padding: '12px 20px', textAlign: 'left',
                            fontSize: '11px', fontWeight: '600',
                            color: '#888', letterSpacing: '0.06em',
                            textTransform: 'uppercase'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order, i) => (
                        <tr key={order._id} style={{ borderTop: '0.5px solid #eee' }}>
                          <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '500', color: '#111' }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555' }}>
                            {order.buyer?.name || 'N/A'}
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#111' }}>
                            ₦{order.totalPrice.toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{
                              background: `${statusColor(order.status)}15`,
                              color: statusColor(order.status),
                              padding: '4px 12px', borderRadius: '999px',
                              fontSize: '11px', fontWeight: '600'
                            }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '12px', color: '#888' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-NG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div style={{
                background: '#fff', borderRadius: '16px',
                border: '0.5px solid #eee', overflow: 'hidden'
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '0.5px solid #eee',
                  fontSize: '15px', fontWeight: '700', color: '#111'
                }}>
                  All Orders ({orders.length})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafaf9' }}>
                      {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                        <th key={h} style={{
                          padding: '12px 20px', textAlign: 'left',
                          fontSize: '11px', fontWeight: '600',
                          color: '#888', letterSpacing: '0.06em',
                          textTransform: 'uppercase'
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} style={{ borderTop: '0.5px solid #eee' }}>
                        <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '500', color: '#111' }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555' }}>
                          {order.buyer?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555' }}>
                          {order.orderItems.length} items
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#111' }}>
                          ₦{order.totalPrice.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            color: order.isPaid ? '#2ecc71' : '#e74c3c',
                            fontSize: '12px', fontWeight: '600'
                          }}>
                            {order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            background: `${statusColor(order.status)}15`,
                            color: statusColor(order.status),
                            padding: '4px 12px', borderRadius: '999px',
                            fontSize: '11px', fontWeight: '600'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '12px', color: '#888' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-NG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div style={{
                background: '#fff', borderRadius: '16px',
                border: '0.5px solid #eee', overflow: 'hidden'
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '0.5px solid #eee',
                  fontSize: '15px', fontWeight: '700', color: '#111'
                }}>
                  All Users ({users.length})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafaf9' }}>
                      {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '12px 20px', textAlign: 'left',
                          fontSize: '11px', fontWeight: '600',
                          color: '#888', letterSpacing: '0.06em',
                          textTransform: 'uppercase'
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderTop: '0.5px solid #eee' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px', height: '36px',
                              borderRadius: '50%', background: '#111',
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'center', color: '#fff',
                              fontSize: '13px', fontWeight: '700'
                            }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>
                              {u.name}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {u.isAdmin && (
                              <span style={{
                                background: '#eaf4fd', color: '#3498db',
                                padding: '3px 10px', borderRadius: '999px',
                                fontSize: '11px', fontWeight: '600'
                              }}>Admin</span>
                            )}
                            {u.isSeller && (
                              <span style={{
                                background: '#fdf0f5', color: '#c97a9a',
                                padding: '3px 10px', borderRadius: '999px',
                                fontSize: '11px', fontWeight: '600'
                              }}>Seller</span>
                            )}
                            {!u.isAdmin && !u.isSeller && (
                              <span style={{
                                background: '#f5f5f5', color: '#888',
                                padding: '3px 10px', borderRadius: '999px',
                                fontSize: '11px', fontWeight: '600'
                              }}>Buyer</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '12px', color: '#888' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-NG')}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {u._id !== user._id && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              style={{
                                background: 'none', border: 'none',
                                cursor: 'pointer', color: '#ccc',
                                display: 'flex', alignItems: 'center',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
                              onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                            >
                              <FiTrash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default AdminDashboardPage