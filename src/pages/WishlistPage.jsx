import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { FiArrowRight, FiHeart, FiRefreshCw } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../api'
import { getWishlistIds } from '../utils/wishlist'

const WishlistPage = () => {
  const navigate = useNavigate()
  const [wishlistIds, setWishlistIds] = useState(getWishlistIds)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const refreshWishlist = () => setWishlistIds(getWishlistIds())
    window.addEventListener('glory:wishlist-change', refreshWishlist)
    return () => window.removeEventListener('glory:wishlist-change', refreshWishlist)
  }, [])

  useEffect(() => {
    const loadSavedProducts = async () => {
      setLoading(true)
      try {
        const { data } = await getProducts()
        setProducts(Array.isArray(data) ? data : [])
        setError('')
      } catch (requestError) {
        setError('Saved products will appear again when the live catalogue is available.')
      } finally {
        setLoading(false)
      }
    }

    loadSavedProducts()
  }, [])

  const savedProducts = products.filter((product) => wishlistIds.includes(product._id))

  return (
    <div className='glory-page'>
      <Navbar />
      <main className='glory-section glory-wishlist-page'>
        <div className='glory-section-inner'>
          <div className='glory-section-header glory-section-header-rich'>
            <div>
              <span className='glory-eyebrow'>Your edit</span>
              <h1 className='glory-section-title'>Saved beauty</h1>
              <p className='glory-section-subtitle'>Products you heart are kept on this device for an easy return.</p>
            </div>
            <button className='glory-text-link' onClick={() => navigate('/products')}>
              Keep shopping <FiArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className='glory-catalog-alert glory-catalog-alert-wide'>
              <FiRefreshCw size={22} aria-hidden='true' />
              <strong>Your saved edit is still here.</strong>
              <span>{error}</span>
            </div>
          ) : savedProducts.length > 0 ? (
            <div className='glory-product-grid'>
              {savedProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          ) : (
            <div className='glory-wishlist-empty'>
              <FiHeart size={30} />
              <strong>Nothing saved yet.</strong>
              <span>Tap the heart on any product to build your personal edit.</span>
              <button type='button' onClick={() => navigate('/products')}>Explore products</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default WishlistPage
