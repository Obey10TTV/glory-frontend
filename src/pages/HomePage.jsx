import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiCheckCircle,
  FiHeart,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { getProducts } from '../api'

const categoryTiles = [
  {
    name: 'Skincare',
    note: 'Barrier, glow, SPF',
    image: 'https://images.pexels.com/photos/6724440/pexels-photo-6724440.jpeg?auto=compress&cs=tinysrgb&w=720',
    imagePosition: 'center 38%',
  },
  {
    name: 'Makeup',
    note: 'Complexion to lip',
    image: 'https://images.pexels.com/photos/2688991/pexels-photo-2688991.jpeg?auto=compress&cs=tinysrgb&w=720',
    imagePosition: 'center 48%',
  },
  {
    name: 'Haircare',
    note: 'Wash day ready',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=720',
    imagePosition: 'center 42%',
  },
  {
    name: 'Nails',
    note: 'Salon finish',
    image: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=720',
    imagePosition: 'center 48%',
  },
  {
    name: 'Lashes',
    note: 'Soft to dramatic',
    image: 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=720',
    imagePosition: 'center 34%',
  },
  {
    name: 'Fragrance',
    note: 'Signature scents',
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=720',
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

const editorialCampaigns = [
  {
    eyebrow: 'The skincare edit',
    title: 'Fresh starts here.',
    copy: 'Hydration, barrier care and daily SPF for routines that feel as good as they look.',
    image: '/images/home/skincare-edit.jpg',
    category: 'Skincare',
    tone: 'light',
  },
  {
    eyebrow: 'Colour, your way',
    title: 'Make your statement.',
    copy: 'Complexion, lip and eye favourites selected for expression across every shade.',
    image: '/images/home/makeup-edit.jpg',
    category: 'Makeup',
    tone: 'dark',
  },
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

  const renderCatalogState = (items, emptyCopy) => {
    if (loading) return <Loader />

    if (catalogError) {
      return (
        <div className='glory-catalog-alert glory-catalog-alert-wide'>
          <FiRefreshCw size={22} aria-hidden='true' />
          <strong>The live edit is taking a short pause.</strong>
          <span>{catalogError}</span>
          <button type='button' onClick={loadProducts}>Try again</button>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className='glory-home-empty'>
          <strong>{emptyCopy}</strong>
          <button type='button' onClick={() => navigate('/products')}>
            Explore all beauty
            <FiArrowRight size={16} />
          </button>
        </div>
      )
    }

    return (
      <div className='glory-product-grid glory-home-product-grid'>
        {items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    )
  }

  return (
    <div className='glory-page glory-home-page glory-home-v2'>
      <Navbar />

      <main>
        <section className='glory-campaign-hero' aria-labelledby='glory-home-title'>
          <img
            className='glory-campaign-hero-image'
            src='/images/home/glory-editorial-hero.jpg'
            alt='Two women beside an edit of skincare and makeup'
            width='1672'
            height='940'
            fetchpriority='high'
          />
          <div className='glory-campaign-hero-wash' />
          <div className='glory-campaign-hero-inner'>
            <span className='glory-home-label'>Glory beauty, Canada</span>
            <h1 id='glory-home-title'>Beauty, in all your glory.</h1>
            <p>
              Authentic beauty for every shade, texture and ritual, selected from independent sellers and loved brands.
            </p>
            <div className='glory-campaign-actions'>
              <button type='button' className='is-primary' onClick={() => navigate('/products')}>
                <FiShoppingBag size={17} />
                Shop now
              </button>
              <button type='button' className='is-secondary' onClick={() => navigate('/sell-on-glory')}>
                Start selling
                <FiArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <section className='glory-home-section glory-department-section' aria-labelledby='glory-departments-title'>
          <div className='glory-home-shell'>
            <div className='glory-home-heading-row'>
              <div>
                <span className='glory-home-label'>Find your department</span>
                <h2 id='glory-departments-title'>The beauty edit</h2>
              </div>
              <button type='button' className='glory-home-view-all' onClick={() => navigate('/products')}>
                Shop all
                <FiArrowRight size={16} />
              </button>
            </div>

            <div className='glory-department-rail'>
              {categoryTiles.map((category) => (
                <button
                  key={category.name}
                  type='button'
                  className='glory-department'
                  onClick={() => shopCategory(category.name)}
                  aria-label={`Shop ${category.name}`}
                >
                  <span className='glory-department-image'>
                    <img
                      src={category.image}
                      alt=''
                      loading='lazy'
                      width='480'
                      height='480'
                      style={{ objectPosition: category.imagePosition }}
                    />
                  </span>
                  <strong>{category.name}</strong>
                  <small>
                    {categoryCounts[category.name]
                      ? `${categoryCounts[category.name]} products`
                      : category.note}
                  </small>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className='glory-home-section glory-home-products' aria-labelledby='glory-new-in-title'>
          <div className='glory-home-shell'>
            <div className='glory-home-heading-row'>
              <div>
                <span className='glory-home-label'>Just landed</span>
                <h2 id='glory-new-in-title'>New in</h2>
                <p>Recently approved products, refreshed automatically from the Glory marketplace.</p>
              </div>
              <button type='button' className='glory-home-view-all' onClick={() => navigate('/products')}>
                View all
                <FiArrowRight size={16} />
              </button>
            </div>

            {arrivalCategories.length > 1 && (
              <div className='glory-home-filter' aria-label='Filter new arrivals by category'>
                {arrivalCategories.map((category) => (
                  <button
                    key={category}
                    type='button'
                    className={arrivalCategory === category ? 'is-active' : ''}
                    onClick={() => setArrivalCategory(category)}
                    aria-pressed={arrivalCategory === category}
                  >
                    {category}
                    {category !== 'All' && <span>{categoryCounts[category]}</span>}
                  </button>
                ))}
              </div>
            )}

            {renderCatalogState(latestProducts, 'New arrivals are being prepared.')}
          </div>
        </section>

        <section className='glory-home-section glory-campaigns-section' aria-label='Featured beauty edits'>
          <div className='glory-home-shell glory-campaign-grid'>
            {editorialCampaigns.map((campaign) => (
              <button
                key={campaign.title}
                type='button'
                className={`glory-editorial-campaign is-${campaign.tone}`}
                onClick={() => shopCategory(campaign.category)}
                aria-label={`Shop ${campaign.category}: ${campaign.title}`}
              >
                <img
                  src={campaign.image}
                  alt=''
                  loading='lazy'
                  width='1536'
                  height='1024'
                />
                <span className='glory-editorial-campaign-wash' />
                <span className='glory-editorial-campaign-copy'>
                  <span>{campaign.eyebrow}</span>
                  <strong>{campaign.title}</strong>
                  <small>{campaign.copy}</small>
                  <b>
                    Shop {campaign.category}
                    <FiArrowRight size={16} />
                  </b>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className='glory-home-section glory-home-products glory-bestsellers-section' aria-labelledby='glory-bestsellers-title'>
          <div className='glory-home-shell'>
            <div className='glory-home-heading-row'>
              <div>
                <span className='glory-home-label'>The community edit</span>
                <h2 id='glory-bestsellers-title'>Most loved</h2>
                <p>Top-rated products and current marketplace favourites.</p>
              </div>
              <button type='button' className='glory-home-view-all' onClick={() => navigate('/products')}>
                View all
                <FiArrowRight size={16} />
              </button>
            </div>

            {renderCatalogState(bestsellerProducts, 'Community favourites are coming soon.')}
          </div>
        </section>

        <section className='glory-home-seller'>
          <div className='glory-home-shell glory-home-seller-inner'>
            <div>
              <span className='glory-home-label'>For independent beauty brands</span>
              <h2>Your next customer is already looking.</h2>
            </div>
            <div>
              <p>
                Build a verified Glory storefront, submit products for review and sell to beauty shoppers across Canada.
              </p>
              <button type='button' onClick={() => navigate('/sell-on-glory')}>
                Sell on Glory
                <FiArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <section className='glory-home-trust' aria-label='Why shop with Glory'>
          <div className='glory-home-shell glory-home-trust-grid'>
            {[
              { Icon: FiCheckCircle, title: 'Reviewed listings', sub: 'Products are checked before going live' },
              { Icon: FiShield, title: 'Secure accounts', sub: 'Email verification and optional 2FA' },
              { Icon: FiTruck, title: 'Canada-first', sub: 'Built for beauty shoppers across Canada' },
              { Icon: FiHeart, title: 'Beauty for more people', sub: 'Across shades, textures and traditions' },
            ].map((item) => (
              <div key={item.title} className='glory-home-trust-item'>
                <item.Icon size={21} aria-hidden='true' />
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.sub}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
