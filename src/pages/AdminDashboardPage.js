import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { useUser } from '../context/UserContext'
import {
  deleteAdminProduct,
  deleteUser,
  getAdminProducts,
  getAdminStats,
  getAllOrders,
  getAllUsers,
  makeSeller,
  updateProductStatus
} from '../api'
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiTrash2,
  FiUserPlus,
  FiUsers,
  FiXCircle
} from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      const [statsRes, usersRes, ordersRes, productsRes] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllOrders(),
        getAdminProducts()
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setOrders(ordersRes.data)
      setProducts(productsRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!user.isAdmin) {
      navigate('/')
      return
    }
    fetchData()
  }, [user, navigate, fetchData])

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await deleteUser(id)
      setSuccess('User deleted successfully')
      setUsers(current => current.filter(u => u._id !== id))
      fetchData(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleMakeSeller = async (id) => {
    try {
      await makeSeller(id)
      setSuccess('User is now a seller')
      setUsers(current => current.map(u => (u._id === id ? { ...u, isSeller: true } : u)))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update seller role')
    }
  }

  const handleProductStatus = async (id, approvalStatus) => {
    let rejectionReason = ''
    if (approvalStatus === 'rejected') {
      const promptValue = window.prompt('Optional rejection note for the seller:', 'Please improve the product photo or details.')
      if (promptValue === null) return
      rejectionReason = promptValue
    }

    try {
      const { data } = await updateProductStatus(id, { approvalStatus, rejectionReason })
      setProducts(current => current.map(product => (product._id === id ? data : product)))
      setSuccess(`Product ${approvalStatus}`)
      fetchData(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product status')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteAdminProduct(id)
      setProducts(current => current.filter(product => product._id !== id))
      setSuccess('Product deleted successfully')
      fetchData(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const orderStatusColor = (status) => {
    if (status === 'Delivered') return '#2ecc71'
    if (status === 'Shipped') return '#3498db'
    if (status === 'Processing') return '#f39c12'
    if (status === 'Cancelled') return '#e74c3c'
    return '#888'
  }

  const productStatusColor = (status) => {
    if (status === 'approved') return '#2ecc71'
    if (status === 'rejected') return '#e74c3c'
    return '#f39c12'
  }

  const tabs = ['overview', 'products', 'orders', 'users']
  const pendingProducts = products.filter(product => product.approvalStatus === 'pending')

  return (
    <div className='glory-page'>
      <Navbar />

      <div className='glory-container glory-dashboard-container'>
        <div className='glory-dashboard-header'>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {user?.name}. Review sellers, products and orders from one place.</p>
          </div>
          <div className='glory-dashboard-pill'>
            {pendingProducts.length} pending product{pendingProducts.length === 1 ? '' : 's'}
          </div>
        </div>

        {error && <Message type='error' text={error} />}
        {success && <Message type='success' text={success} />}

        <div className='glory-dashboard-tabs'>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'active' : ''}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            {activeTab === 'overview' && (
              <>
                <div className='glory-dashboard-stats'>
                  {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <FiUsers size={22} />, color: '#b85f83', bg: '#f8e8ee' },
                    { label: 'Products', value: stats?.totalProducts || 0, icon: <FiPackage size={22} />, color: '#416b5f', bg: '#eef5f2' },
                    { label: 'Orders', value: stats?.totalOrders || 0, icon: <FiShoppingBag size={22} />, color: '#9a6a20', bg: '#fbf1dd' },
                    { label: 'Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: <FiDollarSign size={22} />, color: '#2f7a52', bg: '#eef8f1' }
                  ].map(stat => (
                    <div key={stat.label} className='glory-dashboard-stat'>
                      <div style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className='glory-dashboard-stats glory-dashboard-stats-secondary'>
                  {[
                    { label: 'Pending Review', value: stats?.pendingProducts || 0, icon: <FiClock size={18} />, color: '#f39c12' },
                    { label: 'Approved Live', value: stats?.approvedProducts || 0, icon: <FiCheckCircle size={18} />, color: '#2ecc71' },
                    { label: 'Rejected', value: stats?.rejectedProducts || 0, icon: <FiXCircle size={18} />, color: '#e74c3c' }
                  ].map(stat => (
                    <div key={stat.label} className='glory-dashboard-mini-stat'>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                      <strong>{stat.value}</strong>
                      <small>{stat.label}</small>
                    </div>
                  ))}
                </div>

                <RecentOrdersTable orders={orders.slice(0, 5)} orderStatusColor={orderStatusColor} />
              </>
            )}

            {activeTab === 'products' && (
              <ProductsTable
                products={products}
                productStatusColor={productStatusColor}
                onApprove={(id) => handleProductStatus(id, 'approved')}
                onReject={(id) => handleProductStatus(id, 'rejected')}
                onDelete={handleDeleteProduct}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTable orders={orders} orderStatusColor={orderStatusColor} />
            )}

            {activeTab === 'users' && (
              <UsersTable
                users={users}
                currentUserId={user?._id}
                onDelete={handleDeleteUser}
                onMakeSeller={handleMakeSeller}
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

const RecentOrdersTable = ({ orders, orderStatusColor }) => (
  <section className='glory-dashboard-panel'>
    <div className='glory-dashboard-panel-header'>Recent Orders</div>
    <OrdersTable orders={orders} orderStatusColor={orderStatusColor} compact />
  </section>
)

const OrdersTable = ({ orders, orderStatusColor, compact = false }) => (
  <section className={compact ? '' : 'glory-dashboard-panel'}>
    {!compact && <div className='glory-dashboard-panel-header'>All Orders ({orders.length})</div>}
    <div className='glory-table-wrap'>
      <table className='glory-dashboard-table'>
        <thead>
          <tr>
            {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date'].map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>#{order._id.slice(-8).toUpperCase()}</td>
              <td>{order.buyer?.name || 'N/A'}</td>
              <td>{order.orderItems?.length || 0} items</td>
              <td><strong>{formatCurrency(order.totalPrice)}</strong></td>
              <td>
                <span className={order.isPaid ? 'glory-status-paid' : 'glory-status-unpaid'}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </td>
              <td>
                <span
                  className='glory-status-chip'
                  style={{ color: orderStatusColor(order.status), background: `${orderStatusColor(order.status)}15` }}
                >
                  {order.status}
                </span>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString('en-CA')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const ProductsTable = ({ products, productStatusColor, onApprove, onReject, onDelete }) => (
  <section className='glory-dashboard-panel'>
    <div className='glory-dashboard-panel-header'>Product Review ({products.length})</div>
    <div className='glory-table-wrap'>
      <table className='glory-dashboard-table'>
        <thead>
          <tr>
            {['Product', 'Seller', 'Price', 'Stock', 'Status', 'Actions'].map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>
                <div className='glory-dashboard-product-cell'>
                  <img src={product.image} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.brand} - {product.category}</span>
                  </div>
                </div>
              </td>
              <td>{product.seller?.name || 'Admin'}</td>
              <td><strong>{formatCurrency(product.price)}</strong></td>
              <td>{product.countInStock}</td>
              <td>
                <span
                  className='glory-status-chip'
                  style={{
                    color: productStatusColor(product.approvalStatus),
                    background: `${productStatusColor(product.approvalStatus)}15`
                  }}
                >
                  {product.approvalStatus || 'pending'}
                </span>
              </td>
              <td>
                <div className='glory-table-actions'>
                  {product.approvalStatus !== 'approved' && (
                    <button onClick={() => onApprove(product._id)} className='success' aria-label={`Approve ${product.name}`}>
                      <FiCheckCircle size={15} />
                    </button>
                  )}
                  {product.approvalStatus !== 'rejected' && (
                    <button onClick={() => onReject(product._id)} className='warning' aria-label={`Reject ${product.name}`}>
                      <FiXCircle size={15} />
                    </button>
                  )}
                  <button onClick={() => onDelete(product._id)} className='danger' aria-label={`Delete ${product.name}`}>
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const UsersTable = ({ users, currentUserId, onDelete, onMakeSeller }) => (
  <section className='glory-dashboard-panel'>
    <div className='glory-dashboard-panel-header'>All Users ({users.length})</div>
    <div className='glory-table-wrap'>
      <table className='glory-dashboard-table'>
        <thead>
          <tr>
            {['User', 'Email', 'Role', 'Joined', 'Actions'].map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(account => (
            <tr key={account._id}>
              <td>
                <div className='glory-dashboard-user-cell'>
                  <span>{account.name?.charAt(0).toUpperCase()}</span>
                  <strong>{account.name}</strong>
                </div>
              </td>
              <td>{account.email}</td>
              <td>
                <div className='glory-role-list'>
                  {account.isAdmin && <span className='admin'>Admin</span>}
                  {account.isSeller && <span className='seller'>Seller</span>}
                  {!account.isAdmin && !account.isSeller && <span>Buyer</span>}
                </div>
              </td>
              <td>{new Date(account.createdAt).toLocaleDateString('en-CA')}</td>
              <td>
                {account._id !== currentUserId && (
                  <div className='glory-table-actions'>
                    {!account.isSeller && (
                      <button onClick={() => onMakeSeller(account._id)} className='success' aria-label={`Make ${account.name} a seller`}>
                        <FiUserPlus size={15} />
                      </button>
                    )}
                    <button onClick={() => onDelete(account._id)} className='danger' aria-label={`Delete ${account.name}`}>
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

export default AdminDashboardPage
