import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { useUser } from '../context/UserContext'
import {
  addAdminOrderNote,
  deleteAdminProduct,
  deleteUser,
  getAdminAudit,
  getAdminProducts,
  getAdminStats,
  getAllOrders,
  getAllUsers,
  getSellerDocumentUrl,
  makeSeller,
  resolveCancellation,
  resolveDispute,
  updateProductStatus,
  updateSellerDocumentStatus,
  updateSellerStatus
} from '../api'
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiFileText,
  FiMessageSquare,
  FiPackage,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTrash2,
  FiUserPlus,
  FiUsers,
  FiXCircle
} from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const downloadCsv = (filename, rows) => {
  const content = rows.map(row => row.map(csvCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const productQuality = (product) => {
  const checks = [
    product.description?.length >= 40,
    product.ingredients,
    product.howToUse,
    product.productType,
    product.countryOfOrigin,
    product.size,
    product.image,
    (product.images || []).length >= 2,
    (product.keyBenefits || []).length >= 2,
    product.sku || product.barcode
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      const [statsRes, usersRes, ordersRes, productsRes, auditRes] = await Promise.all([
        getAdminStats(), getAllUsers(), getAllOrders(), getAdminProducts(), getAdminAudit({ limit: 100 })
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setOrders(ordersRes.data)
      setProducts(productsRes.data)
      setAuditLogs(auditRes.data.items || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return navigate('/login')
    if (!user.isAdmin) return navigate('/')
    fetchData()
  }, [user, navigate, fetchData])

  const refreshAfter = async (message) => {
    setSuccess(message)
    setError('')
    await fetchData(false)
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this account? Accounts with order history must use the privacy workflow.')) return
    try {
      await deleteUser(id)
      await refreshAfter('User deleted successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleMakeSeller = async (id) => {
    try {
      await makeSeller(id)
      await refreshAfter('User is now a seller')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update seller role')
    }
  }

  const handleSellerStatus = async (id, verificationStatus) => {
    const verificationNote = verificationStatus === 'rejected'
      ? window.prompt('Reason for rejection:', 'Please complete the missing verification requirements.')
      : ''
    if (verificationNote === null) return
    try {
      await updateSellerStatus(id, { verificationStatus, verificationNote })
      await refreshAfter(`Seller ${verificationStatus}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update seller verification')
    }
  }

  const handleOpenDocument = async (userId, documentId) => {
    try {
      const { data } = await getSellerDocumentUrl(userId, documentId)
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open this private document')
    }
  }

  const handleDocumentStatus = async (userId, documentId, status) => {
    const note = window.prompt(status === 'rejected' ? 'Reason for rejection:' : 'Optional review note:', '')
    if (note === null) return
    try {
      await updateSellerDocumentStatus(userId, documentId, { status, note })
      await refreshAfter(`Document ${status}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not review this document')
    }
  }

  const handleProductStatus = async (id, approvalStatus) => {
    const rejectionReason = approvalStatus === 'rejected'
      ? window.prompt('Reason for rejection:', 'Please improve the product photo or listing details.')
      : ''
    if (rejectionReason === null) return
    try {
      await updateProductStatus(id, { approvalStatus, rejectionReason })
      await refreshAfter(`Product ${approvalStatus}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product status')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteAdminProduct(id)
      await refreshAfter('Product deleted successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleCancellation = async (orderId, payload) => {
    try {
      await resolveCancellation(orderId, payload)
      await refreshAfter(payload.decision === 'approve' ? 'Cancellation approved' : 'Cancellation rejected')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve cancellation')
    }
  }

  const handleDispute = async (orderId, payload) => {
    try {
      await resolveDispute(orderId, payload)
      await refreshAfter(`Dispute marked ${payload.status}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update dispute')
    }
  }

  const handleOrderNote = async (orderId, payload) => {
    try {
      await addAdminOrderNote(orderId, payload)
      await refreshAfter('Support note added')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add support note')
    }
  }

  const term = search.trim().toLowerCase()
  const filteredProducts = useMemo(() => products.filter(product => !term || [
    product.name, product.brand, product.category, product.sku,
    product.seller?.name, product.seller?.email, product.seller?.sellerProfile?.storeName
  ].some(value => String(value || '').toLowerCase().includes(term))), [products, term])
  const filteredUsers = useMemo(() => users.filter(account => !term || [
    account.name, account.email, account.sellerProfile?.storeName,
    account.sellerProfile?.verificationStatus
  ].some(value => String(value || '').toLowerCase().includes(term))), [users, term])
  const filteredOrders = useMemo(() => orders.filter(order => {
    const matchesTerm = !term || [order._id, order.buyer?.name, order.buyer?.email, order.status]
      .some(value => String(value || '').toLowerCase().includes(term))
    const matchesFilter = orderFilter === 'all'
      || (orderFilter === 'cancellations' && order.status === 'CancellationRequested')
      || (orderFilter === 'disputes' && ['Open', 'UnderReview'].includes(order.dispute?.status))
      || (orderFilter === 'refunds' && order.refundStatus && order.refundStatus !== 'None')
      || order.status === orderFilter
    return matchesTerm && matchesFilter
  }), [orders, term, orderFilter])
  const filteredAudit = useMemo(() => auditLogs.filter(log => !term || [
    log.action, log.summary, log.actor?.name, log.actor?.email, log.entityId
  ].some(value => String(value || '').toLowerCase().includes(term))), [auditLogs, term])

  const exportCurrent = () => {
    const date = new Date().toISOString().slice(0, 10)
    if (activeTab === 'products') {
      downloadCsv(`glory-products-${date}.csv`, [
        ['Product', 'Brand', 'Category', 'Seller', 'Price', 'Stock', 'Threshold', 'Quality', 'Status'],
        ...filteredProducts.map(product => [product.name, product.brand, product.category, product.seller?.email, product.price, product.countInStock, product.lowStockThreshold, productQuality(product), product.approvalStatus])
      ])
    } else if (activeTab === 'users') {
      downloadCsv(`glory-users-${date}.csv`, [
        ['Name', 'Email', 'Role', 'Seller status', 'Orders', 'Listings', 'Privacy request', 'Joined'],
        ...filteredUsers.map(account => [account.name, account.email, account.isAdmin ? 'Admin' : account.isSeller ? 'Seller' : 'Buyer', account.sellerProfile?.verificationStatus, orders.filter(order => order.buyer?._id === account._id).length, products.filter(product => product.seller?._id === account._id).length, account.privacy?.deletionStatus, account.createdAt])
      ])
    } else if (activeTab === 'audit') {
      downloadCsv(`glory-audit-${date}.csv`, [
        ['Date', 'Actor', 'Action', 'Entity', 'Entity ID', 'Summary'],
        ...filteredAudit.map(log => [log.createdAt, log.actor?.email, log.action, log.entityType, log.entityId, log.summary])
      ])
    } else {
      downloadCsv(`glory-orders-${date}.csv`, [
        ['Order', 'Customer', 'Email', 'Amount', 'Payment', 'Status', 'Refund status', 'Dispute', 'Date'],
        ...filteredOrders.map(order => [order._id, order.buyer?.name, order.buyer?.email, order.totalPrice, order.isPaid ? 'Paid' : 'Unpaid', order.status, order.refundStatus, order.dispute?.status, order.createdAt])
      ])
    }
  }

  const tabs = ['overview', 'orders', 'products', 'users', 'audit']
  const pendingProducts = products.filter(product => product.approvalStatus === 'pending')

  return (
    <div className='glory-page'>
      <Navbar />
      <main className='glory-container glory-dashboard-container'>
        <header className='glory-dashboard-header'>
          <div>
            <h1>Admin operations</h1>
            <p>Review trust, inventory, support, and marketplace activity from one workspace.</p>
          </div>
          <div className='glory-dashboard-pill'>{pendingProducts.length} awaiting product review</div>
        </header>

        {error && <Message type='error' text={error} />}
        {success && <Message type='success' text={success} />}

        <div className='glory-dashboard-tabs' role='tablist' aria-label='Admin sections'>
          {tabs.map(tab => (
            <button key={tab} type='button' role='tab' aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== 'overview' && (
          <div className='glory-admin-toolbar'>
            <label>
              <FiSearch size={17} />
              <span className='sr-only'>Search this section</span>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${activeTab}`} />
            </label>
            {activeTab === 'orders' && (
              <select value={orderFilter} onChange={event => setOrderFilter(event.target.value)} aria-label='Filter orders'>
                <option value='all'>All orders</option>
                <option value='cancellations'>Cancellation queue</option>
                <option value='disputes'>Active disputes</option>
                <option value='refunds'>Refund activity</option>
                <option value='Processing'>Processing</option>
                <option value='Shipped'>Shipped</option>
                <option value='Delivered'>Delivered</option>
                <option value='Cancelled'>Cancelled</option>
              </select>
            )}
            <button type='button' className='glory-outline-action' onClick={exportCurrent}>
              <FiDownload size={16} /> Export CSV
            </button>
          </div>
        )}

        {loading ? <Loader /> : (
          <>
            {activeTab === 'overview' && <Overview stats={stats} orders={orders} />}
            {activeTab === 'orders' && (
              <OrdersTable orders={filteredOrders} onCancellation={handleCancellation} onDispute={handleDispute} onNote={handleOrderNote} />
            )}
            {activeTab === 'products' && (
              <ProductsTable products={filteredProducts} onApprove={id => handleProductStatus(id, 'approved')} onReject={id => handleProductStatus(id, 'rejected')} onDelete={handleDeleteProduct} />
            )}
            {activeTab === 'users' && (
              <UsersTable users={filteredUsers} orders={orders} products={products} currentUserId={user?._id} onDelete={handleDeleteUser} onMakeSeller={handleMakeSeller} onSellerStatus={handleSellerStatus} onOpenDocument={handleOpenDocument} onDocumentStatus={handleDocumentStatus} />
            )}
            {activeTab === 'audit' && <AuditTable logs={filteredAudit} />}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

const Overview = ({ stats, orders }) => (
  <>
    <div className='glory-dashboard-stats'>
      {[
        { label: 'Total users', value: stats?.totalUsers || 0, icon: <FiUsers size={21} /> },
        { label: 'Products', value: stats?.totalProducts || 0, icon: <FiPackage size={21} /> },
        { label: 'Orders', value: stats?.totalOrders || 0, icon: <FiShoppingBag size={21} /> },
        { label: 'Paid revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: <FiDollarSign size={21} /> }
      ].map(stat => <div key={stat.label} className='glory-dashboard-stat'><div>{stat.icon}</div><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
    </div>
    <div className='glory-operations-queue'>
      {[
        { label: 'Cancellation requests', value: stats?.cancellationRequests || 0, icon: <FiClock /> },
        { label: 'Active disputes', value: stats?.activeDisputes || 0, icon: <FiMessageSquare /> },
        { label: 'Low-stock products', value: stats?.lowStockProducts || 0, icon: <FiAlertTriangle /> },
        { label: 'Seller reviews', value: stats?.pendingSellers || 0, icon: <FiShield /> },
        { label: 'Privacy requests', value: stats?.privacyRequests || 0, icon: <FiFileText /> }
      ].map(item => <div key={item.label}>{item.icon}<span><strong>{item.value}</strong><small>{item.label}</small></span></div>)}
    </div>
    <section className='glory-dashboard-panel'>
      <div className='glory-dashboard-panel-header'>Recent order activity</div>
      <OrderRows orders={orders.slice(0, 6)} />
    </section>
  </>
)

const OrderRows = ({ orders }) => (
  <div className='glory-table-wrap'>
    <table className='glory-dashboard-table'>
      <thead><tr>{['Order', 'Customer', 'Amount', 'Payment', 'Status', 'Date'].map(header => <th key={header}>{header}</th>)}</tr></thead>
      <tbody>{orders.map(order => (
        <tr key={order._id}>
          <td>#{order._id.slice(-8).toUpperCase()}</td><td>{order.buyer?.name || 'N/A'}</td>
          <td><strong>{formatCurrency(order.totalPrice)}</strong></td><td>{order.isPaid ? 'Paid' : 'Unpaid'}</td>
          <td><span className='glory-status-chip'>{order.status}</span></td><td>{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
        </tr>
      ))}</tbody>
    </table>
  </div>
)

const OrdersTable = ({ orders, onCancellation, onDispute, onNote }) => (
  <section className='glory-dashboard-panel'>
    <div className='glory-dashboard-panel-header'>Order operations ({orders.length})</div>
    {orders.length === 0 ? <div className='glory-admin-empty'>No orders match this view.</div> : orders.map(order => (
      <OrderOperation key={order._id} order={order} onCancellation={onCancellation} onDispute={onDispute} onNote={onNote} />
    ))}
  </section>
)

const OrderOperation = ({ order, onCancellation, onDispute, onNote }) => {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [reference, setReference] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [visibility, setVisibility] = useState('admin')
  return (
    <article className='glory-order-operation'>
      <button type='button' className='glory-order-operation-summary' onClick={() => setOpen(!open)} aria-expanded={open}>
        <span><strong>#{order._id.slice(-8).toUpperCase()}</strong><small>{order.buyer?.name} · {order.buyer?.email}</small></span>
        <span><strong>{formatCurrency(order.totalPrice)}</strong><small>{order.status} · {new Date(order.createdAt).toLocaleDateString('en-GB')}</small></span>
        <span className='glory-status-chip'>{order.dispute?.status || order.refundStatus || 'No issue'}</span>
      </button>
      {open && (
        <div className='glory-order-operation-body'>
          <div className='glory-order-facts'>
            <span><b>Payment</b>{order.isPaid ? 'Paid' : 'Unpaid'} via {order.paymentMethod}</span>
            <span><b>Fulfilment</b>{order.orderItems.map(item => `${item.name}: ${item.fulfillmentStatus}`).join(', ')}</span>
            <span><b>Cancellation reason</b>{order.cancellationReason || 'None'}</span>
            <span><b>Refunded</b>{formatCurrency(order.refundedAmount || 0)} · {order.refundStatus || 'None'}</span>
          </div>
          {order.dispute?.openedAt && <div className='glory-admin-dispute'><strong>{order.dispute.type?.replaceAll('_', ' ')} · {order.dispute.status}</strong><p>{order.dispute.message}</p>{order.dispute.resolution && <small>Resolution: {order.dispute.resolution}</small>}</div>}
          {(order.supportNotes || []).length > 0 && <div className='glory-admin-note-list'>{order.supportNotes.map(item => <div key={item._id}><strong>{item.authorRole}{item.visibility === 'admin' ? ' · private' : ''}</strong><p>{item.message}</p></div>)}</div>}
          <div className='glory-order-admin-form'>
            <label>Resolution or note<textarea value={note} maxLength={1000} onChange={event => setNote(event.target.value)} placeholder='Write a concise operational record.' /></label>
            <label>Provider refund reference<input value={reference} onChange={event => setReference(event.target.value)} placeholder='Required before recording a refund' /></label>
            {order.dispute?.openedAt && <label>Refund amount<input type='number' min='0' step='0.01' value={refundAmount} onChange={event => setRefundAmount(event.target.value)} /></label>}
            <label>Note visibility<select value={visibility} onChange={event => setVisibility(event.target.value)}><option value='admin'>Admin only</option><option value='participants'>Buyer and seller</option></select></label>
          </div>
          <div className='glory-order-admin-actions'>
            {order.status === 'CancellationRequested' && <><button type='button' className='glory-btn' onClick={() => onCancellation(order._id, { decision: 'approve', note, providerReference: reference })}>Confirm refund & cancel</button><button type='button' className='glory-outline-action' onClick={() => onCancellation(order._id, { decision: 'reject', note })}>Decline cancellation</button></>}
            {order.dispute?.openedAt && !['Resolved', 'Closed'].includes(order.dispute.status) && <><button type='button' className='glory-btn' onClick={() => onDispute(order._id, { status: 'Resolved', resolution: note, refundAmount: refundAmount || 0, providerReference: reference })}>Resolve dispute</button><button type='button' className='glory-outline-action' onClick={() => onDispute(order._id, { status: 'UnderReview', resolution: note })}>Mark under review</button></>}
            <button type='button' className='glory-outline-action' disabled={note.trim().length < 2} onClick={() => onNote(order._id, { message: note, visibility })}>Add support note</button>
          </div>
        </div>
      )}
    </article>
  )
}

const ProductsTable = ({ products, onApprove, onReject, onDelete }) => (
  <section className='glory-dashboard-panel'>
    <div className='glory-dashboard-panel-header'>Product moderation ({products.length})</div>
    <div className='glory-table-wrap'><table className='glory-dashboard-table'>
      <thead><tr>{['Product', 'Seller', 'Price', 'Inventory', 'Quality', 'Status', 'Actions'].map(header => <th key={header}>{header}</th>)}</tr></thead>
      <tbody>{products.map(product => {
        const quality = productQuality(product)
        const lowStock = product.countInStock <= (product.lowStockThreshold ?? 5)
        return <tr key={product._id}>
          <td><div className='glory-dashboard-product-cell'><img src={product.image} alt='' loading='lazy' width='48' height='48' /><div><strong>{product.name}</strong><span>{product.brand} · {product.category}</span></div></div></td>
          <td><div className='glory-dashboard-seller-cell'><strong>{product.seller?.sellerProfile?.storeName || product.seller?.name || 'Admin'}</strong><span>{product.seller?.email || 'Platform product'}</span></div></td>
          <td><strong>{formatCurrency(product.price)}</strong></td>
          <td><span className={lowStock ? 'glory-low-stock' : ''}>{product.countInStock} / alert at {product.lowStockThreshold ?? 5}</span></td>
          <td><span className={`glory-quality-score is-${quality >= 80 ? 'good' : quality >= 50 ? 'fair' : 'poor'}`}>{quality}%</span></td>
          <td><span className='glory-status-chip'>{product.approvalStatus || 'pending'}</span></td>
          <td><div className='glory-table-actions'>{product.approvalStatus !== 'approved' && <button onClick={() => onApprove(product._id)} className='success' aria-label={`Approve ${product.name}`}><FiCheckCircle /></button>}{product.approvalStatus !== 'rejected' && <button onClick={() => onReject(product._id)} className='warning' aria-label={`Reject ${product.name}`}><FiXCircle /></button>}<button onClick={() => onDelete(product._id)} className='danger' aria-label={`Delete ${product.name}`}><FiTrash2 /></button></div></td>
        </tr>
      })}</tbody>
    </table></div>
  </section>
)

const UsersTable = ({ users, orders, products, currentUserId, onDelete, onMakeSeller, onSellerStatus, onOpenDocument, onDocumentStatus }) => (
  <section className='glory-dashboard-panel'>
    <div className='glory-dashboard-panel-header'>Customer and seller history ({users.length})</div>
    <div className='glory-table-wrap'><table className='glory-dashboard-table'>
      <thead><tr>{['Account', 'Role', 'History', 'Trust', 'Documents', 'Privacy', 'Actions'].map(header => <th key={header}>{header}</th>)}</tr></thead>
      <tbody>{users.map(account => {
        const orderCount = orders.filter(order => order.buyer?._id === account._id).length
        const listingCount = products.filter(product => product.seller?._id === account._id).length
        return <tr key={account._id}>
          <td><div className='glory-dashboard-user-cell'><span>{account.name?.charAt(0).toUpperCase()}</span><div><strong>{account.name}</strong><small>{account.email}</small></div></div></td>
          <td>{account.isAdmin ? 'Admin' : account.isSeller ? 'Seller' : 'Buyer'}</td>
          <td>{orderCount} orders<br />{listingCount} listings</td>
          <td><span className='glory-status-chip'>{account.isSeller ? account.sellerProfile?.verificationStatus || 'incomplete' : account.isEmailVerified === false ? 'email pending' : 'verified email'}</span></td>
          <td>{account.sellerProfile?.documents?.length ? <div className='glory-admin-documents'>{account.sellerProfile.documents.map(document => <div key={document._id} className={`is-${document.status}`}><button type='button' onClick={() => onOpenDocument(account._id, document._id)} title={`Open ${document.type}`}><FiFileText /> {document.type}</button>{document.status !== 'approved' && <button type='button' onClick={() => onDocumentStatus(account._id, document._id, 'approved')} aria-label={`Approve ${document.type}`}><FiCheckCircle /></button>}{document.status !== 'rejected' && <button type='button' onClick={() => onDocumentStatus(account._id, document._id, 'rejected')} aria-label={`Reject ${document.type}`}><FiXCircle /></button>}</div>)}</div> : 'None'}</td>
          <td>{account.privacy?.deletionStatus === 'pending' ? <span className='glory-privacy-request'>Deletion requested</span> : 'None'}</td>
          <td>{account._id !== currentUserId && <div className='glory-table-actions'>{!account.isSeller && <button onClick={() => onMakeSeller(account._id)} className='success' aria-label={`Make ${account.name} a seller`}><FiUserPlus /></button>}{account.isSeller && account.sellerProfile?.verificationStatus !== 'verified' && <button onClick={() => onSellerStatus(account._id, 'verified')} className='success' aria-label={`Verify ${account.name}`}><FiCheckCircle /></button>}{account.isSeller && account.sellerProfile?.verificationStatus !== 'rejected' && <button onClick={() => onSellerStatus(account._id, 'rejected')} className='warning' aria-label={`Reject ${account.name}`}><FiXCircle /></button>}<button onClick={() => onDelete(account._id)} className='danger' aria-label={`Delete ${account.name}`}><FiTrash2 /></button></div>}</td>
        </tr>
      })}</tbody>
    </table></div>
  </section>
)

const AuditTable = ({ logs }) => (
  <section className='glory-dashboard-panel'>
    <div className='glory-dashboard-panel-header'><FiActivity /> Administrative audit trail ({logs.length})</div>
    <div className='glory-audit-list'>{logs.length ? logs.map(log => <article key={log._id}><FiActivity /><div><strong>{log.action.replaceAll('_', ' ')}</strong><p>{log.summary}</p><small>{log.actor?.name || 'System'} · {new Date(log.createdAt).toLocaleString('en-GB')} · {log.entityType} {log.entityId.slice(-8)}</small></div></article>) : <div className='glory-admin-empty'>No audit events match this search.</div>}</div>
  </section>
)

export default AdminDashboardPage
