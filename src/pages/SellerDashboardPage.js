import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { useUser } from '../context/UserContext'
import { createProduct, deleteProduct, getMySellerProducts, uploadImage } from '../api'
import { FiClock, FiCheckCircle, FiImage, FiPackage, FiPlus, FiTrash2, FiX, FiXCircle } from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'

const SellerDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [countInStock, setCountInStock] = useState('')
  const [image, setImage] = useState('')

  const categories = [
    'Skincare', 'Haircare', 'Makeup', 'Nails', 'Lashes',
    'Body Care', 'Body Liquid', 'Fragrance', 'Scented Candles',
    'Tools & Accessories'
  ]

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await getMySellerProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load seller products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!user.isSeller) {
      navigate('/')
      return
    }
    fetchProducts()
  }, [user, navigate, fetchProducts])

  const resetForm = () => {
    setName('')
    setPrice('')
    setDescription('')
    setCategory('')
    setBrand('')
    setCountInStock('')
    setImage('')
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await uploadImage(formData)
      setImage(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAddProduct = async () => {
    const numericPrice = Number(price)
    const numericStock = Number(countInStock)

    if (!name || !price || !description || !category || !brand || !countInStock || !image) {
      setError('Please fill in all fields and upload an image')
      return
    }

    if (numericPrice <= 0 || numericStock < 0) {
      setError('Please enter a valid price and stock quantity')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await createProduct({
        name,
        price: numericPrice,
        description,
        category,
        brand,
        countInStock: numericStock,
        image
      })
      setSuccess('Product submitted for review.')
      setShowAddProduct(false)
      resetForm()
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      setProducts(current => current.filter(product => product._id !== id))
      setSuccess('Product deleted successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const statusMeta = (status = 'pending') => {
    if (status === 'approved') {
      return { label: 'Approved', color: '#2ecc71', icon: <FiCheckCircle size={14} />, note: 'Live in the storefront.' }
    }
    if (status === 'rejected') {
      return { label: 'Rejected', color: '#e74c3c', icon: <FiXCircle size={14} />, note: 'Needs changes before it can go live.' }
    }
    return { label: 'Pending', color: '#f39c12', icon: <FiClock size={14} />, note: 'Waiting for admin review.' }
  }

  const approvedProducts = products.filter(product => product.approvalStatus === 'approved')
  const pendingProducts = products.filter(product => product.approvalStatus === 'pending' || !product.approvalStatus)
  const rejectedProducts = products.filter(product => product.approvalStatus === 'rejected')
  const inventoryValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.countInStock || 0), 0)

  return (
    <div className='glory-page'>
      <Navbar />

      <div className='glory-container glory-dashboard-container'>
        <div className='glory-dashboard-header'>
          <div>
            <h1>Seller Dashboard</h1>
            <p>Welcome back, {user?.name}. Manage your products and review status.</p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className='glory-btn glory-dashboard-primary-action'
          >
            <FiPlus size={16} /> Add Product
          </button>
        </div>

        {error && <Message type='error' text={error} />}
        {success && <Message type='success' text={success} />}

        <div className='glory-dashboard-stats'>
          {[
            { label: 'Total Products', value: products.length, icon: <FiPackage size={22} />, color: '#b85f83', bg: '#f8e8ee' },
            { label: 'Approved Live', value: approvedProducts.length, icon: <FiCheckCircle size={22} />, color: '#2ecc71', bg: '#eef8f1' },
            { label: 'Pending Review', value: pendingProducts.length, icon: <FiClock size={22} />, color: '#f39c12', bg: '#fbf1dd' },
            { label: 'Inventory Value', value: formatCurrency(inventoryValue), icon: <FiPackage size={22} />, color: '#416b5f', bg: '#eef5f2' }
          ].map(stat => (
            <div key={stat.label} className='glory-dashboard-stat'>
              <div style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <section className='glory-dashboard-panel'>
          <div className='glory-dashboard-panel-header'>
            My Products ({products.length})
          </div>

          {loading ? <Loader /> : products.length === 0 ? (
            <div className='glory-empty-state'>
              <FiPackage size={42} />
              <strong>No products yet</strong>
              <span>Upload your first product and the Glory team will review it before it goes live.</span>
              <button onClick={() => setShowAddProduct(true)} className='glory-btn'>
                <FiPlus size={16} /> Add Your First Product
              </button>
            </div>
          ) : (
            <div className='glory-table-wrap'>
              <table className='glory-dashboard-table'>
                <thead>
                  <tr>
                    {['Product', 'Price', 'Stock', 'Status', 'Notes', 'Actions'].map(header => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const meta = statusMeta(product.approvalStatus)
                    return (
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
                        <td><strong>{formatCurrency(product.price)}</strong></td>
                        <td>{product.countInStock}</td>
                        <td>
                          <span className='glory-status-chip' style={{ color: meta.color, background: `${meta.color}15` }}>
                            {meta.icon} {meta.label}
                          </span>
                        </td>
                        <td>
                          <span className='glory-dashboard-note'>
                            {product.approvalStatus === 'rejected' && product.rejectionReason
                              ? product.rejectionReason
                              : meta.note}
                          </span>
                        </td>
                        <td>
                          <div className='glory-table-actions'>
                            <button onClick={() => handleDeleteProduct(product._id)} className='danger' aria-label={`Delete ${product.name}`}>
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {rejectedProducts.length > 0 && (
          <div className='glory-dashboard-callout'>
            <strong>{rejectedProducts.length} product{rejectedProducts.length === 1 ? '' : 's'} need attention.</strong>
            <span>Delete and resubmit with clearer photos, descriptions or inventory details.</span>
          </div>
        )}
      </div>

      {showAddProduct && (
        <div className='glory-modal-backdrop'>
          <div className='glory-product-modal'>
            <div className='glory-modal-header'>
              <div>
                <strong>Add Product</strong>
                <span>Products are reviewed before they appear in the storefront.</span>
              </div>
              <button onClick={() => setShowAddProduct(false)} aria-label='Close product form'>
                <FiX size={20} />
              </button>
            </div>

            {error && <Message type='error' text={error} />}

            <div className='glory-product-form'>
              <div>
                <label style={labelStyle}>Product Image</label>
                <div className='glory-upload-box'>
                  {image ? (
                    <img src={image} alt='Product preview' />
                  ) : (
                    <div>
                      <FiImage size={28} />
                      <span>{uploading ? 'Uploading...' : 'Click to upload product image'}</span>
                    </div>
                  )}
                  <input type='file' accept='image/*' onChange={handleImageUpload} />
                </div>
              </div>

              <div className='glory-form-grid'>
                <div>
                  <label style={labelStyle}>Product Name</label>
                  <input value={name} onChange={event => setName(event.target.value)} placeholder='e.g. Vitamin C Serum' style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input value={brand} onChange={event => setBrand(event.target.value)} placeholder='e.g. Glow Lab' style={inputStyle} />
                </div>
              </div>

              <div className='glory-form-grid'>
                <div>
                  <label style={labelStyle}>Price (CAD)</label>
                  <input value={price} onChange={event => setPrice(event.target.value)} placeholder='e.g. 18' type='number' min='0' step='0.01' style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stock Quantity</label>
                  <input value={countInStock} onChange={event => setCountInStock(event.target.value)} placeholder='e.g. 50' type='number' min='0' style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select value={category} onChange={event => setCategory(event.target.value)} style={inputStyle}>
                  <option value=''>Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                  placeholder='Describe texture, size, shade, ingredients, usage or what makes it special.'
                  rows={4}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              <button
                onClick={handleAddProduct}
                disabled={submitting || uploading}
                className='glory-btn'
                style={{ width: '100%', opacity: submitting || uploading ? 0.7 : 1 }}
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
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
  fontFamily: 'inherit'
}

export default SellerDashboardPage
