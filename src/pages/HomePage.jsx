import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  FiArrowLeft,
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
import { getHomepagePromotions, getProducts } from '../api'

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

const heroSlides = [
  {
    id: 'glory-edit',
    eyebrow: 'Glory beauty, United Kingdom',
    title: 'Beauty, in all your glory.',
    copy: 'Discover authentic beauty across every shade, texture and ritual. Chosen for you by independent sellers and beloved brands.',
    image: '/images/home/glory-editorial-hero.jpg',
    imagePosition: 'center',
    primaryLabel: 'Shop new in',
    primaryPath: '/products',
    secondaryLabel: 'Start selling',
    secondaryPath: '/sell-on-glory',
    tone: 'light',
  },
  {
    id: 'skincare-ritual',
    eyebrow: 'The ritual starts here',
    title: 'Your glow has a routine.',
    copy: 'Build a considered skincare shelf, from first cleanse to the final layer of SPF.',
    image: '/images/home/skincare-edit.jpg',
    imagePosition: 'center',
    primaryLabel: 'Shop skincare',
    primaryPath: '/products?category=Skincare',
    secondaryLabel: 'Explore all beauty',
    secondaryPath: '/products',
    tone: 'dark',
  },
  {
    id: 'makeup-expression',
    eyebrow: 'Colour, your way',
    title: 'Made to be seen.',
    copy: 'Everyday complexion, statement lips and detail-led colour for whichever version of you arrives today.',
    image: '/images/home/makeup-edit.jpg',
    imagePosition: 'center',
    primaryLabel: 'Shop makeup',
    primaryPath: '/products?category=Makeup',
    secondaryLabel: 'Meet the sellers',
    secondaryPath: '/sell-on-glory',
    tone: 'dark',
  },
]

const editorialStories = [
  {
    title: 'The skin barrier edit',
    copy: 'Cleansers, treatment and protective layers that support your skin without asking it to be anything else.',
    label: 'Skincare',
    category: 'Skincare',
    image: 'https://images.pexels.com/photos/6724440/pexels-photo-6724440.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imagePosition: 'center 38%',
    tone: 'paper',
  },
  {
    title: 'Texture has a story',
    copy: 'Haircare for wash days, protective styles and the little rituals that make a good day better.',
    label: 'Haircare',
    category: 'Haircare',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imagePosition: 'center 42%',
    tone: 'ink',
  },
]

const getProductTime = (product) => {
  const time = new Date(product.createdAt || product.updatedAt || 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

const HomePage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [sponsoredProducts, setSponsoredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [arrivalCategory, setArrivalCategory] = useState('All')
  const [activeSlide, setActiveSlide] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const heroSwipeStartX = useRef(null)

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

  const loadSponsoredProducts = useCallback(async () => {
    try {
      const { data } = await getHomepagePromotions()
      const items = Array.isArray(data?.items) ? data.items : []
      setSponsoredProducts(items
        .filter((item) => item?.listing)
        .map((item) => ({ ...item.listing, isSponsored: true, promotionEndsAt: item.endsAt })))
    } catch (error) {
      setSponsoredProducts([])
    }
  }, [])

  useEffect(() => {
    loadProducts()
    loadSponsoredProducts()
  }, [loadProducts, loadSponsoredProducts])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(motionQuery.matches)
    updateMotionPreference()
    motionQuery.addEventListener('change', updateMotionPreference)
    return () => motionQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  const moveHeroSlide = useCallback((direction) => {
    setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length)
  }, [])

  useEffect(() => {
    if (heroPaused || reducedMotion) return undefined
    const interval = window.setInterval(() => {
      moveHeroSlide(1)
    }, 2000)
    return () => window.clearInterval(interval)
  }, [heroPaused, moveHeroSlide, reducedMotion])

  const handleHeroPointerDown = (event) => {
    heroSwipeStartX.current = event.clientX
    setHeroPaused(true)
  }

  const handleHeroPointerUp = (event) => {
    const startX = heroSwipeStartX.current
    heroSwipeStartX.current = null
    setHeroPaused(false)

    if (startX == null || Math.abs(event.clientX - startX) < 44) return
    moveHeroSlide(event.clientX > startX ? -1 : 1)
  }

  const handleHeroPointerCancel = () => {
    heroSwipeStartX.current = null
    setHeroPaused(false)
  }

  const sortedProducts = useMemo(
    () => products.slice().sort((a, b) => getProductTime(b) - getProductTime(a)),
    [products],
  )

  const categoryCounts = useMemo(() => sortedProducts.reduce((counts, product) => {
    if (!product.category) return counts
    counts[product.category] = (counts[product.category] || 0) + 1
    return counts
  }, {}), [sortedProducts])

  const arrivalCategories = useMemo(() => [
    'All',
    ...categoryOrder.filter((category) => categoryCounts[category]),
    ...Object.keys(categoryCounts).filter((category) => !categoryOrder.includes(category)),
  ], [categoryCounts])

  const latestProducts = useMemo(() => sortedProducts
    .filter((product) => arrivalCategory === 'All' || product.category === arrivalCategory)
    .slice(0, 8), [arrivalCategory, sortedProducts])

  const bestsellerProducts = useMemo(() => sortedProducts
    .slice()
    .sort((a, b) => {
      const ratingScore = (b.rating || 0) - (a.rating || 0)
      if (ratingScore !== 0) return ratingScore
      const reviewScore = (b.numReviews || 0) - (a.numReviews || 0)
      if (reviewScore !== 0) return reviewScore
      return getProductTime(b) - getProductTime(a)
    })
    .slice(0, 4), [sortedProducts])

  const shopCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`)
  }

  const renderCatalogState = (items, emptyCopy) => {
    if (loading) return <Loader />

    if (catalogError) {
      return (
        <div className='glory-home-catalog-alert' role='status'>
          <FiRefreshCw size={20} aria-hidden='true' />
          <div>
            <strong>The live edit is taking a short pause.</strong>
            <span>{catalogError}</span>
          </div>
          <button type='button' onClick={loadProducts}>Try again</button>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className='glory-home-empty-v3'>
          <strong>{emptyCopy}</strong>
          <button type='button' onClick={() => navigate('/products')}>
            Explore all beauty
            <FiArrowRight size={16} aria-hidden='true' />
          </button>
        </div>
      )
    }

    return (
      <div className='glory-product-grid glory-home-product-grid-v3'>
        {items.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    )
  }

  const selectedHero = heroSlides[activeSlide]

  return (
    <div className='glory-page glory-home-page glory-home-v3'>
      <Navbar />

      <main>
        <section
          className={`glory-home-stage is-${selectedHero.tone}`}
          aria-roledescription='carousel'
          aria-label='Featured Glory beauty collections'
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
          onFocus={() => setHeroPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false)
          }}
          onPointerDown={handleHeroPointerDown}
          onPointerUp={handleHeroPointerUp}
          onPointerCancel={handleHeroPointerCancel}
        >
          <div className='glory-home-shell-v3'>
            <div className='glory-home-stage-frame'>
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.id}
                  className={`glory-home-stage-image ${index === activeSlide ? 'is-active' : ''}`}
                  src={slide.image}
                  alt=''
                  aria-hidden={index !== activeSlide}
                  width='1672'
                  height='940'
                  style={{ objectPosition: slide.imagePosition }}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              ))}

              <div className='glory-home-stage-copy'>
                <span className='glory-home-kicker'>{selectedHero.eyebrow}</span>
                <h1>{selectedHero.title}</h1>
                <p>{selectedHero.copy}</p>
                <div className='glory-home-stage-actions'>
                  <button type='button' className='is-primary' onClick={() => navigate(selectedHero.primaryPath)}>
                    <FiShoppingBag size={17} aria-hidden='true' />
                    {selectedHero.primaryLabel}
                  </button>
                  <button type='button' className='is-secondary' onClick={() => navigate(selectedHero.secondaryPath)}>
                    {selectedHero.secondaryLabel}
                    <FiArrowRight size={17} aria-hidden='true' />
                  </button>
                </div>
              </div>

              <div className='glory-home-stage-controls'>
                <div className='glory-home-stage-arrows'>
                  <button
                    type='button'
                    className='glory-home-round-button'
                    aria-label='Previous featured collection'
                    onClick={() => moveHeroSlide(-1)}
                  >
                    <FiArrowLeft size={18} aria-hidden='true' />
                  </button>
                  <button
                    type='button'
                    className='glory-home-round-button'
                    aria-label='Next featured collection'
                    onClick={() => moveHeroSlide(1)}
                  >
                    <FiArrowRight size={18} aria-hidden='true' />
                  </button>
                </div>

                <div className='glory-home-stage-dots' role='tablist' aria-label='Choose featured collection'>
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type='button'
                      role='tab'
                      aria-selected={activeSlide === index}
                      aria-label={`Show ${slide.title}`}
                      className={activeSlide === index ? 'is-active' : ''}
                      onClick={() => setActiveSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='glory-home-section-v3 glory-home-departments' aria-labelledby='glory-departments-title'>
          <div className='glory-home-shell-v3'>
            <div className='glory-home-section-heading-v3'>
              <div>
                <span className='glory-home-kicker'>Choose your corner</span>
                <h2 id='glory-departments-title'>Beauty with a point of view.</h2>
              </div>
              <button type='button' className='glory-home-text-link' onClick={() => navigate('/products')}>
                Shop everything
                <FiArrowRight size={16} aria-hidden='true' />
              </button>
            </div>

            <div className='glory-home-department-rail'>
              {categoryTiles.map((category) => (
                <button
                  key={category.name}
                  type='button'
                  className='glory-home-department'
                  onClick={() => shopCategory(category.name)}
                  aria-label={`Shop ${category.name}`}
                >
                  <span className='glory-home-department-image'>
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
                  <small>{categoryCounts[category.name] ? `${categoryCounts[category.name]} products` : category.note}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className='glory-home-section-v3 glory-home-new-in' aria-labelledby='glory-new-in-title'>
          <div className='glory-home-shell-v3'>
            <div className='glory-home-section-heading-v3'>
              <div>
                <span className='glory-home-kicker'>Fresh on Glory</span>
                <h2 id='glory-new-in-title'>The new in shelf.</h2>
                <p>Recently approved products move here automatically, so the first look is always current.</p>
              </div>
              <button type='button' className='glory-home-text-link' onClick={() => navigate('/products')}>
                View all
                <FiArrowRight size={16} aria-hidden='true' />
              </button>
            </div>

            {arrivalCategories.length > 1 && (
              <div className='glory-home-filter-v3' aria-label='Filter new arrivals by category'>
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

        {sponsoredProducts.length > 0 && (
          <section className='glory-home-section-v3 glory-home-sponsored' aria-labelledby='glory-sponsored-title'>
            <div className='glory-home-shell-v3'>
              <div className='glory-home-section-heading-v3'>
                <div>
                  <span className='glory-home-kicker'>Sponsored</span>
                  <h2 id='glory-sponsored-title'>Featured by beauty brands.</h2>
                  <p>Paid placements are always labelled and never change a seller&apos;s verification status.</p>
                </div>
                <button type='button' className='glory-home-text-link' onClick={() => navigate('/products')}>
                  Discover all beauty
                  <FiArrowRight size={16} aria-hidden='true' />
                </button>
              </div>
              <div className='glory-product-grid glory-home-product-grid-v3 glory-home-sponsored-grid'>
                {sponsoredProducts.map((product) => <ProductCard key={`sponsored-${product._id}`} product={product} />)}
              </div>
            </div>
          </section>
        )}

        <section className='glory-home-section-v3 glory-home-stories' aria-labelledby='glory-stories-title'>
          <div className='glory-home-shell-v3'>
            <div className='glory-home-section-heading-v3 is-compact'>
              <div>
                <span className='glory-home-kicker'>Make it yours</span>
                <h2 id='glory-stories-title'>Small rituals, big feeling.</h2>
              </div>
            </div>
            <div className='glory-home-story-grid'>
              {editorialStories.map((story) => (
                <button
                  key={story.title}
                  type='button'
                  className={`glory-home-story is-${story.tone}`}
                  onClick={() => shopCategory(story.category)}
                >
                  <img src={story.image} alt='' loading='lazy' width='1200' height='860' style={{ objectPosition: story.imagePosition }} />
                  <span className='glory-home-story-copy'>
                    <span>{story.label}</span>
                    <strong>{story.title}</strong>
                    <small>{story.copy}</small>
                    <b>
                      Shop {story.category}
                      <FiArrowRight size={16} aria-hidden='true' />
                    </b>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className='glory-home-motion' aria-labelledby='glory-motion-title'>
          <div className='glory-home-motion-frame'>
            <div className='glory-home-motion-media'>
              <video
                muted
                loop
                playsInline
                autoPlay={!reducedMotion}
                preload='metadata'
                aria-label='A woman practising a skincare ritual'
              >
                <source src='https://videos.pexels.com/video-files/8154464/8154464-sd_960_506_25fps.mp4' type='video/mp4' />
              </video>
            </div>
            <div className='glory-home-motion-copy'>
              <span className='glory-home-kicker'>Glory in motion</span>
              <h2 id='glory-motion-title'>Take your time with it.</h2>
              <p>Beauty is personal. Discover products, people and routines with room to linger.</p>
              <button type='button' onClick={() => navigate('/products?category=Skincare')}>
                Explore skincare
                <FiArrowRight size={17} aria-hidden='true' />
              </button>
            </div>
          </div>
        </section>

        <section className='glory-home-section-v3 glory-home-most-loved' aria-labelledby='glory-most-loved-title'>
          <div className='glory-home-shell-v3'>
            <div className='glory-home-section-heading-v3'>
              <div>
                <span className='glory-home-kicker'>The community edit</span>
                <h2 id='glory-most-loved-title'>Most wanted.</h2>
                <p>Top-rated pieces and current marketplace favourites.</p>
              </div>
              <button type='button' className='glory-home-text-link' onClick={() => navigate('/products')}>
                Shop the edit
                <FiArrowRight size={16} aria-hidden='true' />
              </button>
            </div>
            {renderCatalogState(bestsellerProducts, 'Community favourites are coming soon.')}
          </div>
        </section>

        <section className='glory-home-seller-v3'>
          <div className='glory-home-shell-v3 glory-home-seller-inner-v3'>
            <div>
              <span className='glory-home-kicker'>For beauty brands with something to say</span>
              <h2>Build your next chapter on Glory.</h2>
            </div>
            <div>
              <p>Open a verified storefront, submit products for review and meet shoppers in the UK and beyond.</p>
              <button type='button' onClick={() => navigate('/sell-on-glory')}>
                Sell on Glory
                <FiArrowRight size={17} aria-hidden='true' />
              </button>
            </div>
          </div>
        </section>

        <section className='glory-home-trust-v3' aria-label='Why shop with Glory'>
          <div className='glory-home-shell-v3 glory-home-trust-grid-v3'>
            {[
              { Icon: FiCheckCircle, title: 'Reviewed listings', sub: 'Products are checked before going live' },
              { Icon: FiShield, title: 'Secure accounts', sub: 'Verification and optional 2FA protect your account' },
              { Icon: FiTruck, title: 'UK rooted, globally open', sub: 'International delivery where available' },
              { Icon: FiHeart, title: 'Made for more of us', sub: 'Every shade, texture and tradition belongs here' },
            ].map((item) => (
              <div key={item.title} className='glory-home-trust-item-v3'>
                <item.Icon size={20} aria-hidden='true' />
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
