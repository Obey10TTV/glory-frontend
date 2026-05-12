import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { useUser } from '../context/UserContext'
import { getProducts, createProduct, uploadImage } from '../api'
import { FiPlus, FiPackage, FiDollarSign, FiEye, FiX } from 'react-icons/fi'
import Message from '../components/Message'

const SellerDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
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

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!user.isSeller) { navigate('/'); return }
    fetchProducts()
  }, [user])

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts()
      const myProducts = data.filter(p => p.seller === user._id)
      setProducts(myProducts)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await uploadImage(formData)
      setImage(data.url)
    } catch (err) {
      setError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAddProduct = async () => {
    if (!name || !price || !description || !category || !brand || !countInStock || !image) {
      setError('Please fill in all fields and upload an image')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createProduct({
        name, price: Number(price),
        description, category, brand,
        countInStock: Number(countInStock), image
      })
      setSuccess('Product added successfully!')
      setShowAddProduct(false)
      setName(''); setPrice(''); setDescription('')
      setCategory(''); setBrand(''); setCountInStock(''); setImage('')
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product')
    } finally {
      setSubmitting(false)
    }
  }

  const totalRevenue = products.reduce((acc, p) => acc + (p.price * (50 - p.countInStock)), 0)

  return (
    <div style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111' }}>
              Seller Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              Welcome back, {user?.name}
            </p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className='glory-btn'
            style={{ padding: '12px 24px', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <FiPlus size={16} /> Add Product
          </button>
        </div>

        {/* STATS */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px', marginBottom: '32px'
        }}>
          {[
            { label: 'Total Products', value: products.length, icon: <FiPackage size={20} />, color: '#c97a9a' },
            { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: <FiDollarSign size={20} />, color: '#2ecc71' },
            { label: 'Total Views', value: '0', icon: <FiEye size={20} />, color: '#3498db' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '14px',
              padding: '24px', border: '0.5px solid #eee',
              display: 'flex', alignItems: 'center', gap: '16px'
            }}>
              <div style={{
                width: '48px', height: '48px',
                borderRadius: '12px',
                background: `${stat.color}15`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                color: stat.color
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#111' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCTS */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '0.5px solid #eee', overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '0.5px solid #eee',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>
              My Products
            </div>
          </div>

          {loading ? <Loader /> : products.length === 0 ? (
            <div style={{
              padding: '60px', textAlign: 'center'
            }}>
              <FiPackage size={40} style={{ color: '#ddd', marginBottom: '16px' }} />
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>
                No products yet
              </div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                Add your first product to start selling on Glory
              </div>
              <button
                onClick={() => setShowAddProduct(true)}
                className='glory-btn'
                style={{ padding: '12px 24px', fontSize: '13px' }}
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafaf9' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating'].map(h => (
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
                {products.map((product, i) => (
                  <tr key={product._id} style={{
                    borderTop: '0.5px solid #eee'
                  }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: '44px', height: '44px',
                            borderRadius: '8px', objectFit: 'cover',
                            background: '#fdf0f5'
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#aaa' }}>
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555' }}>
                      {product.category}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#111' }}>
                      ₦{product.price.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        background: product.countInStock > 0 ? '#f0fdf4' : '#fef2f2',
                        color: product.countInStock > 0 ? '#2ecc71' : '#e74c3c',
                        padding: '3px 10px', borderRadius: '999px',
                        fontSize: '11px', fontWeight: '600'
                      }}>
                        {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555' }}>
                      ★ {product.rating.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddProduct && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '32px', width: '100%', maxWidth: '560px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '24px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>
                Add New Product
              </div>
              <button
                onClick={() => setShowAddProduct(false)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#888'
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {error && <Message type='error' text={error} />}
            {success && <Message type='success' text={success} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* IMAGE UPLOAD */}
              <div>
                <label style={labelStyle}>Product Image</label>
                <div style={{
                  border: '1.5px dashed #ddd', borderRadius: '12px',
                  padding: '20px', textAlign: 'center',
                  background: '#fafaf9', cursor: 'pointer',
                  position: 'relative'
                }}>
                  {image ? (
                    <img
                      src={image}
                      alt='preview'
                      style={{
                        width: '120px', height: '120px',
                        objectFit: 'cover', borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <div>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        {uploading ? 'Uploading...' : 'Click to upload product image'}
                      </div>
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    style={{
                      position: 'absolute', inset: 0,
                      opacity: 0, cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Product Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder='e.g. Vitamin C Serum' style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Brand</label>
                <input value={brand} onChange={e => setBrand(e.target.value)}
                  placeholder='e.g. Nuban Skin' style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Price (₦)</label>
                  <input value={price} onChange={e => setPrice(e.target.value)}
                    placeholder='e.g. 8500' type='number' style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stock Quantity</label>
                  <input value={countInStock} onChange={e => setCountInStock(e.target.value)}
                    placeholder='e.g. 50' type='number' style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
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
                  onChange={e => setDescription(e.target.value)}
                  placeholder='Describe your product...'
                  rows={4}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              <button
                onClick={handleAddProduct}
                disabled={submitting || uploading}
                className='glory-btn'
                style={{
                  width: '100%', padding: '14px', fontSize: '14px',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Adding Product...' : 'Add Product'}
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

export default SellerDashboardPage