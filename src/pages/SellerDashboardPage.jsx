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
  getMyPromotions,
  getPromotionPlans,
  getMySellerProducts,
  getSellerIdentityStatus,
  getSellerPaymentStatus,
  getUserProfile,
  initializeSellerActivation,
  initializeSellerSubscription,
  initializeHomepagePromotion,
  openSellerBillingPortal,
  startSellerIdentityVerification,
  updateProduct,
  updateSellerProfile,
  uploadImage,
  uploadSellerDocument,
  verifySellerActivation,
  verifySellerSubscription,
  verifyHomepagePromotion
} from '../api'
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiImage,
  FiMessageCircle,
  FiPackage,
  FiPlus,
  FiSave,
  FiShield,
  FiTrendingUp,
  FiTrash2,
  FiX,
  FiXCircle
} from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'
import { categoryProductTypes, productTypesForCategory } from '../utils/catalogTaxonomy'

const emptySellerProfile = {
  brandName: '',
  storeName: '',
  bio: '',
  businessEmail: '',
  phone: '',
  city: '',
  province: '',
  country: 'United Kingdom',
  website: '',
  instagram: '',
  businessType: 'independent_seller',
  taxStatus: 'not_registered',
  returnPolicy: 'not_specified',
  returnPolicyDetail: '',
  responseTimeCommitment: 'not_specified',
  acceptedPaymentMethods: ['card'],
  activationStatus: 'unpaid',
  payoutStatus: 'not_started',
  verificationStatus: 'incomplete',
  verificationNote: '',
  identityVerification: {
    provider: 'none',
    status: 'not_started',
    lastErrorReason: ''
  }
}

const emptySellerPayments = {
  activation: {
    required: false,
    feePence: 4900,
    currency: 'GBP',
    status: 'unpaid'
  },
  membership: {
    planCode: 'starter',
    requestedPlanCode: 'starter',
    label: 'Starter',
    status: 'active',
    activeListingLimit: 5,
    promotionDiscountBps: 0,
    cancelAtPeriodEnd: false
  },
  sellerPlans: [],
  payouts: {
    status: 'not_started',
    detailsSubmitted: false,
    chargesEnabled: false,
    payoutsEnabled: false
  },
  acceptedPaymentMethods: ['card'],
  paymentMethods: []
}

const emptyListingEvidence = {
  condition: 'new_sealed',
  batchCode: '',
  expiryOrPao: '',
  supplierInvoiceAvailable: false,
  supplierInvoiceReference: '',
  safetyDocumentationAvailable: false,
  responsiblePersonName: '',
  packagingPhotosConfirmed: false,
  declarationAccepted: false
}

const defaultDocumentKinds = {
  business: 'company_registration',
  tax: 'tax_registration',
  address: 'utility_bill',
  insurance: 'product_liability'
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
  const [promotionPlans, setPromotionPlans] = useState([])
  const [promotions, setPromotions] = useState([])
  const [selectedPromotionListingId, setSelectedPromotionListingId] = useState('')
  const [selectedPromotionPlanCode, setSelectedPromotionPlanCode] = useState('')
  const [paymentAction, setPaymentAction] = useState('')
  const [documentUploading, setDocumentUploading] = useState('')
  const [documentKinds, setDocumentKinds] = useState(defaultDocumentKinds)
  const [identityDisclosureAccepted, setIdentityDisclosureAccepted] = useState(false)

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
  const [listingEvidence, setListingEvidence] = useState({ ...emptyListingEvidence })

  const categories = Object.keys(categoryProductTypes)

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
      membership: { ...emptySellerPayments.membership, ...(data.membership || {}) },
      payouts: { ...emptySellerPayments.payouts, ...(data.payouts || {}) }
    })
    return data
  }, [])

  const refreshPromotions = useCallback(async () => {
    const [plansResponse, promotionsResponse] = await Promise.all([
      getPromotionPlans(),
      getMyPromotions()
    ])
    const availablePlans = Array.isArray(plansResponse.data?.items) ? plansResponse.data.items : []
    setPromotionPlans(availablePlans)
    setSelectedPromotionPlanCode(current => (
      availablePlans.some(plan => plan.code === current)
        ? current
        : availablePlans.find(plan => plan.recommended)?.code || availablePlans[0]?.code || ''
    ))
    setPromotions(Array.isArray(promotionsResponse.data) ? promotionsResponse.data : [])
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const productResponse = await getMySellerProducts()
      setProducts(Array.isArray(productResponse.data) ? productResponse.data : [])
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
    refreshPromotions().catch(() => undefined)
  }, [userId, userIsSeller, navigate, fetchProducts, refreshPromotions])

  useEffect(() => {
    const eligibleListings = products.filter((product) => (
      product.approvalStatus === 'approved' && Number(product.countInStock || 0) > 0
    ))
    if (!eligibleListings.some((product) => product._id === selectedPromotionListingId)) {
      setSelectedPromotionListingId(eligibleListings[0]?._id || '')
    }
  }, [products, selectedPromotionListingId])

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
    if (!userIsSeller || searchParams.get('identity') !== 'return') return
    let active = true
    setPaymentAction('identity-status')
    getSellerIdentityStatus()
      .then(async ({ data: identity }) => {
        const { data } = await getUserProfile()
        if (!active) return
        setSellerProfile(normalizeSellerProfile(data.sellerProfile))
        login(data)
        if (identity.status === 'verified') {
          setSuccess('Identity check completed. Add the remaining business evidence and submit your store for review.')
        } else if (identity.status === 'processing') {
          setSuccess('Stripe is processing your identity check. This page will update when the result is ready.')
        } else {
          setError(identity.lastErrorReason || 'The identity check needs another attempt.')
        }
        setSearchParams({}, { replace: true })
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Could not refresh identity verification')
      })
      .finally(() => {
        if (active) setPaymentAction('')
      })
    return () => {
      active = false
    }
  }, [userIsSeller, searchParams, setSearchParams, login])

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

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!userIsSeller || searchParams.get('membership') !== 'success' || !sessionId) return

    let active = true
    setPaymentAction('membership-verify')
    verifySellerSubscription(sessionId)
      .then(async ({ data }) => {
        if (!active) return
        await refreshSellerPaymentStatus()
        setSuccess(`${data.planCode || 'Paid'} seller plan activated.`)
        setSearchParams({}, { replace: true })
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Could not verify the seller plan payment')
      })
      .finally(() => {
        if (active) setPaymentAction('')
      })

    return () => {
      active = false
    }
  }, [userIsSeller, searchParams, setSearchParams, refreshSellerPaymentStatus])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!userIsSeller || searchParams.get('promotion') !== 'success' || !sessionId) return

    let active = true
    setPaymentAction('promotion-verify')
    verifyHomepagePromotion(sessionId)
      .then(async ({ data }) => {
        if (!active) return
        await refreshPromotions()
        if (data?.promotionStatus === 'active') {
          setSuccess('Your sponsored homepage placement is now active and clearly labelled for shoppers.')
        } else {
          setError('Your payment was received, but this promotion needs a Trust & Safety review before it can appear.')
        }
        setSearchParams({}, { replace: true })
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Could not verify the promotion payment')
      })
      .finally(() => {
        if (active) setPaymentAction('')
      })

    return () => {
      active = false
    }
  }, [userIsSeller, searchParams, setSearchParams, refreshPromotions])

  useEffect(() => {
    if (!userIsSeller) return
    const cancelledFlow = ['membership', 'promotion', 'activation']
      .find(flow => searchParams.get(flow) === 'cancelled')
    if (!cancelledFlow) return
    setError('Checkout was cancelled. Nothing was charged and your current seller access has not changed.')
    setSearchParams({}, { replace: true })
  }, [userIsSeller, searchParams, setSearchParams])

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
    setBrand(sellerProfile.brandName || sellerProfile.storeName || '')
    setCountInStock('')
    setLowStockThreshold('5')
    setImage('')
    setImages([])
    setVariants([])
    setListingEvidence({ ...emptyListingEvidence })
    setEditingProduct(null)
  }

  const openNewProductForm = () => {
    const profileVerified = sellerProfile.verificationStatus === 'verified'
    const accountSecured = Boolean(user?.twoFactorEnabled)
    const activationComplete = !sellerPayments.activation.required
      || ['paid', 'waived'].includes(sellerPayments.activation.status)
    if (!user?.isAdmin && (!profileVerified || !accountSecured || !activationComplete)) {
      setError(`Complete seller verification, email security and two-factor authentication${sellerPayments.activation.required ? ', then platform activation' : ''} before adding a listing.`)
      return
    }
    resetProductForm()
    setBrand(sellerProfile.brandName || sellerProfile.storeName || '')
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
    setBrand(sellerProfile.brandName || product.brand || '')
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
    setListingEvidence({
      ...emptyListingEvidence,
      condition: product.listingEvidence?.condition || emptyListingEvidence.condition,
      batchCode: product.listingEvidence?.batchCode || '',
      expiryOrPao: product.listingEvidence?.expiryOrPao || '',
      supplierInvoiceAvailable: Boolean(product.listingEvidence?.supplierInvoiceAvailable),
      supplierInvoiceReference: product.listingEvidence?.supplierInvoiceReference || '',
      safetyDocumentationAvailable: Boolean(product.listingEvidence?.safetyDocumentationAvailable),
      responsiblePersonName: product.listingEvidence?.responsiblePersonName || '',
      packagingPhotosConfirmed: Boolean(product.listingEvidence?.packagingPhotosConfirmed),
      declarationAccepted: Boolean(product.listingEvidence?.declarationAccepted)
    })
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
    const isCosmeticListing = !['Scented Candles', 'Tools & Accessories'].includes(category)
    const listingBrand = sellerProfile.brandName.trim() || sellerProfile.storeName.trim()

    const benefitList = keyBenefits.split('\n').map(item => item.trim()).filter(Boolean).slice(0, 8)
    if (!name || !price || description.trim().length < 40 || !category || !listingBrand || !productType || !countryOfOrigin || countInStock === '' || !image || images.length < 1 || benefitList.length < 2) {
      return { error: 'Complete the required listing details, add two benefits, and upload a primary plus gallery image.' }
    }

    if (!listingEvidence.batchCode.trim() || !listingEvidence.responsiblePersonName.trim() || !listingEvidence.supplierInvoiceAvailable || !listingEvidence.packagingPhotosConfirmed || !listingEvidence.declarationAccepted) {
      return { error: 'Add the batch or lot code, named Responsible Person, source confirmation and required evidence confirmations before submitting.' }
    }

    if (isCosmeticListing && (!listingEvidence.expiryOrPao.trim() || !listingEvidence.safetyDocumentationAvailable)) {
      return { error: 'For cosmetics, add the expiry or PAO information and confirm that safety or compliance information can be provided for review.' }
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
        brand: listingBrand,
        countInStock: numericStock,
        lowStockThreshold: numericLowStockThreshold,
        image,
        images,
        listingEvidence: {
          condition: listingEvidence.condition,
          batchCode: listingEvidence.batchCode.trim(),
          expiryOrPao: listingEvidence.expiryOrPao.trim(),
          supplierInvoiceAvailable: listingEvidence.supplierInvoiceAvailable,
          supplierInvoiceReference: listingEvidence.supplierInvoiceReference.trim(),
          safetyDocumentationAvailable: listingEvidence.safetyDocumentationAvailable,
          responsiblePersonName: listingEvidence.responsiblePersonName.trim(),
          packagingPhotosConfirmed: listingEvidence.packagingPhotosConfirmed,
          declarationAccepted: listingEvidence.declarationAccepted
        },
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

  const handleIdentityVerification = async () => {
    setPaymentAction('identity-start')
    setError('')
    setSuccess('')
    try {
      const { data } = await startSellerIdentityVerification({
        acceptDisclosure: identityDisclosureAccepted
      })
      if (data.alreadyVerified) {
        const profileResponse = await getUserProfile()
        setSellerProfile(normalizeSellerProfile(profileResponse.data.sellerProfile))
        login(profileResponse.data)
        setSuccess('Your identity is already verified.')
        setPaymentAction('')
        return
      }
      if (data.status === 'processing' && !data.url) {
        setSuccess('Stripe is processing your identity check. Return shortly to refresh the result.')
        setPaymentAction('')
        return
      }
      window.location.assign(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start identity verification')
      setPaymentAction('')
    }
  }

  const handleDocumentUpload = async (type, file) => {
    if (!file) return
    setDocumentUploading(type)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('kind', documentKinds[type])
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

  const handleSellerSubscription = async (planCode) => {
    setPaymentAction(`membership-${planCode}`)
    setError('')
    try {
      const { data } = await initializeSellerSubscription({ planCode })
      window.location.assign(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the seller plan checkout')
      setPaymentAction('')
    }
  }

  const handleBillingPortal = async () => {
    setPaymentAction('membership-portal')
    setError('')
    try {
      const { data } = await openSellerBillingPortal()
      window.location.assign(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open seller billing')
      setPaymentAction('')
    }
  }

  const handleHomepagePromotion = async () => {
    const plan = promotionPlans.find((item) => item.code === selectedPromotionPlanCode)
    if (!plan || !selectedPromotionListingId) {
      setError('Choose an approved, in-stock listing before starting a homepage promotion.')
      return
    }

    setPaymentAction('promotion')
    setError('')
    try {
      const { data } = await initializeHomepagePromotion({
        listingId: selectedPromotionListingId,
        planCode: plan.code
      })
      if (data.alreadyActive) {
        await refreshPromotions()
        setSuccess('This listing already has an active sponsored homepage placement.')
        setPaymentAction('')
        return
      }
      window.location.assign(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the sponsored placement payment')
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

  const approvedProducts = products.filter(product => product.approvalStatus === 'approved' && product.planVisibilityStatus !== 'paused')
  const promotableProducts = approvedProducts.filter(product => Number(product.countInStock || 0) > 0)
  const pendingProducts = products.filter(product => product.approvalStatus === 'pending' || !product.approvalStatus)
  const rejectedProducts = products.filter(product => product.approvalStatus === 'rejected')
  const inventoryValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.countInStock || 0), 0)
  const sellerMeta = sellerStatusMeta(sellerProfile.verificationStatus)
  const twoFactorEnabled = Boolean(user?.twoFactorEnabled)
  const activationReady = !sellerPayments.activation.required
    || ['paid', 'waived'].includes(sellerPayments.activation.status)
  const sellerPlans = Array.isArray(sellerPayments.sellerPlans) ? sellerPayments.sellerPlans : []
  const activeSellerPlanCode = sellerPayments.membership.planCode || 'starter'
  const homepagePromotionPlan = promotionPlans.find((plan) => plan.code === selectedPromotionPlanCode)
    || promotionPlans.find((plan) => plan.placement === 'homepage_featured')
  const promotionDiscountBps = Number(sellerPayments.membership.promotionDiscountBps || 0)
  const promotionPricePence = homepagePromotionPlan
    ? Math.max(100, homepagePromotionPlan.feePence - Math.floor(homepagePromotionPlan.feePence * promotionDiscountBps / 10000))
    : 0
  const activeHomepagePromotion = promotions.find((promotion) => (
    promotion.placement === 'homepage_featured'
    && promotion.status === 'active'
    && new Date(promotion.endsAt).getTime() > Date.now()
  ))
  const sellerCanSubmitProducts = Boolean(
    user?.isAdmin
    || (user?.isEmailVerified !== false
      && sellerProfile.verificationStatus === 'verified'
      && activationReady
      && twoFactorEnabled)
  )
  const documentRequirements = [
    {
      type: 'business',
      label: 'Business evidence',
      help: 'Use a registration record, reseller document, or sole-trader declaration. Early-stage sellers can use the declaration.',
      required: true,
      options: [
        ['company_registration', 'Company registration'],
        ['sole_trader_declaration', 'Sole-trader declaration'],
        ['marketplace_reseller_document', 'Reseller / supplier document'],
        ['other_business_document', 'Other business evidence']
      ]
    },
    {
      type: 'address',
      label: 'Proof of address',
      help: 'Recent utility bill, bank statement, government letter, or another official address document.',
      required: true,
      options: [
        ['utility_bill', 'Utility bill'],
        ['bank_statement', 'Bank statement'],
        ['government_letter', 'Government letter'],
        ['other_address_document', 'Other address evidence']
      ]
    },
    ...(sellerProfile.taxStatus === 'registered' ? [{
      type: 'tax',
      label: 'Tax registration',
      help: 'Required because this seller profile is registered for tax or VAT.',
      required: true,
      options: [
        ['tax_registration', 'Tax registration'],
        ['vat_registration', 'VAT registration'],
        ['tax_status_declaration', 'Tax status declaration']
      ]
    }] : []),
    {
      type: 'insurance',
      label: 'Insurance evidence',
      help: 'Optional today, but helpful for higher-risk or high-volume product categories.',
      required: false,
      options: [
        ['product_liability', 'Product liability insurance'],
        ['public_liability', 'Public liability insurance'],
        ['other_insurance_document', 'Other insurance document']
      ]
    }
  ]
  const sellerDocuments = sellerProfile.documents || []
  const identityVerification = sellerProfile.identityVerification || emptySellerProfile.identityVerification
  return (
    <div className='glory-page'>
      <Navbar />

      <div className='glory-container glory-dashboard-container'>
        <div className='glory-dashboard-header'>
          <div>
            <h1>Seller Dashboard</h1>
            <p>Welcome back, {user?.name}. Set up your store, submit listings and manage buyer enquiries.</p>
          </div>
          <button
            onClick={openNewProductForm}
            className='glory-btn glory-dashboard-primary-action'
            disabled={!sellerCanSubmitProducts}
            title={sellerCanSubmitProducts ? 'Add a listing' : 'Complete seller verification and 2FA first'}
          >
            <FiPlus size={16} /> Add Listing
          </button>
        </div>

        {error && <Message type='error' text={error} />}
        {success && <Message type='success' text={success} />}

        <div className='glory-dashboard-stats'>
          {[
            { label: 'Total Listings', value: products.length, icon: <FiPackage size={22} />, color: '#b85f83', bg: '#f8e8ee' },
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
                Glory requires a hosted identity check, approved store evidence, verified email and 2FA before listing submissions open.
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
                <label style={labelStyle}>Brand Name</label>
                <input value={sellerProfile.brandName} onChange={event => handleProfileChange('brandName', event.target.value)} placeholder='e.g. Glow Lab' style={inputStyle} />
                <div className='glory-form-help'>Used on your listings and as the buyer-facing brand filter.</div>
              </div>
              <div>
                <label style={labelStyle}>Store Name</label>
                <input value={sellerProfile.storeName} onChange={event => handleProfileChange('storeName', event.target.value)} placeholder='e.g. Glow Lab Beauty' style={inputStyle} />
              </div>
            </div>

            <div className='glory-form-grid'>
              <div>
                <label style={labelStyle}>Business Email</label>
                <input value={sellerProfile.businessEmail} onChange={event => handleProfileChange('businessEmail', event.target.value)} placeholder='store@example.com' type='email' style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Business Structure</label>
                <select value={sellerProfile.businessType} onChange={event => handleProfileChange('businessType', event.target.value)} style={inputStyle}>
                  <option value='independent_seller'>Independent seller</option>
                  <option value='sole_trader'>Sole trader</option>
                  <option value='registered_business'>Registered business</option>
                </select>
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

            <div className='glory-form-grid'>
              <div>
                <label style={labelStyle}>Tax Status</label>
                <select value={sellerProfile.taxStatus} onChange={event => handleProfileChange('taxStatus', event.target.value)} style={inputStyle}>
                  <option value='not_registered'>Not registered yet</option>
                  <option value='registered'>Registered for tax or VAT</option>
                  <option value='not_applicable'>Not applicable to my business</option>
                </select>
                <div className='glory-form-help'>Tax evidence is only requested when you select a registered status.</div>
              </div>
              <div>
                <label style={labelStyle}>Buyer Response Commitment</label>
                <select value={sellerProfile.responseTimeCommitment} onChange={event => handleProfileChange('responseTimeCommitment', event.target.value)} style={inputStyle}>
                  <option value='not_specified'>Not specified</option>
                  <option value='within_24_hours'>Within 24 hours</option>
                  <option value='within_48_hours'>Within 48 hours</option>
                  <option value='within_3_days'>Within 3 days</option>
                </select>
              </div>
            </div>

            <div className='glory-form-grid'>
              <div>
                <label style={labelStyle}>Return Policy</label>
                <select value={sellerProfile.returnPolicy} onChange={event => handleProfileChange('returnPolicy', event.target.value)} style={inputStyle}>
                  <option value='not_specified'>Not specified</option>
                  <option value='returns_accepted'>Returns accepted</option>
                  <option value='contact_seller'>Contact me about returns</option>
                  <option value='final_sale'>Final sale</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Return Policy Details</label>
                <input value={sellerProfile.returnPolicyDetail} onChange={event => handleProfileChange('returnPolicyDetail', event.target.value)} placeholder='e.g. Returns accepted within 14 days, unopened.' maxLength={500} style={inputStyle} />
              </div>
            </div>

            <div className='glory-dashboard-callout'>
              <strong>Keep identity and financial data with specialist providers.</strong>
              <span>Never add bank-account, passport, National Insurance or national-ID numbers to profile fields, listing descriptions or Glory messages.</span>
            </div>

            <div className={`glory-hosted-identity is-${identityVerification.status}`}>
              <div className='glory-hosted-identity-heading'>
                <span><FiShield size={20} /></span>
                <div>
                  <strong>Hosted government photo-ID check</strong>
                  <small>Stripe Identity · document and matching selfie</small>
                </div>
                <em>{identityVerification.status.replaceAll('_', ' ')}</em>
              </div>
              <p>
                Stripe captures and checks the identity evidence in its hosted flow. Glory stores the provider reference and verification result, not a second copy of your passport or ID images.
              </p>
              {identityVerification.lastErrorReason && <div className='glory-identity-error'>{identityVerification.lastErrorReason}</div>}
              {identityVerification.status !== 'verified' && (
                <label className='glory-identity-consent'>
                  <input type='checkbox' checked={identityDisclosureAccepted} onChange={event => setIdentityDisclosureAccepted(event.target.checked)} />
                  <span>I have read the <a href='/privacy'>privacy notice</a> and agree to continue to Stripe for this identity check.</span>
                </label>
              )}
              <button
                type='button'
                className={identityVerification.status === 'verified' ? 'glory-secondary-button' : 'glory-btn'}
                onClick={handleIdentityVerification}
                disabled={
                  identityVerification.status === 'verified'
                  || paymentAction !== ''
                  || !identityDisclosureAccepted
                  || !twoFactorEnabled
                }
              >
                <FiShield size={15} />
                {identityVerification.status === 'verified'
                  ? 'Identity verified'
                  : paymentAction === 'identity-start'
                    ? 'Opening secure check...'
                    : identityVerification.status === 'processing'
                      ? 'Check processing'
                      : 'Start secure identity check'}
              </button>
            </div>

            <div className='glory-seller-documents'>
              <div className='glory-seller-documents-heading'>
                <div>
                  <strong>Private business evidence</strong>
                  <span>Accepted files: PDF, JPG, PNG, or WebP up to 8 MB. These fields never accept passports, National Insurance numbers or bank-account details.</span>
                </div>
                <FiShield size={20} />
              </div>
              <div className='glory-seller-document-grid'>
                {documentRequirements.map(requirement => {
                  const document = sellerDocuments.find(item => item.type === requirement.type)
                  return (
                    <div key={requirement.type} className='glory-seller-document-card'>
                      <FiFileText size={20} />
                      <strong>{requirement.label}{requirement.required ? '' : ' (optional)'}</strong>
                      <span>{document?.originalName || requirement.help}</span>
                      <select
                        className='glory-seller-document-kind'
                        value={documentKinds[requirement.type]}
                        onChange={event => setDocumentKinds(current => ({
                          ...current,
                          [requirement.type]: event.target.value
                        }))}
                        aria-label={`${requirement.label} document kind`}
                        disabled={Boolean(documentUploading)}
                      >
                        {requirement.options.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <small className={`is-${document?.status || 'missing'}`}>
                        {documentUploading === requirement.type
                          ? 'Uploading...'
                          : document?.status || (requirement.required ? 'Required' : 'Optional')}
                      </small>
                      {document?.note && <em>{document.note}</em>}
                      <label className='glory-seller-document-upload'>
                        <span>{document ? 'Replace document' : 'Choose document'}</span>
                        <input
                          type='file'
                          accept='.pdf,image/jpeg,image/png,image/webp'
                          disabled={Boolean(documentUploading)}
                          onChange={event => handleDocumentUpload(requirement.type, event.target.files?.[0])}
                        />
                      </label>
                    </div>
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
              <span>Grow on Glory</span>
              <small>Choose catalogue capacity, then buy visibility only when it supports your campaign.</small>
            </div>
            <FiTrendingUp size={19} />
          </div>

          <div className='glory-seller-plan-grid' aria-label='Seller plans'>
            {sellerPlans.map(plan => {
              const isCurrent = activeSellerPlanCode === plan.code
              const hasPaidPlan = activeSellerPlanCode !== 'starter'
              const isPending = sellerPayments.membership.requestedPlanCode === plan.code
                && sellerPayments.membership.status === 'pending'
              return (
                <article key={plan.code} className={`glory-seller-plan ${isCurrent ? 'is-current' : ''}`}>
                  <div className='glory-seller-plan-heading'>
                    <div>
                      <span>{plan.code === 'scale' ? 'Most popular' : plan.code === 'partner' ? 'High volume' : 'Seller plan'}</span>
                      <h3>{plan.label}</h3>
                    </div>
                    {isCurrent && <em>Current</em>}
                  </div>
                  <div className='glory-seller-plan-price'>
                    <strong>{plan.feePence ? formatCurrency(plan.feePence / 100) : 'Free'}</strong>
                    {plan.interval && <span>/ month</span>}
                  </div>
                  <p>{plan.description}</p>
                  <ul>
                    {plan.features.map(feature => <li key={feature}><FiCheckCircle size={14} /> {feature}</li>)}
                  </ul>
                  {isCurrent && plan.code === 'starter' ? (
                    <button type='button' className='glory-secondary-button' disabled>Current plan</button>
                  ) : hasPaidPlan ? (
                    <button type='button' className={isCurrent ? 'glory-btn' : 'glory-secondary-button'} onClick={handleBillingPortal} disabled={paymentAction !== ''}>
                      {paymentAction === 'membership-portal' ? 'Opening billing...' : isCurrent ? 'Manage billing' : 'Change plan'}
                    </button>
                  ) : plan.code === 'starter' ? (
                    <button type='button' className='glory-secondary-button' disabled>Included</button>
                  ) : (
                    <button
                      type='button'
                      className={plan.code === 'scale' ? 'glory-btn' : 'glory-secondary-button'}
                      onClick={() => handleSellerSubscription(plan.code)}
                      disabled={paymentAction !== '' || sellerProfile.verificationStatus !== 'verified' || !twoFactorEnabled}
                    >
                      {paymentAction === `membership-${plan.code}` || isPending ? 'Starting checkout...' : `Choose ${plan.label}`}
                    </button>
                  )}
                </article>
              )
            })}
          </div>

          <div className='glory-commerce-grid'>
            {sellerPayments.activation.required && (
              <article className='glory-commerce-card'>
                <div className='glory-commerce-card-heading'>
                  <span><FiDollarSign size={18} /></span>
                  <div><strong>Seller activation</strong><small>One-time platform access</small></div>
                </div>
                <div className='glory-commerce-amount'>{formatCurrency(sellerPayments.activation.feePence / 100)}</div>
                <p>This separate access fee only applies when Glory enables paid activation.</p>
                {!activationReady && (
                  <button type='button' onClick={handleSellerActivation} disabled={paymentAction !== '' || sellerProfile.verificationStatus !== 'verified' || !twoFactorEnabled} className='glory-btn'>
                    {paymentAction.startsWith('activation') ? 'Checking payment...' : 'Pay activation fee'}
                  </button>
                )}
              </article>
            )}

            <article className='glory-commerce-card glory-promotion-card'>
              <div className='glory-commerce-card-heading'>
                <span><FiTrendingUp size={18} /></span>
                <div>
                  <strong>Homepage featured</strong>
                  <small>Clearly labelled sponsored placement</small>
                </div>
              </div>
              {homepagePromotionPlan ? (
                <>
                  <div className='glory-commerce-amount'>
                    {formatCurrency(promotionPricePence / 100)}
                    {promotionDiscountBps > 0 && <small>{promotionDiscountBps / 100}% plan discount</small>}
                  </div>
                  <p>
                    Feature one approved listing in Glory&apos;s Sponsored home-page edit for {homepagePromotionPlan.durationDays} days. Paid placement never changes your verification status.
                  </p>
                  {activeHomepagePromotion && (
                    <span className='glory-commerce-status is-paid'>
                      Live until {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(activeHomepagePromotion.endsAt))}
                    </span>
                  )}
                  {promotableProducts.length > 0 ? (
                    <div className='glory-promotion-options'>
                      <label className='glory-promotion-listing-select'>
                        <span>Campaign</span>
                        <select value={selectedPromotionPlanCode} onChange={(event) => setSelectedPromotionPlanCode(event.target.value)}>
                          {promotionPlans.map(plan => <option key={plan.code} value={plan.code}>{plan.label} · {plan.durationDays} days</option>)}
                        </select>
                      </label>
                      <label className='glory-promotion-listing-select'>
                        <span>Approved listing</span>
                        <select value={selectedPromotionListingId} onChange={(event) => setSelectedPromotionListingId(event.target.value)}>
                          {promotableProducts.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
                        </select>
                      </label>
                    </div>
                  ) : (
                    <small className='glory-dashboard-note'>Approve and stock a listing before buying a homepage placement.</small>
                  )}
                  <button
                    type='button'
                    onClick={handleHomepagePromotion}
                    disabled={
                      paymentAction !== ''
                      || !sellerCanSubmitProducts
                      || !selectedPromotionListingId
                    }
                    className='glory-btn'
                  >
                    <FiTrendingUp size={15} /> {paymentAction.startsWith('promotion') ? 'Checking payment...' : 'Buy sponsored placement'}
                  </button>
                </>
              ) : (
                <p>Homepage advertising will appear here once Glory&apos;s promotion plans are available.</p>
              )}
            </article>

            <article className='glory-commerce-card'>
              <div className='glory-commerce-card-heading'>
                <span><FiMessageCircle size={18} /></span>
                <div>
                  <strong>Buyer enquiries</strong>
                  <small>Keep every listing conversation on Glory</small>
                </div>
              </div>
              <p>
                Buyers contact you through Glory. Agree collection, delivery and payment directly, and never ask for passwords, card details or one-time codes.
              </p>
              <button
                type='button'
                className='glory-secondary-button'
                onClick={() => navigate('/messages')}
              >
                <FiMessageCircle size={15} /> Open messages
              </button>
            </article>
          </div>
        </section>

        <section className='glory-dashboard-panel'>
          <div className='glory-dashboard-panel-header glory-dashboard-panel-header-split'>
            <div>
              <span>Safe selling checklist</span>
              <small>Protect your account and buyers before you arrange any transaction.</small>
            </div>
            <FiShield size={19} />
          </div>
          <div className='glory-empty-state glory-seller-orders-empty'>
            <FiShield size={36} />
            <strong>List accurately. Keep the chat on Glory.</strong>
            <span>Use clear packaging photos, answer buyer questions honestly, and report suspicious behaviour rather than moving a conversation off-platform.</span>
          </div>
        </section>

        <section className='glory-dashboard-panel'>
          <div className='glory-dashboard-panel-header'>
            My Listings ({products.length})
          </div>

          {loading ? <Loader /> : products.length === 0 ? (
            <div className='glory-empty-state'>
              <FiPackage size={42} />
              <strong>No listings yet</strong>
              <span>Upload your first listing and the Glory team will review the evidence before it goes live.</span>
              <button onClick={openNewProductForm} className='glory-btn'>
                <FiPlus size={16} /> Add Your First Listing
              </button>
            </div>
          ) : (
            <div className='glory-table-wrap'>
              <table className='glory-dashboard-table'>
                <thead>
                  <tr>
                    {['Listing', 'Price', 'Stock', 'Status', 'Notes', 'Actions'].map(header => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const meta = product.planVisibilityStatus === 'paused'
                      ? { label: 'Plan paused', color: '#8b5a16', icon: <FiClock size={14} />, note: 'Upgrade your plan or remove another listing to make this public.' }
                      : statusMeta(product.approvalStatus)
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
                <strong>{editingProduct ? 'Edit Listing' : 'Create Listing'}</strong>
                <span>
                  {editingProduct
                    ? 'Saving changes sends this listing back to review.'
                    : 'Listings are reviewed before they appear in the storefront.'}
                </span>
              </div>
              <button onClick={closeProductForm} aria-label='Close product form'>
                <FiX size={20} />
              </button>
            </div>

            {error && <Message type='error' text={error} />}

            <div className='glory-product-form'>
              <div>
                <label style={labelStyle}>Primary Listing Image</label>
                <div className='glory-upload-box'>
                  {image ? (
                    <img src={image} alt='Product preview' />
                  ) : (
                    <div>
                      <FiImage size={28} />
                      <span>{uploading ? 'Uploading...' : 'Click to upload listing image'}</span>
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

              <fieldset className='glory-listing-evidence-form'>
                <legend>Evidence for Glory review</legend>
                <p>These private fields support the listing review. Use the gallery for clear front, back, ingredient, barcode and label photos. Never put invoice numbers or identity documents in public images.</p>
                <div className='glory-form-grid'>
                  <div>
                    <label style={labelStyle} htmlFor='listing-condition'>Product condition</label>
                    <select
                      id='listing-condition'
                      value={listingEvidence.condition}
                      onChange={event => setListingEvidence(current => ({ ...current, condition: event.target.value }))}
                      style={inputStyle}
                    >
                      <option value='new_sealed'>New and sealed</option>
                      <option value='new_unsealed'>New, unsealed</option>
                      <option value='sample'>Sample or tester</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor='listing-batch-code'>Batch or lot code</label>
                    <input
                      id='listing-batch-code'
                      value={listingEvidence.batchCode}
                      onChange={event => setListingEvidence(current => ({ ...current, batchCode: event.target.value }))}
                      placeholder='Exactly as shown on the packaging'
                      maxLength={80}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className='glory-form-grid'>
                  <div>
                    <label style={labelStyle} htmlFor='listing-expiry'>Expiry or PAO</label>
                    <input
                      id='listing-expiry'
                      value={listingEvidence.expiryOrPao}
                      onChange={event => setListingEvidence(current => ({ ...current, expiryOrPao: event.target.value }))}
                      placeholder='e.g. 12M after opening or 2027-05'
                      maxLength={80}
                      style={inputStyle}
                    />
                    <div className='glory-form-help'>Required for cosmetics; use the expiry date or period-after-opening mark.</div>
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor='listing-invoice-reference'>Supplier invoice reference (private)</label>
                    <input
                      id='listing-invoice-reference'
                      value={listingEvidence.supplierInvoiceReference}
                      onChange={event => setListingEvidence(current => ({ ...current, supplierInvoiceReference: event.target.value }))}
                      placeholder='Optional internal reference'
                      maxLength={160}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle} htmlFor='listing-responsible-person'>Responsible Person or brand</label>
                  <input
                    id='listing-responsible-person'
                    value={listingEvidence.responsiblePersonName}
                    onChange={event => setListingEvidence(current => ({ ...current, responsiblePersonName: event.target.value }))}
                    placeholder='Name printed on the product packaging'
                    maxLength={160}
                    style={inputStyle}
                    />
                </div>
                <label className='glory-listing-evidence-check'>
                  <input
                    type='checkbox'
                    checked={listingEvidence.supplierInvoiceAvailable}
                    onChange={event => setListingEvidence(current => ({ ...current, supplierInvoiceAvailable: event.target.checked }))}
                  />
                  <span>I can provide a supplier invoice, receipt, or other proof of source if Glory asks.</span>
                </label>
                {!['Scented Candles', 'Tools & Accessories'].includes(category) && (
                  <label className='glory-listing-evidence-check'>
                    <input
                      type='checkbox'
                      checked={listingEvidence.safetyDocumentationAvailable}
                      onChange={event => setListingEvidence(current => ({ ...current, safetyDocumentationAvailable: event.target.checked }))}
                    />
                    <span>I can provide safety, labelling, responsible-person, or compliance information if Glory asks.</span>
                  </label>
                )}
                <label className='glory-listing-evidence-check'>
                  <input
                    type='checkbox'
                    checked={listingEvidence.packagingPhotosConfirmed}
                    onChange={event => setListingEvidence(current => ({ ...current, packagingPhotosConfirmed: event.target.checked }))}
                  />
                  <span>I confirm the photos show the packaging, labels and batch or lot code clearly.</span>
                </label>
                <label className='glory-listing-evidence-check'>
                  <input
                    type='checkbox'
                    checked={listingEvidence.declarationAccepted}
                    onChange={event => setListingEvidence(current => ({ ...current, declarationAccepted: event.target.checked }))}
                  />
                  <span>I confirm this listing is accurate, the item is lawful to sell, and I can provide more evidence if Glory asks.</span>
                </label>
              </fieldset>

              <div className='glory-form-grid'>
                <div>
                  <label style={labelStyle}>Listing Title</label>
                  <input value={name} onChange={event => setName(event.target.value)} placeholder='e.g. Vitamin C Serum' style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input value={brand} readOnly placeholder='Set your brand in Store Setup' style={inputStyle} />
                  <div className='glory-form-help'>Managed from Store Setup so buyers always see the verified seller brand.</div>
                </div>
              </div>

              <div className='glory-form-grid'>
                <div>
                  <label style={labelStyle}>Price (GBP)</label>
                  <input value={price} onChange={event => setPrice(event.target.value)} placeholder='e.g. 18' type='number' min='0' step='0.01' style={inputStyle} />
                  <div className='glory-form-help'>You set the final selling price. Glory does not change it.</div>
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
                  <select value={productType} onChange={event => setProductType(event.target.value)} disabled={!category} style={inputStyle}>
                    <option value=''>{category ? 'Select product type' : 'Select category first'}</option>
                    {productType && !productTypesForCategory(category).includes(productType) && (
                      <option value={productType}>{productType} (update type)</option>
                    )}
                    {productTypesForCategory(category).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
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
                  <select value={category} onChange={event => {
                    setCategory(event.target.value)
                    setProductType('')
                  }} style={inputStyle}>
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
                  : editingProduct ? 'Save and Resubmit Listing' : 'Submit Listing for Review'}
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
