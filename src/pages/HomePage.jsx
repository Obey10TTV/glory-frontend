import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { getProducts } from '../api'
import {
  FiArrowRight,
  FiCheckCircle,
  FiHeart,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi'

const categoryTiles = [
  {
    name: 'Skincare',
    kicker: 'Barrier, glow, SPF',
    copy: 'Cleansers, serums, masks and daily essentials for every routine.',
    image: 'https://images.pexels.com/photos/6724440/pexels-photo-6724440.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imagePosition: 'center 38%',
  },
  {
    name: 'Makeup',
    kicker: 'Complexion to lip',
    copy: 'Pigment, finish and shade range for soft glam or full beat.',
    image: 'https://images.pexels.com/photos/2688991/pexels-photo-2688991.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imagePosition: 'center 48%',
  },
  {
    name: 'Haircare',
    kicker: 'Wash day ready',
    copy: 'Moisture, scalp care, styling and protective-hair favorites.',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imagePosition: 'center 42%',
  },
  {
    name: 'Nails',
    kicker: 'Salon finish',
    copy: 'Polish, press-ons, nail care and sets made for clean detail.',
    image: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imagePosition: 'center 48%',
  },
  {
    name: 'Lashes',
    kicker: 'Soft to dramatic',
    copy: 'Everyday clusters, strips and lash tools with a lifted finish.',
    image: 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imagePosition: 'center 34%',
  },
  {
    name: 'Fragrance',
    kicker: 'Signature scents',
    copy: 'Perfume oils, sprays and body mists that linger beautifully.',
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imagePosition: 'center 50%',
  },
]

const categoryOrder = [
  'Skincare',
  'Makeup',
  'Haircare',
  'Nails',
  'Lashes',
  'Fragrance',
  'Body Care',
  'Body Liquid',
  'Scented Candles',
  'Tools & Accessories',
]

const getProductTime = (product) => {
  const time = new Date(product.createdAt || product.updatedAt || 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

const HomePage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [arrivalCategory, setArrivalCategory] = useState('All')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
      setCatalogError('')
    } catch (error) {
      setProducts([])
      setCatalogError('Live products are temporarily unavailable. The rest of Glory is still open to explore.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const shopCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`)
  }

  const sortedProducts = products
    .slice()
    .sort((a, b) => getProductTime(b) - getProductTime(a))

  const categoryCounts = sortedProducts.reduce((counts, product) => {
    if (!product.category) return counts
    counts[product.category] = (counts[product.category] || 0) + 1
    return counts
  }, {})

  const arrivalCategories = [
    'All',
    ...categoryOrder.filter((category) => categoryCounts[category]),
    ...Object.keys(categoryCounts).filter((category) => !categoryOrder.includes(category)),
  ]

  const latestProducts = sortedProducts
    .filter((product) => arrivalCategory === 'All' || product.category === arrivalCategory)
    .slice(0, 4)

  const bestsellerProducts = sortedProducts
    .slice()
    .sort((a, b) => {
      const ratingScore = (b.rating || 0) - (a.rating || 0)
      if (ratingScore !== 0) return ratingScore
      const reviewScore = (b.numReviews || 0) - (a.numReviews || 0)
      if (reviewScore !== 0) return reviewScore
      return getProductTime(b) - getProductTime(a)
    })
    .slice(0, 4)

  return (
    <div className='glory-page glory-home-page'>
      <Navbar />

      <section className='glory-hero'>
        <video
          autoPlay
          muted
          loop
          playsInline
          className='glory-hero-video'
        >
          <source src='https://res.cloudinary.com/dd8y3dijs/video/upload/v1780042517/5937414-uhd_2160_3840_24fps_i28m6z.mp4' type='video/mp4' />
        </video>
        <div className='glory-hero-scrim' />
        <div className='glory-hero-content'>
          <div className='glory-eyebrow glory-hero-kicker'>Canada's home for global beauty</div>
          <h1 className='glory-hero-title'>Glow. Shine. Glory.</h1>
          <p className='glory-hero-copy'>
            Discover authentic beauty products from independent sellers and loved brands, curated for every shade, texture and tradition across Canada.
          </p>
          <div className='glory-actions'>
            <button className='glory-hero-primary' onClick={() => navigate('/products')}>
              <FiShoppingBag size={18} />
              Shop now
            </button>
            <button className='glory-hero-secondary' onClick={() => navigate('/sell-on-glory')}>
              Start selling
              <FiArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className='glory-marquee' aria-label='Store benefits'>
        <div className='glory-marquee-track'>
          {[...Array(3)].map((_, index) => (
            <span key={index} className='glory-marquee-group'>
              <span>Beauty across every texture and tone</span>
              <span>Independent beauty sellers</span>
              <span>Curated departments</span>
              <span>Made for beauty shoppers in Canada</span>
            </span>
          ))}
        </div>
      </section>

      <section className='glory-section glory-category-showcase'>
        <div className='glory-section-inner'>
          <div className='glory-home-heading'>
            <span className='glory-eyebrow'>Shop by category</span>
            <h2>Shop the beauty edit.</h2>
            <p>Find the department that fits your routine, from everyday essentials to the finishing details.</p>
          </div>

          <div className='glory-category-grid glory-category-grid-rich'>
            {categoryTiles.map((category, index) => (
              <button
                key={category.name}
                className={`glory-category-card glory-category-card-rich ${index < 2 ? 'glory-category-featured' : ''}`}
                onClick={() => shopCategory(category.name)}
                aria-label={`Shop ${category.name}`}
              >
                <img
                  src={category.image}
                  alt={`${category.name} beauty products`}
                  loading='lazy'
                  width='900'
                  height='1080'
                  style={{ objectPosition: category.imagePosition }}
                />
                <span className='glory-category-gradient' />
                <span className='glory-category-content'>
                  <span className='glory-category-kicker'>{category.kicker}</span>
                  <span className='glory-category-name'>{category.name}</span>
                  <span className='glory-category-copy'>{category.copy}</span>
                  <span className='glory-category-link'>
                    Shop {category.name}
                    <FiArrowRight size={16} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className='glory-section-tight glory-arrivals-section'>
        <div className='glory-section-inner'>
          <div className='glory-section-header glory-section-header-rich'>
            <div>
              <span className='glory-eyebrow'>Just dropped</span>
              <h2 className='glory-section-title'>New in</h2>
              <p className='glory-section-subtitle'>The latest approved beauty, with quick filters to take you straight to your department.</p>
            </div>
            <button className='glory-text-link' onClick={() => navigate('/products')}>
              View all
              <FiArrowRight size={16} />
            </button>
          </div>

          {arrivalCategories.length > 1 && (
            <div className='glory-arrival-filter glory-arrival-filter-light' aria-label='Filter new arrivals by category'>
              {arrivalCategories.map((category) => (
                <button
                  key={category}
                  type='button'
                  className={arrivalCategory === category ? 'is-active' : ''}
                  onClick={() => setArrivalCategory(category)}
                >
                  {category}
                  {category !== 'All' && <span>{categoryCounts[category]}</span>}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <Loader />
          ) : catalogError ? (
            <div className='glory-catalog-alert glory-catalog-alert-wide'>
              <FiRefreshCw size={22} aria-hidden='true' />
              <strong>The live edit is taking a short pause.</strong>
              <span>{catalogError}</span>
              <button type='button' onClick={loadProducts}>Try again</button>
            </div>
          ) : latestProducts.length > 0 ? (
            <div className='glory-product-grid'>
              {latestProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className='glory-editorial-grid'>
              {categoryTiles.slice(0, 4).map((item) => (
                <button
                  className='glory-editorial-card glory-curated-category-card'
                  key={item.name}
                  onClick={() => shopCategory(item.name)}
                >
                  <span className='glory-editorial-media'>
                    <img src={item.image} alt={`${item.name} category`} loading='lazy' width='640' height='520' />
                  </span>
                  <span className='glory-editorial-body'>
                    <span>Explore the edit</span>
                    <strong>{item.name}</strong>
                    <small>{item.kicker}</small>
                    <b>Shop category <FiArrowRight size={14} /></b>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className='glory-section'>
        <div className='glory-section-inner'>
          <div className='glory-section-header glory-section-header-rich'>
            <div>
              <span className='glory-eyebrow'>Most loved</span>
              <h2 className='glory-section-title'>Bestsellers</h2>
            </div>
            <button className='glory-text-link' onClick={() => navigate('/products')}>
              View all
              <FiArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : catalogError ? (
            <div className='glory-brand-strip'>
              <div>
                <FiRefreshCw size={22} />
                <strong>Bestsellers will return with the live catalogue.</strong>
                <span>Explore Glory's beauty departments while the product service is paused.</span>
              </div>
              <button type='button' onClick={loadProducts}>Try again</button>
            </div>
          ) : bestsellerProducts.length > 0 ? (
            <div className='glory-product-grid'>
              {bestsellerProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className='glory-brand-strip'>
              <div>
                <FiHeart size={22} />
                <strong>More products coming next.</strong>
                <span>Once we add more database items, this section will automatically become a real bestseller grid.</span>
              </div>
              <button onClick={() => navigate('/products')}>
                Browse current products
                <FiArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className='glory-sell-banner'>
        <div className='glory-sell-banner-inner'>
          <span className='glory-eyebrow'>For independent beauty brands</span>
          <h2>Build your storefront on Glory.</h2>
          <p>
            Create a seller account, complete verification and submit products for review before they reach shoppers.
          </p>
          <button onClick={() => navigate('/register')}>
            Apply to sell
            <FiArrowRight size={17} />
          </button>
        </div>
      </section>

      <section className='glory-trust-strip'>
        {[
          { Icon: FiCheckCircle, title: 'Reviewed listings', sub: 'Products are checked before going live' },
          { Icon: FiShield, title: 'Secure accounts', sub: 'Email verification and optional 2FA' },
          { Icon: FiTruck, title: 'Canada-first', sub: 'Built for beauty shoppers across Canada' },
          { Icon: FiHeart, title: 'Beauty for more people', sub: 'Across shades, textures and traditions' },
        ].map((item) => (
          <div key={item.title} className='glory-trust-item'>
            <span>
              <item.Icon size={20} />
            </span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.sub}</small>
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  )
}

export default HomePage
