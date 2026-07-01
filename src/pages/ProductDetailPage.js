import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getProduct, addReview, getReviews } from '../api'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { FiShoppingBag, FiHeart, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useUser()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [wished, setWished] = useState(false)
  const [added, setAdded] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProduct(id)
        setProduct(data)
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

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart({ ...product, quantity })
    navigate('/cart')
  }

  const handleReview = async () => {
    if (!user) {
      navigate('/login')
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
  if (!product) return <><Navbar /><Message type='error' text='Product not found' /></>

  return (
    <div className='glory-page' style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      <div className='glory-container' style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{
          fontSize: '12px', color: '#999',
          marginBottom: '32px', display: 'flex',
          alignItems: 'center', gap: '8px'
        }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
          <span>›</span>
          <span onClick={() => navigate(`/products?category=${product.category}`)} style={{ cursor: 'pointer' }}>{product.category}</span>
          <span>›</span>
          <span style={{ color: '#111' }}>{product.name}</span>
        </div>

        <div className='glory-product-detail-grid' style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px', marginBottom: '60px'
        }}>

          <div className='glory-product-detail-media' style={{
            borderRadius: '20px', overflow: 'hidden',
            background: '#fdf0f5', aspectRatio: '1',
            position: 'relative'
          }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              onClick={() => setWished(!wished)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                width: '44px', height: '44px',
                background: 'rgba(255,255,255,0.9)',
                border: 'none', borderRadius: '50%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <FiHeart
                size={18}
                style={{
                  color: wished ? '#e74c3c' : '#aaa',
                  fill: wished ? '#e74c3c' : 'none'
                }}
              />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <div style={{
                fontSize: '11px', color: '#c97a9a',
                fontWeight: '600', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '8px'
              }}>
                {product.brand}
              </div>
              <h1 style={{
                fontSize: '28px', fontWeight: '700',
                color: '#111', lineHeight: '1.2',
                marginBottom: '12px'
              }}>
                {product.name}
              </h1>

              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '8px', marginBottom: '4px'
              }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(star => (
                    <FiStar
                      key={star}
                      size={14}
                      style={{
                        fill: star <= Math.round(product.rating) ? '#f5c842' : 'none',
                        stroke: star <= Math.round(product.rating) ? '#f5c842' : '#ddd'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '13px', color: '#888' }}>
                  {product.rating.toFixed(1)} ({product.numReviews} reviews)
                </span>
              </div>
            </div>

            <div style={{
              fontSize: '32px', fontWeight: '700', color: '#111'
            }}>
              ${product.price.toLocaleString()}
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#fdf0f5', borderRadius: '999px',
              padding: '6px 14px', width: 'fit-content'
            }}>
              <span style={{ fontSize: '12px', color: '#c97a9a', fontWeight: '500' }}>
                {product.category}
              </span>
            </div>

            <div style={{
              fontSize: '13px',
              color: product.countInStock > 0 ? '#2ecc71' : '#e74c3c',
              fontWeight: '600'
            }}>
              {product.countInStock > 0 ? `✓ In Stock (${product.countInStock} available)` : '✗ Out of Stock'}
            </div>

            {product.countInStock > 0 && (
              <div>
                <div style={{
                  fontSize: '12px', fontWeight: '600',
                  color: '#444', marginBottom: '10px'
                }}>
                  Quantity
                </div>
                <div className='glory-stepper' style={{
                  display: 'flex', alignItems: 'center',
                  gap: '0', border: '1px solid #eee',
                  borderRadius: '999px', width: 'fit-content',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: '40px', height: '40px',
                      border: 'none', background: '#f5f5f5',
                      cursor: 'pointer', fontSize: '16px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >−</button>
                  <span style={{
                    padding: '0 20px', fontSize: '14px',
                    fontWeight: '600', color: '#111'
                  }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                    style={{
                      width: '40px', height: '40px',
                      border: 'none', background: '#f5f5f5',
                      cursor: 'pointer', fontSize: '16px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >+</button>
                </div>
              </div>
            )}

            <div className='glory-product-actions' style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className='glory-btn'
                style={{
                  flex: 1, padding: '15px',
                  fontSize: '14px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px'
                }}
              >
                <FiShoppingBag size={16} />
                {added ? 'Added!' : 'Add to Bag'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.countInStock === 0}
                style={{
                  flex: 1, padding: '15px',
                  fontSize: '14px', fontWeight: '600',
                  border: '1.5px solid #111',
                  borderRadius: '999px',
                  background: '#fff', color: '#111',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                Buy Now
              </button>
            </div>

            <div className='glory-perks' style={{
              display: 'flex', flexDirection: 'column',
              gap: '10px', padding: '20px',
              background: '#fafaf9', borderRadius: '12px',
              border: '0.5px solid #eee'
            }}>
              {[
                { icon: <FiTruck size={15} />, text: 'Free shipping on orders over $75' },
                { icon: <FiShield size={15} />, text: '100% authentic products guaranteed' },
                { icon: <FiRefreshCw size={15} />, text: 'Easy returns within 30 days' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', fontSize: '12px', color: '#555'
                }}>
                  <span style={{ color: '#c97a9a' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex', gap: '0',
            borderBottom: '0.5px solid #eee',
            marginBottom: '28px'
          }}>
            {['description', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  border: 'none', background: 'none',
                  fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer',
                  color: activeTab === tab ? '#111' : '#888',
                  borderBottom: activeTab === tab ? '2px solid #111' : '2px solid transparent',
                  textTransform: 'capitalize',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                {tab} {tab === 'reviews' && `(${reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div style={{
              fontSize: '14px', color: '#555',
              lineHeight: '1.8', maxWidth: '680px'
            }}>
              {product.description}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ maxWidth: '680px' }}>

              <div className='glory-review-card' style={{
                background: '#fff', borderRadius: '16px',
                padding: '24px', border: '0.5px solid #eee',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '15px', fontWeight: '600',
                  color: '#111', marginBottom: '16px'
                }}>
                  Write a Review
                </div>

                {reviewError && <Message type='error' text={reviewError} />}
                {reviewSuccess && <Message type='success' text={reviewSuccess} />}

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    color: '#444', marginBottom: '8px'
                  }}>
                    Your Rating
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4,5].map(star => (
                      <FiStar
                        key={star}
                        size={24}
                        onClick={() => setRating(star)}
                        style={{
                          cursor: 'pointer',
                          fill: star <= rating ? '#f5c842' : 'none',
                          stroke: star <= rating ? '#f5c842' : '#ddd',
                          transition: 'all 0.15s'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    color: '#444', marginBottom: '8px'
                  }}>
                    Your Review
                  </div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder='Share your experience with this product...'
                    rows={4}
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: '0.5px solid #ddd', borderRadius: '10px',
                      fontSize: '13px', color: '#111',
                      outline: 'none', resize: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                      background: '#fafaf9'
                    }}
                  />
                </div>

                <button
                  onClick={handleReview}
                  disabled={reviewLoading}
                  className='glory-btn'
                  style={{
                    padding: '12px 28px',
                    fontSize: '13px',
                    opacity: reviewLoading ? 0.7 : 1
                  }}
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>

              {reviews.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '40px',
                  color: '#888', fontSize: '14px'
                }}>
                  No reviews yet. Be the first to review this product!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map((review, i) => (
                    <div key={i} style={{
                      background: '#fff', borderRadius: '14px',
                      padding: '20px', border: '0.5px solid #eee'
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: '10px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '14px', fontWeight: '600', color: '#111'
                          }}>
                            {review.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                            {new Date(review.createdAt).toLocaleDateString('en-CA', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(star => (
                            <FiStar
                              key={star}
                              size={12}
                              style={{
                                fill: star <= review.rating ? '#f5c842' : 'none',
                                stroke: star <= review.rating ? '#f5c842' : '#ddd'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '13px', color: '#555', lineHeight: '1.7'
                      }}>
                        {review.comment}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductDetailPage
