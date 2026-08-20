import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  FiAlertTriangle,
  FiChevronRight,
  FiFlag,
  FiHeart,
  FiMessageCircle,
  FiShield,
  FiStar,
  FiX,
} from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getProduct, getReviews, reportListing, reportReview, startConversation } from '../api'
import { useUser } from '../context/UserContext'
import { formatCurrency } from '../utils/currency'
import { isWishlisted, toggleWishlist } from '../utils/wishlist'
import { ProductSeo } from '../components/Seo'

const paymentMethodLabels = {
  card: 'Card or seller payment link',
  bank_transfer: 'Bank transfer',
  ussd: 'USSD',
  cash_on_delivery: 'Pay on collection or delivery',
  crypto: 'Crypto'
}

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [wished, setWished] = useState(() => isWishlisted(id))
  const [activeTab, setActiveTab] = useState('description')
  const [activeImage, setActiveImage] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryMessage, setEnquiryMessage] = useState('')
  const [enquirySending, setEnquirySending] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetail, setReportDetail] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [reportFeedback, setReportFeedback] = useState('')
  const [reviewReport, setReviewReport] = useState(null)
  const [reviewReportReason, setReviewReportReason] = useState('')
  const [reviewReportDetail, setReviewReportDetail] = useState('')
  const [reviewReportSending, setReviewReportSending] = useState(false)
  const [reviewReportFeedback, setReviewReportFeedback] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProduct(id)
        setProduct(data)
        setActiveImage(data.image)
        setSelectedVariant(data.variants?.find(variant => variant.countInStock > 0) || data.variants?.[0] || null)
        const { data: reviewData } = await getReviews(id)
        setReviews(reviewData)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const availableStock = selectedVariant ? selectedVariant.countInStock : product?.countInStock

  const requireAccount = () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return false
    }
    return true
  }

  const openEnquiry = () => {
    if (!requireAccount()) return
    const option = selectedVariant?.name ? ` (${selectedVariant.name})` : ''
    setEnquiryMessage(`Hi, I am interested in ${product.name}${option}. Is it still available?`)
    setEnquiryError('')
    setEnquiryOpen(true)
  }

  const submitEnquiry = async (event) => {
    event.preventDefault()
    if (!enquiryMessage.trim()) return
    setEnquirySending(true)
    setEnquiryError('')
    try {
      const { data } = await startConversation({ listingId: id, message: enquiryMessage.trim() })
      navigate(`/messages?thread=${data._id}`)
    } catch (error) {
      setEnquiryError(error.response?.data?.message || 'We could not start this conversation.')
    } finally {
      setEnquirySending(false)
    }
  }

  const openReport = () => {
    if (!requireAccount()) return
    setReportFeedback('')
    setReportOpen(true)
  }

  const submitReport = async (event) => {
    event.preventDefault()
    setReportSending(true)
    setReportFeedback('')
    try {
      const { data } = await reportListing(id, { reason: reportReason, detail: reportDetail.trim() })
      setReportFeedback(data.message)
      setReportReason('')
      setReportDetail('')
    } catch (error) {
      setReportFeedback(error.response?.data?.message || 'We could not submit this report.')
    } finally {
      setReportSending(false)
    }
  }

  const openReviewReport = (review) => {
    if (!requireAccount()) return
    setReviewReport(review)
    setReviewReportReason('')
    setReviewReportDetail('')
    setReviewReportFeedback('')
  }

  const submitReviewReport = async (event) => {
    event.preventDefault()
    if (!reviewReport) return
    setReviewReportSending(true)
    try {
      const { data } = await reportReview(reviewReport._id, {
        reason: reviewReportReason,
        detail: reviewReportDetail.trim()
      })
      setReviewReportFeedback(data.message)
      setReviewReportReason('')
      setReviewReportDetail('')
    } catch (error) {
      setReviewReportFeedback(error.response?.data?.message || 'We could not report this review.')
    } finally {
      setReviewReportSending(false)
    }
  }

  if (loading) return <><Navbar /><Loader /></>
  if (!product) {
    return (
      <div className='glory-page'>
        <Navbar />
        <main className='glory-product-not-found'>
          <Message type='error' text='Product not found' />
          <button type='button' onClick={() => navigate('/products')}>Return to the catalogue</button>
        </main>
        <Footer />
      </div>
    )
  }

  const galleryImages = [...new Set([
    product.image,
    ...(product.images || []),
    ...(product.variants || []).map(variant => variant.image),
  ].filter(Boolean))]
  const displayPrice = selectedVariant?.price || product.price
  const hasReviews = Number(product.numReviews || reviews.length) > 0
  const sellerProfile = product.seller?.sellerProfile || {}
  const returnPolicyLabels = {
    returns_accepted: 'Returns accepted',
    final_sale: 'Final sale',
    contact_seller: 'Contact seller about returns',
    not_specified: 'Return policy not specified'
  }
  const responseTimeLabels = {
    within_24_hours: 'Usually replies within 24 hours',
    within_48_hours: 'Usually replies within 48 hours',
    within_3_days: 'Usually replies within 3 days',
    not_specified: 'Response time not specified'
  }

  return (
    <div className='glory-page glory-product-page-v2'>
      <ProductSeo product={product} />
      <Navbar />

      <main className='glory-product-shell'>
        <nav className='glory-product-breadcrumbs' aria-label='Breadcrumb'>
          <button type='button' onClick={() => navigate('/')}>Home</button>
          <FiChevronRight size={13} aria-hidden='true' />
          <button type='button' onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}`)}>
            {product.category}
          </button>
          {product.productType && (
            <>
              <FiChevronRight size={13} aria-hidden='true' />
              <button
                type='button'
                onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}&productType=${encodeURIComponent(product.productType)}`)}
              >
                {product.productType}
              </button>
            </>
          )}
          <FiChevronRight size={13} aria-hidden='true' />
          <span>{product.name}</span>
        </nav>

        <section className='glory-product-stage'>
          <div className='glory-product-gallery'>
            <div className='glory-product-primary-image'>
              <img
                src={activeImage || product.image}
                alt={product.name}
                width='900'
                height='900'
                fetchPriority='high'
              />
              <button
                type='button'
                className={`glory-product-wishlist ${wished ? 'is-active' : ''}`}
                onClick={() => setWished(toggleWishlist(id))}
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FiHeart size={19} />
              </button>
            </div>

            {galleryImages.length > 1 && (
              <div className='glory-product-thumbnail-rail' aria-label='Product gallery'>
                {galleryImages.map((image, index) => (
                  <button
                    key={image}
                    type='button'
                    className={activeImage === image ? 'active' : ''}
                    onClick={() => setActiveImage(image)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImage === image}
                  >
                    <img src={image} alt='' loading='lazy' width='96' height='96' />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className='glory-product-purchase'>
            <button
              type='button'
              className='glory-product-brand'
              onClick={() => navigate(`/brands/${encodeURIComponent(product.brand)}`)}
            >
              {product.brand}
            </button>

            <h1>{product.name}</h1>

            <div className='glory-product-rating-summary'>
              <span aria-hidden='true'>
                {[1, 2, 3, 4, 5].map(star => (
                  <FiStar
                    key={star}
                    size={14}
                    fill={star <= Math.round(product.rating) ? 'currentColor' : 'none'}
                  />
                ))}
              </span>
              <small>
                {hasReviews
                  ? `${Number(product.rating || 0).toFixed(1)} from ${product.numReviews || reviews.length} review${(product.numReviews || reviews.length) === 1 ? '' : 's'}`
                  : 'New to Glory'}
              </small>
            </div>

            <div className='glory-product-price'>
              <strong>{formatCurrency(displayPrice, product.currency)}</strong>
              {product.compareAtPrice > displayPrice && (
                <span>{formatCurrency(product.compareAtPrice, product.currency)}</span>
              )}
            </div>

            <div className='glory-product-meta-line'>
              <span>{product.category}</span>
              <b className={availableStock > 0 ? 'is-available' : 'is-unavailable'}>
                {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
              </b>
            </div>

            {product.variants?.length > 0 && (
              <fieldset className='glory-variant-picker-v2'>
                <legend>Choose an option</legend>
                <div>
                  {product.variants.map(variant => (
                    <button
                      key={variant._id}
                      type='button'
                      className={selectedVariant?._id === variant._id ? 'active' : ''}
                      disabled={variant.countInStock === 0}
                      onClick={() => {
                        setSelectedVariant(variant)
                        if (variant.image) setActiveImage(variant.image)
                      }}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className='glory-product-actions-v2 glory-listing-actions'>
              <button
                type='button'
                className='is-primary'
                onClick={openEnquiry}
                disabled={availableStock === 0}
              >
                <FiMessageCircle size={17} />
                Contact seller
              </button>
              <button
                type='button'
                className='is-secondary'
                onClick={openReport}
              >
                <FiFlag size={16} />
                Report listing
              </button>
            </div>

            <p className='glory-listing-payment-note'>Glory hosts this listing and conversation. Payment and delivery are agreed directly with the seller.</p>

            <div className='glory-listing-payment-methods'>
              <span>Seller accepts</span>
              <div>
                {(product.acceptedPaymentMethods?.length ? product.acceptedPaymentMethods : ['card']).map((method) => (
                  <small key={method}>{paymentMethodLabels[method] || method}</small>
                ))}
              </div>
              <p>These methods are seller-arranged, not a Glory checkout. Confirm the exact amount, provider and delivery terms inside Glory messages.</p>
            </div>

            <div className='glory-product-confidence'>
              {[
                {
                  Icon: FiShield,
                  title: product.seller?.sellerProfile?.verificationStatus === 'verified'
                    ? 'Verified seller'
                    : 'Seller details pending',
                  text: product.seller?.sellerProfile?.verificationStatus === 'verified'
                    ? 'Identity, business details and account security were reviewed by Glory.'
                    : 'Review the seller information and ask questions before agreeing a deal.',
                },
                {
                  Icon: FiShield,
                  title: product.listingEvidence?.status === 'reviewed' ? 'Documents checked' : 'Listing under review',
                  text: product.listingEvidence?.status === 'reviewed'
                    ? 'Source, packaging, label and compliance details were reviewed by Glory.'
                    : 'Check the listing details and ask the seller questions before you decide.',
                },
                ...(product.listingEvidence?.brandAuthorisationStatus === 'authorised' ? [{
                  Icon: FiShield,
                  title: 'Brand authorised',
                  text: 'The seller relationship or authorisation evidence was checked by Glory.',
                }] : []),
                {
                  Icon: FiAlertTriangle,
                  title: 'Keep the deal safe',
                  text: 'Never share passwords or one-time codes, and be careful with advance payments.',
                },
              ].map(item => (
                <div key={item.title}>
                  <item.Icon size={18} aria-hidden='true' />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='glory-product-tabs-section'>
          <div className='glory-product-tabs' role='tablist' aria-label='Product information'>
            {['description', 'reviews'].map(tab => (
              <button
                key={tab}
                type='button'
                role='tab'
                aria-selected={activeTab === tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' ? 'Product information' : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className='glory-product-information-v2' role='tabpanel'>
              <section>
                <span>01</span>
                <div>
                  <h2>Product details</h2>
                  <p>{product.description}</p>
                  {(product.size || product.sku || product.productType || product.countryOfOrigin || product.barcode) && (
                    <dl>
                      {product.productType && <><dt>Type</dt><dd>{product.productType}</dd></>}
                      {product.size && <><dt>Size</dt><dd>{product.size}</dd></>}
                      {product.countryOfOrigin && <><dt>Made in</dt><dd>{product.countryOfOrigin}</dd></>}
                      {product.sku && <><dt>SKU</dt><dd>{product.sku}</dd></>}
                      {product.barcode && <><dt>Barcode</dt><dd>{product.barcode}</dd></>}
                    </dl>
                  )}
                </div>
              </section>

              {(product.keyBenefits || []).length > 0 && (
                <section>
                  <span>02</span>
                  <div>
                    <h2>Why you&apos;ll love it</h2>
                    <ul>
                      {product.keyBenefits.map(benefit => <li key={benefit}>{benefit}</li>)}
                    </ul>
                  </div>
                </section>
              )}

              {product.ingredients && (
                <section>
                  <span>03</span>
                  <div>
                    <h2>Ingredients</h2>
                    <p>{product.ingredients}</p>
                  </div>
                </section>
              )}

              {product.howToUse && (
                <section>
                  <span>04</span>
                  <div>
                    <h2>How to use</h2>
                    <p>{product.howToUse}</p>
                  </div>
                </section>
              )}

              {(sellerProfile.returnPolicy !== 'not_specified' || sellerProfile.returnPolicyDetail || sellerProfile.responseTimeCommitment !== 'not_specified') && (
                <section>
                  <span>05</span>
                  <div>
                    <h2>Seller commitments</h2>
                    <dl>
                      <dt>Returns</dt>
                      <dd>{returnPolicyLabels[sellerProfile.returnPolicy] || returnPolicyLabels.not_specified}</dd>
                      {sellerProfile.returnPolicyDetail && <><dt>Policy details</dt><dd>{sellerProfile.returnPolicyDetail}</dd></>}
                      <dt>Response time</dt>
                      <dd>{responseTimeLabels[sellerProfile.responseTimeCommitment] || responseTimeLabels.not_specified}</dd>
                    </dl>
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className='glory-reviews-layout' role='tabpanel'>
              <div className='glory-review-form'>
                <span className='glory-product-section-label'>Trust & safety</span>
                <h2>Reviews stay accountable.</h2>
                <p>Only buyers from a mutually confirmed Glory interaction can submit feedback. Positive and negative reviews receive the same checks before publication.</p>
                <button type='button' className='glory-review-submit' onClick={() => navigate('/reviews-policy')}>
                  Read the reviews policy
                </button>
              </div>

              <div className='glory-review-list'>
                {reviews.length === 0 ? (
                  <div className='glory-review-empty'>
                    <strong>No reviews yet.</strong>
                    <span>A buyer with a confirmed Glory interaction can be the first to share an experience.</span>
                  </div>
                ) : reviews.map((review) => (
                  <article key={review._id}>
                    <header>
                      <div>
                        <strong>{review.reviewerName}</strong>
                        <small>
                          {new Date(review.createdAt).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </small>
                      </div>
                      <span aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <FiStar key={star} size={12} fill={star <= review.rating ? 'currentColor' : 'none'} />
                        ))}
                      </span>
                    </header>
                    <p>{review.comment}</p>
                    <footer className='glory-review-card-footer'>
                      <span><FiShield size={13} /> Verified interaction</span>
                      <button type='button' onClick={() => openReviewReport(review)}><FiFlag size={13} /> Report review</button>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {enquiryOpen && (
        <div className='glory-marketplace-modal-backdrop' role='presentation' onMouseDown={() => setEnquiryOpen(false)}>
          <section className='glory-marketplace-modal' role='dialog' aria-modal='true' aria-labelledby='enquiry-title' onMouseDown={event => event.stopPropagation()}>
            <button type='button' className='glory-marketplace-modal-close' onClick={() => setEnquiryOpen(false)} aria-label='Close enquiry form'>
              <FiX size={18} />
            </button>
            <span>Secure enquiry</span>
            <h2 id='enquiry-title'>Ask the seller about this listing.</h2>
            <p>Your contact details stay private. Keep payment, delivery and any personal details inside this Glory conversation.</p>
            {enquiryError && <Message type='error' text={enquiryError} />}
            <form onSubmit={submitEnquiry}>
              <label htmlFor='listing-enquiry'>Your message</label>
              <textarea id='listing-enquiry' value={enquiryMessage} onChange={event => setEnquiryMessage(event.target.value)} minLength={10} maxLength={1200} rows={5} required />
              <button type='submit' disabled={enquirySending || enquiryMessage.trim().length < 10}>
                <FiMessageCircle size={16} />
                {enquirySending ? 'Opening conversation...' : 'Send enquiry'}
              </button>
            </form>
          </section>
        </div>
      )}

      {reportOpen && (
        <div className='glory-marketplace-modal-backdrop' role='presentation' onMouseDown={() => setReportOpen(false)}>
          <section className='glory-marketplace-modal' role='dialog' aria-modal='true' aria-labelledby='report-title' onMouseDown={event => event.stopPropagation()}>
            <button type='button' className='glory-marketplace-modal-close' onClick={() => setReportOpen(false)} aria-label='Close report form'>
              <FiX size={18} />
            </button>
            <span>Confidential report</span>
            <h2 id='report-title'>Tell Glory what looks wrong.</h2>
            <p>Reports are private. A report does not automatically remove a listing; Trust & Safety reviews the evidence first.</p>
            {reportFeedback && <Message type={reportFeedback.startsWith('Thanks') ? 'success' : 'error'} text={reportFeedback} />}
            <form onSubmit={submitReport}>
              <label htmlFor='listing-report-reason'>Reason</label>
              <select id='listing-report-reason' value={reportReason} onChange={event => setReportReason(event.target.value)} required>
                <option value=''>Choose a reason</option>
                <option value='counterfeit'>Suspected counterfeit</option>
                <option value='unsafe_product'>Unsafe or non-compliant product</option>
                <option value='misleading_listing'>Misleading listing</option>
                <option value='suspected_scam'>Suspected scam</option>
                <option value='prohibited_item'>Prohibited item</option>
                <option value='stolen_content'>Stolen images or content</option>
                <option value='other'>Other</option>
              </select>
              <label htmlFor='listing-report-detail'>What did you notice? {reportReason === 'other' ? '(required)' : '(optional)'}</label>
              <textarea id='listing-report-detail' value={reportDetail} onChange={event => setReportDetail(event.target.value)} minLength={reportReason === 'other' ? 10 : undefined} maxLength={1200} rows={4} required={reportReason === 'other'} />
              <button type='submit' disabled={reportSending || !reportReason}>
                <FiFlag size={16} />
                {reportSending ? 'Sending report...' : 'Send confidential report'}
              </button>
            </form>
          </section>
        </div>
      )}

      {reviewReport && (
        <div className='glory-marketplace-modal-backdrop' role='presentation' onMouseDown={() => setReviewReport(null)}>
          <section className='glory-marketplace-modal' role='dialog' aria-modal='true' aria-labelledby='review-report-title' onMouseDown={event => event.stopPropagation()}>
            <button type='button' className='glory-marketplace-modal-close' onClick={() => setReviewReport(null)} aria-label='Close review report form'>
              <FiX size={18} />
            </button>
            <span>Confidential review report</span>
            <h2 id='review-report-title'>Tell us why this review may be unreliable.</h2>
            <p>Reports do not remove reviews automatically. Glory applies the same evidence standard to positive and negative reviews.</p>
            {reviewReportFeedback && <Message type={reviewReportFeedback.startsWith('Thanks') ? 'success' : 'error'} text={reviewReportFeedback} />}
            <form onSubmit={submitReviewReport}>
              <label htmlFor='review-report-reason'>Reason</label>
              <select id='review-report-reason' value={reviewReportReason} onChange={event => setReviewReportReason(event.target.value)} required>
                <option value=''>Choose a reason</option>
                <option value='suspected_fake'>Suspected fake review</option>
                <option value='conflict_of_interest'>Conflict of interest</option>
                <option value='abusive'>Abusive content</option>
                <option value='personal_information'>Personal information</option>
                <option value='irrelevant'>Not about this interaction</option>
                <option value='other'>Other</option>
              </select>
              <label htmlFor='review-report-detail'>Details {reviewReportReason === 'other' ? '(required)' : '(optional)'}</label>
              <textarea id='review-report-detail' value={reviewReportDetail} onChange={event => setReviewReportDetail(event.target.value)} minLength={reviewReportReason === 'other' ? 10 : undefined} maxLength={1000} rows={4} required={reviewReportReason === 'other'} />
              <button type='submit' disabled={reviewReportSending || !reviewReportReason}>
                <FiFlag size={16} />
                {reviewReportSending ? 'Sending report...' : 'Send confidential report'}
              </button>
            </form>
          </section>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ProductDetailPage
