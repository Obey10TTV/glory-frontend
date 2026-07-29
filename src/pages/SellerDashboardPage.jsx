import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { useUser } from '../context/UserContext'
import {
  createProduct,
  deleteProduct,
  getMySellerProducts,
  getSellerPaymentStatus,
  getSellerOrders,
  getUserProfile,
  initializeSellerActivation,
  initializeSellerPayouts,
  updateSellerOrderStatus,
  updateProduct,
  updateSellerProfile,
  uploadImage,
  uploadSellerDocument,
  verifySellerActivation
} from '../api'
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiImage,
  FiPackage,
  FiPlus,
  FiSave,
  FiShield,
  FiTrash2,
  FiTruck,
  FiX,
  FiXCircle
} from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'

const emptySellerProfile = {
  storeName: '',
  bio: '',
  businessEmail: '',
  phone: '',
  city: '',
  province: '',
  country: 'United Kingdom',
  website: '',
  instagram: '',
  acceptedPaymentMethods: ['card'],
  activationStatus: 'unpaid',
  payoutStatus: 'not_started',
  verificationStatus: 'incomplete',
  verificationNote: ''
}

const emptySellerPayments = {
  activation: {
    required: true,
    feePence: 2000,
    currency: 'GBP',
    status: 'unpaid'
  },
  payouts: {
    status: 'not_started',
    detailsSubmitted: false,
    chargesEnabled: false,
    payoutsEnabled: false
  },
  acceptedPaymentMethods: ['card'],
  paymentMethods: []
}

const priceGuidance = {
  Skincare: [12, 95], Haircare: [10, 75], Makeup: [10, 85], Nails: [8, 55],
  Lashes: [8, 45], 'Body Care': [10, 70], 'Body Liquid': [8, 55],
  Fragrance: [18, 180], 'Scented Candles': [16, 85], 'Tools & Accessories': [8, 120]
}

const SellerDashboardPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, login } = useUser()
  const userId = user?._id
  const userIsSeller = user?.isSeller
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [sellerProfile, setSellerProfile] = useState(emptySellerProfile)
  const [sellerPayments, setSellerPayments] = useState(emptySellerPayments)
  const [paymentAction, setPaymentAction] = useState('')
  const [documentUploading, setDocumentUploading] = useState('')
  const [trackingByItem, setTrackingByItem] = useState({})
  const [orderUpdating, setOrderUpdating] = useState('')

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [sku, setSku] = useState('')
  const [size, setSize] = useState('')
  const [productType, setProductType] = useState('')
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [barcode, setBarcode] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [howToUse, setHowToUse] = useState('')
  const [keyBenefits, setKeyBenefits] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [countInStock, setCountInStock] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState('5')
  const [image, setImage] = useState('')
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])

  const categories = [
    'Skincare', 'Haircare', 'Makeup', 'Nails', 'Lashes',
    'Body Care', 'Body Liquid', 'Fragrance', 'Scented Candles',
    'Tools & Accessories'
  ]

  const normalizeSellerProfile = (profile = {}) => ({
    ...emptySellerProfile,
    ...profile
  })

  const refreshSellerPaymentStatus = useCallback(async () => {
    const { data } = await getSellerPaymentStatus()
    setSellerPayments({
      ...emptySellerPayments,
      ...data,
      activation: { ...emptySellerPayments.activation, ...(data.activation || {}) },
      payouts: { ...emptySellerPayments.payouts, ...(data.payouts || {}) }
    })
    return data
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const [productResponse, orderResponse] = await Promise.all([
        getMySellerProducts(),
        getSellerOrders()
      ])
      setProducts(Array.isArray(productResponse.data) ? productResponse.data : [])
      setOrders(Array.isArray(orderResponse.data) ? orderResponse.data : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load seller products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      navigate('/login')
      return
    }
    if (!userIsSeller) {
      navigate('/')
      return
    }
    fetchProducts()
  }, [userId, userIsSeller, navigate, fetchProducts])

  useEffect(() => {
    if (!userIsSeller) return

    let active = true

    const fetchSellerProfile = async () => {
      try {
        const [{ data }, paymentData] = await Promise.all([
          getUserProfile(),
          refreshSellerPaymentStatus().catch(() => null)
        ])
        if (!active) return
        setSellerProfile(normalizeSellerProfile(data.sellerProfile))
        login(data)
        if (paymentData?.acceptedPaymentMethods) {
          setSellerProfile(current => ({
            ...current,
            acceptedPaymentMethods: paymentData.acceptedPaymentMethods
          }))
        }
      } catch (err) {
        if (active) {
          setSellerProfile(emptySellerProfile)
        }
      }
    }

    fetchSellerProfile()

    return () => {
      active = false
    }
  }, [userId, userIsSeller, login, refreshSellerPaymentStatus])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!userIsSeller || searchParams.get('activation') !== 'success' || !sessionId) return

    let active = true
    setPaymentAction('activation-verify')
    verifySellerActivation(sessionId)
      .then(async () => {
        if (!active) return
        await refreshSellerPaymentStatus()
        const { data } = await getUserProfile()
        if (!active) return
        setSellerProfile(normalizeSellerProfile(data.sellerProfile))
        login(data)
        setSuccess('Seller activation payment confirmed.')
        setSearchParams({}, { replace: true })
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Could not verify seller activation payment')
      })
      .finally(() => {
        if (active) setPaymentAction('')
      })

    return () => {
      active = false
    }
  }, [
    userIsSeller,
    searchParams,
    setSearchParams,
    refreshSellerPaymentStatus,
    login
  ])

  const resetProductForm = () => {
    setName('')
    setPrice('')
    setCompareAtPrice('')
    setSku('')
    setSize('')
    setProductType('')
    setCountryOfOrigin('')
    setBarcode('')
    setDescription('')
    setIngredients('')
    setHowToUse('')
    setKeyBenefits('')
    setCategory('')
    setBrand('')
    setCountInStock('')
    setLowStockThreshold('5')
    setImage('')
    setImages([])
    setVariants([])
    setEditingProduct(null)
  }

  const openNewProductForm = () => {
    const profileVerified = sellerProfile.verificationStatus === 'verified'
    const accountSecured = Boolean(user?.twoFactorEnabled)
    const activationComplete = !sellerPayments.activation.required
      || ['paid', 'waived'].includes(sellerPayments.activation.status)
    const payoutsComplete = sellerPayments.payouts.status === 'active'
    if (!user?.isAdmin && (!profileVerified || !accountSecured || !activationComplete || !payoutsComplete)) {
      setError('Complete verification, activation, two-factor authentication and payout onboarding before adding products.')
      return
    }
    resetProductForm()
    setError('')
    setShowProductForm(true)
  }

  const openEditProductForm = (product) => {
    setEditingProduct(product)
    setName(product.name || '')
    setPrice(String(product.price || ''))
    setCompareAtPrice(product.compareAtPrice ? String(product.compareAtPrice) : '')
    setSku(product.sku || '')
    setSize(product.size || '')
    setProductType(product.productType || '')
    setCountryOfOrigin(product.countryOfOrigin || '')
    setBarcode(product.barcode || '')
    setDescription(product.description || '')
    setIngredients(product.ingredients || '')
    setHowToUse(product.howToUse || '')
    setKeyBenefits((product.keyBenefits || []).join('\n'))
    setCategory(product.category || '')
    setBrand(product.brand || '')
    setCountInStock(String(product.countInStock || 0))
    setLowStockThreshold(String(product.lowStockThreshold ?? 5))
    setImage(product.image || '')
    setImages(product.images || [])
    setVariants((product.variants || []).map(variant => ({
      _id: variant._id,
      name: variant.name || '',
      sku: variant.sku || '',
      price: variant.price || '',
      countInStock: variant.countInStock ?? 0,
      image: variant.image || ''
    })))
    setError('')
    setShowProductForm(true)
  }

  const closeProductForm = () => {
    setShowProductForm(false)
    resetProductForm()
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

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 6 - images.length))
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const uploadedUrls = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)
        const { data } = await uploadImage(formData)
        uploadedUrls.push(data.url)
      }
      setImages(current => [...current, ...uploadedUrls].slice(0, 6))
    } catch (err) {
      setError(err.response?.data?.message || 'Gallery upload failed')
    } finally {
      setUploading(false)
    }
  }

  const updateVariant = (index, field, value) => {
    setVariants(current => current.map((variant, variantIndex) => (
      variantIndex === index ? { ...variant, [field]: value } : variant
    )))
  }

  const getProductPayload = () => {
    const numericPrice = Number(price)
    const numericCompareAtPrice = compareAtPrice ? Number(compareAtPrice) : undefined
    const numericStock = Number(countInStock)
    const numericLowStockThreshold = Number(lowStockThreshold)

    const benefitList = keyBenefits.split('\n').map(item => item.trim()).filter(Boolean).slice(0, 8)
    if (!name || !price || description.trim().length < 40 || !category || !brand || !productType || !countryOfOrigin || countInStock === '' || !image || images.length < 1 || benefitList.length < 2) {
      return { error: 'Complete the required listing details, add two benefits, and upload a primary plus gallery image.' }
    }

    if (numericPrice <= 0 || numericStock < 0 || numericLowStockThreshold < 0) {
      return { error: 'Please enter a valid price and stock quantity' }
    }

    if (numericCompareAtPrice && numericCompareAtPrice <= numericPrice) {
      return { error: 'Compare-at price must be higher than the selling price' }
    }

    return {
      payload: {
        name,
        price: numericPrice,
        compareAtPrice: numericCompareAtPrice,
        sku,
        size,
        productType,
        countryOfOrigin,
        barcode,
        description,
        ingredients,
        howToUse,
        keyBenefits: benefitList,
        category,
        brand,
        countInStock: numericStock,
        lowStockThreshold: numericLowStockThreshold,
        image,
        images,
        variants: variants.map(variant => ({
          name: variant.name.trim(),
          sku: variant.sku.trim(),
          price: variant.price === '' ? undefined : Number(variant.price),
          countInStock: Number(variant.countInStock) || 0,
          image: variant.image || ''
        })).filter(variant => variant.name)
      }
    }
  }

  const handleSaveProduct = async () => {
    const { payload, error: payloadError } = getProductPayload()

    if (payloadError) {
      setError(payloadError)
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload)
        setSuccess('Product updated and resubmitted for review.')
      } else {
        await createProduct(payload)
        setSuccess('Product submitted for review.')
      }
      closeProductForm()
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
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

  const handleProfileChange = (field, value) => {
    setSellerProfile(current => ({
      ...current,
      [field]: value
    }))
  }

  const handlePaymentMethodToggle = (method) => {
    const enabled = sellerPayments.paymentMethods.find(item => item.code === method)?.enabled
    if (!enabled) return
    setSellerProfile(current => {
      const selected = current.acceptedPaymentMethods || ['card']
      const next = selected.includes(method)
        ? selected.filter(item => item !== method)
        : [...selected, method]
      return {
        ...current,
        acceptedPaymentMethods: next.length ? next : selected
      }
    })
  }

  const handleDocumentUpload = async (type, file) => {
    if (!file) return
    setDocumentUploading(type)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('document', file)
      await uploadSellerDocument(formData)
      const { data } = await getUserProfile()
      setSellerProfile(normalizeSellerProfile(data.sellerProfile))
      login(data)
      setSuccess('Document uploaded privately for verification.')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification document upload failed')
    } finally {
      setDocumentUploading('')
    }
  }

  const handleFulfillment = async (orderId, itemId, status) => {
    const trackingNumber = trackingByItem[itemId] || ''
    setOrderUpdating(itemId)
    setError('')
    try {
      const { data } = await updateSellerOrderStatus(orderId, { itemId, status, trackingNumber })
      setOrders(current => current.map(order => order._id === orderId ? data : order))
      setSuccess(status === 'Shipped' ? 'Shipment and tracking saved.' : 'Order item marked delivered.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update fulfilment')
    } finally {
      setOrderUpdating('')
    }
  }

  const handleSaveSellerProfile = async (submitForReview = false) => {
    setProfileSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await updateSellerProfile({
        ...sellerProfile,
        submitForReview
      })
      setSellerProfile(normalizeSellerProfile(data.sellerProfile))
      login(data)
      setSuccess(submitForReview ? 'Store profile submitted for verification.' : 'Store profile saved.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save seller profile')
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handleSellerActivation = async () => {
    setPaymentAction('activation')
    setError('')
    try {
      const { data } = await initializeSellerActivation()
      if (data.alreadyActive) {
        await refreshSellerPaymentStatus()
        setSuccess('Your seller account is already activated.')
        setPaymentAction('')
        return
      }
      window.location.assign(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start seller activation payment')
      setPaymentAction('')
    }
  }

  const handlePayoutOnboarding = async () => {
    setPaymentAction('payout')
    setError('')
    try {
      const { data } = await initializeSellerPayouts()
      window.location.assign(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start secure payout onboarding')
      setPaymentAction('')
    }
  }

  const statusMeta = (status = 'pending') => {
    if (status === 'approved') {
      return { label: 'Approved', color: '#2ecc71', icon: <FiCheckCircle size={14} />, note: 'Live in the storefront.' }
    }
    if (status === 'rejected') {
      return { label: 'Rejected', color: '#e74c3c', icon: <FiXCircle size={14} />, note: 'Edit and resubmit this product for review.' }
    }
    return { label: 'Pending', color: '#f39c12', icon: <FiClock size={14} />, note: 'Waiting for admin review.' }
  }

  const sellerStatusMeta = (status = 'incomplete') => {
    if (status === 'verified') {
      return { label: 'Verified seller', color: '#2ecc71', icon: <FiCheckCircle size={14} /> }
    }
    if (status === 'pending') {
      return { label: 'Verification pending', color: '#f39c12', icon: <FiClock size={14} /> }
    }
    if (status === 'rejected') {
      return { label: 'Needs changes', color: '#e74c3c', icon: <FiXCircle size={14} /> }
    }
    return { label: 'Setup incomplete', color: '#888', icon: <FiShield size={14} /> }
  }

  const approvedProducts = products.filter(product => product.approvalStatus === 'approved')
  const pendingProducts = products.filter(product => product.approvalStatus === 'pending' || !product.approvalStatus)
  const rejectedProducts = products.filter(product => product.approvalStatus === 'rejected')
  const inventoryValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.countInStock || 0), 0)
  const sellerMeta = sellerStatusMeta(sellerProfile.verificationStatus)
  const twoFactorEnabled = Boolean(user?.twoFactorEnabled)
  const activationReady = !sellerPayments.activation.required
    || ['paid', 'waived'].includes(sellerPayments.activation.status)
  const payoutReady = sellerPayments.payouts.status === 'active'
  const sellerCanSubmitProducts = Boolean(
    user?.isAdmin
    || (user?.isEmailVerified !== false
      && sellerProfile.verificationStatus === 'verified'
      && activationReady
      && payoutReady
      && twoFactorEnabled)
  )
  const documentRequirements = [
    { type: 'identity', label: 'Government ID', help: 'Passport, UK driving licence, or accepted national photo ID.' },
    { type: 'business', label: 'Business document', help: 'Registration, incorporation, or sole proprietor record.' },
    { type: 'address', label: 'Proof of address', help: 'Recent utility, bank, or official address statement.' }
  ]
  const sellerDocuments = sellerProfile.documents || []
  const sellerOrderItems = (order) => order.orderItems.filter(item => {
    const sellerId = item.seller?._id || item.seller
    return user?.isAdmin || String(sellerId) === String(userId)
  })

  return (
    <div className='glory-page'>
      <Navbar />

      <div className='glory-container glory-dashboard-container'>
        <div className='glory-dashboard-header'>
          <div>
            <h1>Seller Dashboard</h1>
            <p>Welcome back, {user?.name}. Set up your store, submit products and track verification.</p>
          </div>
          <button
            onClick={openNewProductForm}
            className='glory-btn glory-dashboard-primary-action'
            disabled={!sellerCanSubmitProducts}
            title={sellerCanSubmitProducts ? 'Add a product' : 'Complete seller verification and 2FA first'}
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

        {!sellerCanSubmitProducts && (
          <div className='glory-dashboard-callout glory-dashboard-security-gate'>
            <span className='glory-dashboard-security-icon'><FiShield size={21} /></span>
            <div>
              <strong>Finish seller security before listing products.</strong>
              <span>
                Glory requires an approved store, 2FA, seller activation and secure payout onboarding before product submissions open.
              </span>
            </div>
            <div className='glory-dashboard-security-actions'>
              {sellerProfile.verificationStatus !== 'verified' && (
                <button
                  type='button'
                  onClick={() => document.getElementById('seller-store-setup')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Review store setup
                </button>
              )}
              {!twoFactorEnabled && (
                <button type='button' onClick={() => navigate('/account')}>
                  Set up 2FA
                </button>
              )}
              {sellerProfile.verificationStatus === 'verified' && twoFactorEnabled && !activationReady && (
                <button type='button' onClick={handleSellerActivation}>
                  Activate selling
                </button>
              )}
              {sellerProfile.verificationStatus === 'verified' && twoFactorEnabled && activationReady && !payoutReady && (
                <button type='button' onClick={handlePayoutOnboarding}>
                  Set up payouts
                </button>
              )}
            </div>
          </div>
        )}

        <section id='seller-store-setup' className='glory-dashboard-panel glory-seller-profile-panel'>
          <div className='glory-dashboard-panel-header glory-dashboard-panel-header-split'>
            <div>
              <span>Store Setup</span>
              <small>Complete this before product approvals become smoother.</small>
            </div>
            <span className='glory-status-chip' style={{ color: sellerMeta.color, background: `${sellerMeta.color}15` }}>
              {sellerMeta.icon} {sellerMeta.label}
            </span>
          </div>

          <div className='glory-seller-profile-body'>
            {sellerProfile.verificationStatus === 'rejected' && sellerProfile.verificationNote && (
              <div className='glory-dashboard-callout danger'>
                <strong>Verification needs changes.</strong>
                <span>{sellerProfile.verificationNote}</span>
              </div>
            )}

            <div className='glory-form-grid'>
              <div>
                <label style={labelStyle}>Store Name</label>
                <input value={sellerProfile.storeName} onChange={event => handleProfileChange('storeName', event.target.value)} placeholder='e.g. Glow Lab Beauty' style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Business Email</label>
                <input value={sellerProfile.businessEmail} onChange={event => handleProfileChange('businessEmail', event.target.value)} placeholder='store@example.com' type='email' style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Store Bio</label>
              <textarea
                value={sellerProfile.bio}
                onChange={event => handleProfileChange('bio', event.target.value)}
                placeholder='Tell buyers what your store sells, where products come from, and what makes your brand trustworthy.'
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <div className='glory-form-help'>{sellerProfile.bio.length}/600 characters</div>
            </div>

            <div className='glory-form-grid'>
              <div>
                <label style={labelStyle}>Phone</label>
                <input value={sellerProfile.phone} onChange={event => handleProfileChange('phone', event.target.value)} placeholder='+44 7700 900000' type='tel' style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input value={sellerProfile.city} onChange={event => handleProfileChange('city', event.target.value)} placeholder='London' style={inputStyle} />
              </div>
            </div>

            <div className='glory-form-grid'>
              <div>
                <label style={labelStyle}>County / Region</label>
                <input value={sellerProfile.province} onChange={event => handleProfileChange('province', event.target.value)} placeholder='e.g. Greater London' style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input value={sellerProfile.country} onChange={event => handleProfileChange('country', event.target.value)} placeholder='United Kingdom' style={inputStyle} />
              </div>
            </div>

            <div className='glory-form-grid'>
              <div>
                <label style={labelStyle}>Website</label>
                <input value={sellerProfile.website} onChange={event => handleProfileChange('website', event.target.value)} placeholder='https://yourstore.com' type='url' style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Instagram</label>
                <input value={sellerProfile.instagram} onChange={event => handleProfileChange('instagram', event.target.value)} placeholder='@yourstore' style={inputStyle} />
              </div>
            </div>

            <div className='glory-seller-documents'>
              <div className='glory-seller-documents-heading'>
                <div>
                  <strong>Private verification documents</strong>
                  <span>Accepted files: PDF, JPG, PNG, or WebP up to 8 MB.</span>
                </div>
                <FiShield size={20} />
              </div>
              <div className='glory-seller-document-grid'>
                {documentRequirements.map(requirement => {
                  const document = sellerDocuments.find(item => item.type === requirement.type)
                  return (
                    <label key={requirement.type} className='glory-seller-document-card'>
                      <FiFileText size={20} />
                      <strong>{requirement.label}</strong>
                      <span>{document?.originalName || requirement.help}</span>
                      <small className={`is-${document?.status || 'missing'}`}>
                        {documentUploading === requirement.type
                          ? 'Uploading...'
                          : document?.status || 'Required'}
                      </small>
                      {document?.note && <em>{document.note}</em>}
                      <input
                        type='file'
                        accept='.pdf,image/jpeg,image/png,image/webp'
                        disabled={Boolean(documentUploading)}
                        onChange={event => handleDocumentUpload(requirement.type, event.target.files?.[0])}
                      />
                    </label>
                  )
                })}
              </div>
            </div>

            <div className='glory-profile-actions'>
              <button
                onClick={() => handleSaveSellerProfile(false)}
                disabled={profileSubmitting}
                className='glory-secondary-button'
              >
                <FiSave size={15} /> Save Draft
              </button>
              <button
                onClick={() => handleSaveSellerProfile(true)}
                disabled={profileSubmitting || sellerProfile.verificationStatus === 'verified'}
                className='glory-btn'
              >
                <FiShield size={15} /> Submit for Verification
              </button>
            </div>
          </div>
        </section>

        <section className='glory-dashboard-panel glory-commerce-panel'>
          <div className='glory-dashboard-panel-header glory-dashboard-panel-header-split'>
            <div>
              <span>Payments & Payouts</span>
              <small>One buyer payment, with each seller share recorded and paid separately.</small>
            </div>
            <FiCreditCard size={19} />
          </div>

          <div className='glory-commerce-grid'>
            <article className='glory-commerce-card'>
              <div className='glory-commerce-card-heading'>
                <span><FiDollarSign size={18} /></span>
                <div>
                  <strong>Seller activation</strong>
                  <small>One-time access fee</small>
                </div>
              </div>
              <div className='glory-commerce-amount'>
                {formatCurrency(sellerPayments.activation.feePence / 100)}
              </div>
              <p>
                The amount is configurable and can be changed before launch without rebuilding checkout.
              </p>
              <span className={`glory-commerce-status is-${sellerPayments.activation.status}`}>
                {sellerPayments.activation.status === 'paid'
                  ? 'Paid'
                  : sellerPayments.activation.status === 'waived'
                    ? 'Waived'
                    : sellerPayments.activation.status === 'pending'
                      ? 'Confirmation pending'
                      : 'Payment required'}
              </span>
              {!activationReady && (
                <button
                  type='button'
                  onClick={handleSellerActivation}
                  disabled={
                    paymentAction !== ''
                    || sellerProfile.verificationStatus !== 'verified'
                    || !twoFactorEnabled
                  }
                  className='glory-btn'
                >
                  {paymentAction.startsWith('activation') ? 'Checking payment...' : 'Pay activation fee'}
                </button>
              )}
            </article>

            <article className='glory-commerce-card'>
              <div className='glory-commerce-card-heading'>
                <span><FiShield size={18} /></span>
                <div>
                  <strong>Secure payouts</strong>
                  <small>Stripe Connect verification</small>
                </div>
              </div>
              <p>
                Stripe verifies payout identity and bank details. Glory never stores a seller&apos;s raw bank credentials.
              </p>
              <span className={`glory-commerce-status is-${sellerPayments.payouts.status}`}>
                {payoutReady
                  ? 'Payouts active'
                  : sellerPayments.payouts.status === 'restricted'
                    ? 'More details required'
                    : sellerPayments.payouts.status === 'pending'
                      ? 'Onboarding incomplete'
                      : 'Not connected'}
              </span>
              {!payoutReady && (
                <button
                  type='button'
                  onClick={handlePayoutOnboarding}
                  disabled={
                    paymentAction !== ''
                    || sellerProfile.verificationStatus !== 'verified'
                    || !twoFactorEnabled
                    || !activationReady
                  }
                  className='glory-btn'
                >
                  {paymentAction === 'payout' ? 'Opening Stripe...' : 'Set up secure payouts'}
                </button>
              )}
            </article>

            <article className='glory-commerce-card glory-commerce-methods'>
              <div className='glory-commerce-card-heading'>
                <span><FiCreditCard size={18} /></span>
                <div>
                  <strong>Buyer payment methods</strong>
                  <small>Applied to products in this store</small>
                </div>
              </div>
              <div className='glory-commerce-method-list'>
                {(sellerPayments.paymentMethods.length
                  ? sellerPayments.paymentMethods
                  : [{
                      code: 'card',
                      label: 'Credit or debit card',
                      description: 'Visa, Mastercard and supported cards through Stripe.',
                      enabled: true
                    }]
                ).map(method => (
                  <button
                    key={method.code}
                    type='button'
                    className={`glory-commerce-method ${method.enabled ? '' : 'is-disabled'}`}
                    onClick={() => handlePaymentMethodToggle(method.code)}
                    disabled={!method.enabled}
                  >
                    <span className='glory-commerce-method-check'>
                      {sellerProfile.acceptedPaymentMethods?.includes(method.code) && <FiCheckCircle size={16} />}
                    </span>
                    <span>
                      <strong>{method.label}</strong>
                      <small>{method.description}</small>
                    </span>
                    {!method.enabled && <em>Planned</em>}
                  </button>
                ))}
              </div>
              <button
                type='button'
                className='glory-secondary-button'
                disabled={profileSubmitting}
                onClick={() => handleSaveSellerProfile(false)}
              >
                <FiSave size={15} /> Save payment preference
              </button>
            </article>
          </div>
        </section>

        <section className='glory-dashboard-panel'>
          <div className='glory-dashboard-panel-header glory-dashboard-panel-header-split'>
            <div>
              <span>Seller Orders ({orders.length})</span>
              <small>Tracking updates are emailed to buyers.</small>
            </div>
            <FiTruck size={19} />
          </div>
          {orders.length === 0 ? (
            <div className='glory-empty-state glory-seller-orders-empty'>
              <FiTruck size={36} />
              <strong>No seller orders yet</strong>
              <span>Paid orders containing your products will appear here.</span>
            </div>
          ) : (
            <div className='glory-seller-order-list'>
              {orders.map(order => (
                <article key={order._id} className='glory-seller-order'>
                  <header>
                    <div>
                      <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                      <span>{order.buyer?.name || 'Customer'} - {new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <span className={`glory-order-state is-${String(order.status).toLowerCase()}`}>{order.status}</span>
                  </header>
                  {sellerOrderItems(order).map(item => (
                    <div key={item._id} className='glory-seller-order-item'>
                      <img src={item.image} alt={item.name} />
                      <div className='glory-seller-order-copy'>
                        <strong>{item.name} x {item.quantity}</strong>
                        <span>{item.fulfillmentStatus || 'Pending'}{item.trackingNumber ? ` - ${item.trackingNumber}` : ''}</span>
                      </div>
                      {item.fulfillmentStatus === 'Processing' && (
                        <div className='glory-fulfillment-actions'>
                          <input
                            value={trackingByItem[item._id] || ''}
                            onChange={event => setTrackingByItem(current => ({ ...current, [item._id]: event.target.value }))}
                            placeholder='Tracking number'
                            aria-label={`Tracking number for ${item.name}`}
                          />
                          <button
                            type='button'
                            disabled={orderUpdating === item._id || !trackingByItem[item._id]?.trim()}
                            onClick={() => handleFulfillment(order._id, item._id, 'Shipped')}
                          >
                            Mark shipped
                          </button>
                        </div>
                      )}
                      {item.fulfillmentStatus === 'Shipped' && (
                        <button
                          type='button'
                          className='glory-delivered-action'
                          disabled={orderUpdating === item._id}
                          onClick={() => handleFulfillment(order._id, item._id, 'Delivered')}
                        >
                          Mark delivered
                        </button>
                      )}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className='glory-dashboard-panel'>
          <div className='glory-dashboard-panel-header'>
            My Products ({products.length})
          </div>

          {loading ? <Loader /> : products.length === 0 ? (
            <div className='glory-empty-state'>
              <FiPackage size={42} />
              <strong>No products yet</strong>
              <span>Upload your first product and the Glory team will review it before it goes live.</span>
              <button onClick={openNewProductForm} className='glory-btn'>
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
                        <td>
                          <span className={product.countInStock <= (product.lowStockThreshold ?? 5) ? 'glory-low-stock' : ''}>
                            {product.countInStock}
                          </span>
                        </td>
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
                            <button onClick={() => openEditProductForm(product)} className='neutral' aria-label={`Edit ${product.name}`}>
                              <FiEdit3 size={15} />
                            </button>
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
            <span>Edit and resubmit rejected products with clearer photos, descriptions or inventory details.</span>
          </div>
        )}
      </div>

      {showProductForm && (
        <div className='glory-modal-backdrop'>
          <div className='glory-product-modal'>
            <div className='glory-modal-header'>
              <div>
                <strong>{editingProduct ? 'Edit Product' : 'Add Product'}</strong>
                <span>
                  {editingProduct
                    ? 'Saving changes sends this product back to review.'
                    : 'Products are reviewed before they appear in the storefront.'}
                </span>
              </div>
              <button onClick={closeProductForm} aria-label='Close product form'>
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

              <div>
                  <label style={labelStyle}>Gallery Images</label>
                <div className='glory-gallery-uploader'>
                  {images.map((galleryImage, index) => (
                    <div key={galleryImage}>
                      <img src={galleryImage} alt={`Gallery ${index + 1}`} />
                      <button type='button' onClick={() => setImages(current => current.filter(item => item !== galleryImage))} aria-label={`Remove gallery image ${index + 1}`}>
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <label>
                      <FiPlus size={19} />
                      <span>{uploading ? 'Uploading' : 'Add photos'}</span>
                      <input type='file' multiple accept='image/*' disabled={uploading} onChange={handleGalleryUpload} />
                    </label>
                  )}
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
                  <label style={labelStyle}>Price (GBP)</label>
                  <input value={price} onChange={event => setPrice(event.target.value)} placeholder='e.g. 18' type='number' min='0' step='0.01' style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stock Quantity</label>
                  <input value={countInStock} onChange={event => setCountInStock(event.target.value)} placeholder='e.g. 50' type='number' min='0' style={inputStyle} />
                </div>
              </div>

              {category && priceGuidance[category] && (
                <div className={`glory-price-guidance ${Number(price) > priceGuidance[category][1] * 2 ? 'is-warning' : ''}`}>
                  <FiDollarSign size={17} />
                  <span>
                    <strong>Pricing reference</strong>
                    Most {category.toLowerCase()} listings on a UK beauty marketplace commonly sit around {formatCurrency(priceGuidance[category][0])}–{formatCurrency(priceGuidance[category][1])}. Set the real price for your product; unusually high prices may need extra review.
                  </span>
                </div>
              )}

              <div className='glory-form-grid'>
                <div>
                  <label style={labelStyle}>Compare-at Price (Optional)</label>
                  <input value={compareAtPrice} onChange={event => setCompareAtPrice(event.target.value)} placeholder='e.g. 24' type='number' min='0' step='0.01' style={inputStyle} />
                  <div className='glory-form-help'>Only use this when the regular price is genuinely higher.</div>
                </div>
                <div>
                  <label style={labelStyle}>SKU (Optional)</label>
                  <input value={sku} onChange={event => setSku(event.target.value)} placeholder='e.g. GLW-SERUM-30' maxLength={64} style={inputStyle} />
                </div>
              </div>

              <div className='glory-form-grid'>
                <div>
                  <label style={labelStyle}>Product Type</label>
                  <input value={productType} onChange={event => setProductType(event.target.value)} placeholder='e.g. Leave-in conditioner' maxLength={100} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Country of Origin</label>
                  <input value={countryOfOrigin} onChange={event => setCountryOfOrigin(event.target.value)} placeholder='e.g. United Kingdom' maxLength={100} style={inputStyle} />
                </div>
              </div>

              <div className='glory-form-grid'>
                <div>
                  <label style={labelStyle}>Barcode / UPC (Optional)</label>
                  <input value={barcode} onChange={event => setBarcode(event.target.value)} placeholder='Product barcode' maxLength={64} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Low-stock Alert</label>
                  <input value={lowStockThreshold} onChange={event => setLowStockThreshold(event.target.value)} type='number' min='0' max='1000' style={inputStyle} />
                  <div className='glory-form-help'>Glory alerts you when total stock reaches this number.</div>
                </div>
              </div>

              <div className='glory-form-grid'>
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
                  <label style={labelStyle}>Size / Volume (Optional)</label>
                  <input value={size} onChange={event => setSize(event.target.value)} placeholder='e.g. 30 ml, 250 g, One size' maxLength={80} style={inputStyle} />
                </div>
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

              <div>
                <label style={labelStyle}>Ingredients (Optional)</label>
                <textarea
                  value={ingredients}
                  onChange={event => setIngredients(event.target.value)}
                  placeholder='List ingredients exactly as they appear on the product packaging.'
                  rows={3}
                  maxLength={2000}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>How to Use (Optional)</label>
                <textarea
                  value={howToUse}
                  onChange={event => setHowToUse(event.target.value)}
                  placeholder='Give clear, safe usage instructions for the customer.'
                  rows={3}
                  maxLength={1200}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Key Benefits (One per line)</label>
                <textarea
                  value={keyBenefits}
                  onChange={event => setKeyBenefits(event.target.value)}
                  placeholder={'Hydrates without residue\nSupports the skin barrier\nSuitable for sensitive skin'}
                  rows={4}
                  maxLength={960}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <div className='glory-form-help'>Add up to eight specific, supportable benefits. Avoid medical claims.</div>
              </div>

              <div className='glory-variant-builder'>
                <div className='glory-variant-builder-heading'>
                  <div>
                    <strong>Product options (Optional)</strong>
                    <span>Add shades, sizes, or scents with their own price and stock.</span>
                  </div>
                  <button
                    type='button'
                    disabled={variants.length >= 30}
                    onClick={() => setVariants(current => [...current, { name: '', sku: '', price: '', countInStock: 0, image: '' }])}
                  >
                    <FiPlus size={14} /> Add option
                  </button>
                </div>
                {variants.map((variant, index) => (
                  <div key={variant._id || index} className='glory-variant-row'>
                    <input value={variant.name} onChange={event => updateVariant(index, 'name', event.target.value)} placeholder='Option name' aria-label={`Option ${index + 1} name`} />
                    <input value={variant.sku} onChange={event => updateVariant(index, 'sku', event.target.value)} placeholder='SKU' aria-label={`Option ${index + 1} SKU`} />
                    <input value={variant.price} onChange={event => updateVariant(index, 'price', event.target.value)} type='number' min='0' step='.01' placeholder='Price' aria-label={`Option ${index + 1} price`} />
                    <input value={variant.countInStock} onChange={event => updateVariant(index, 'countInStock', event.target.value)} type='number' min='0' placeholder='Stock' aria-label={`Option ${index + 1} stock`} />
                    <button type='button' onClick={() => setVariants(current => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove option ${index + 1}`}>
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveProduct}
                disabled={submitting || uploading}
                className='glory-btn'
                style={{ width: '100%', opacity: submitting || uploading ? 0.7 : 1 }}
              >
                {submitting
                  ? 'Saving...'
                  : editingProduct ? 'Save and Resubmit' : 'Submit for Review'}
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
