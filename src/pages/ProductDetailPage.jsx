import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiCheck,
  FiChevronRight,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
} from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getProduct, addReview, getReviews } from '../api'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { formatCurrency } from '../utils/currency'
import { isWishlisted, toggleWishlist } from '../utils/wishlist'
import { ProductSeo } from '../components/Seo'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useUser()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [wished, setWished] = useState(() => isWishlisted(id))
  const [added, setAdded] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('description')
  const [activeImage, setActiveImage] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProduct(id)
        setProduct(data)
        setActiveImage(data.image)
        setSelectedVariant(data.variants?.find(variant => variant.countInStock > 0) || data.variants?.[0] || null)
        const { data: reviewData } = await getReviews(id)
        setReviews(reviewData)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const availableStock = selectedVariant ? selectedVariant.countInStock : product?.countInStock

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      image: selectedVariant?.image || activeImage || product.image,
      price: selectedVariant?.price || product.price,
      countInStock: availableStock,
      variantId: selectedVariant?._id,
      variantName: selectedVariant?.name,
      cartKey: `${product._id}:${selectedVariant?._id || 'default'}`,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/cart')
  }

  const handleReview = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (comment.trim().length < 10) {
      setReviewError('Write at least 10 characters before submitting your review.')
      return
    }
    setReviewLoading(true)
    setReviewError('')
    setReviewSuccess('')
    try {
      await addReview(id, { rating, comment })
      setReviewSuccess('Review added successfully!')
      setComment('')
      const { data: reviewData } = await getReviews(id)
      setReviews(reviewData)
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not add review')
    } finally {
      setReviewLoading(false)
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
                fetchpriority='high'
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
              <strong>{formatCurrency(displayPrice)}</strong>
              {product.compareAtPrice > displayPrice && (
                <span>{formatCurrency(product.compareAtPrice)}</span>
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
                        setQuantity(1)
                        if (variant.image) setActiveImage(variant.image)
                      }}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {availableStock > 0 && (
              <div className='glory-product-quantity'>
                <span>Quantity</span>
                <div>
                  <button
                    type='button'
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label='Decrease quantity'
                  >
                    <FiMinus size={15} />
                  </button>
                  <output aria-live='polite'>{quantity}</output>
                  <button
                    type='button'
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock}
                    aria-label='Increase quantity'
                  >
                    <FiPlus size={15} />
                  </button>
                </div>
              </div>
            )}

            <div className='glory-product-actions-v2'>
              <button
                type='button'
                className='is-primary'
                onClick={handleAddToCart}
                disabled={availableStock === 0}
              >
                {added ? <FiCheck size={17} /> : <FiShoppingBag size={17} />}
                {added ? 'Added to bag' : 'Add to bag'}
              </button>
              <button
                type='button'
                className='is-secondary'
                onClick={handleBuyNow}
                disabled={availableStock === 0}
              >
                Buy now
              </button>
            </div>

            <div className='glory-product-confidence'>
              {[
                {
                  Icon: FiShield,
                  title: product.seller?.sellerProfile?.verificationStatus === 'verified'
                    ? 'Verified seller'
                    : 'Reviewed seller',
                  text: product.seller?.sellerProfile?.storeName || 'Seller details reviewed by Glory',
                },
                {
                  Icon: FiShoppingBag,
                  title: 'Confirmed checkout',
                  text: 'Order totals are confirmed before payment',
                },
                {
                  Icon: FiTruck,
                  title: 'Delivery clarity',
                  text: 'Delivery details are confirmed during checkout',
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
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className='glory-reviews-layout' role='tabpanel'>
              <div className='glory-review-form'>
                <span className='glory-product-section-label'>Your experience</span>
                <h2>Write a review</h2>
                <p>Reviews are available to verified purchasers after payment or delivery.</p>

                {reviewError && <Message type='error' text={reviewError} />}
                {reviewSuccess && <Message type='success' text={reviewSuccess} />}

                <fieldset>
                  <legend>Your rating</legend>
                  <div className='glory-review-stars'>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type='button'
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star === 1 ? '' : 's'}`}
                        aria-pressed={rating === star}
                      >
                        <FiStar size={22} fill={star <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label>
                  <span>Your review</span>
                  <textarea
                    value={comment}
                    onChange={event => setComment(event.target.value)}
                    placeholder='Share what you liked and how you used it.'
                    rows={5}
                  />
                </label>

                <button type='button' className='glory-review-submit' onClick={handleReview} disabled={reviewLoading}>
                  {reviewLoading ? 'Submitting...' : 'Submit review'}
                </button>
              </div>

              <div className='glory-review-list'>
                {reviews.length === 0 ? (
                  <div className='glory-review-empty'>
                    <strong>No reviews yet.</strong>
                    <span>Verified purchasers can be the first to share their experience.</span>
                  </div>
                ) : reviews.map((review, index) => (
                  <article key={`${review.name}-${review.createdAt}-${index}`}>
                    <header>
                      <div>
                        <strong>{review.name}</strong>
                        <small>
                          {new Date(review.createdAt).toLocaleDateString('en-CA', {
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
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ProductDetailPage
