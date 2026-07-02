import { useState, useEffect } from 'react'
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
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi'

const categoryTiles = [
  {
    name: 'Skincare',
    kicker: 'Barrier, glow, SPF',
    copy: 'Cleansers, serums, masks and daily essentials for every routine.',
    image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Makeup',
    kicker: 'Complexion to lip',
    copy: 'Pigment, finish and shade range for soft glam or full beat.',
    image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Haircare',
    kicker: 'Wash day ready',
    copy: 'Moisture, scalp care, styling and protective-hair favorites.',
    image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Nails',
    kicker: 'Salon finish',
    copy: 'Polish, press-ons, nail care and sets made for clean detail.',
    image: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Lashes',
    kicker: 'Soft to dramatic',
    copy: 'Everyday clusters, strips and lash tools with a lifted finish.',
    image: 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Fragrance',
    kicker: 'Signature scents',
    copy: 'Perfume oils, sprays and body mists that linger beautifully.',
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
]

const editorialArrivals = [
  {
    name: 'Barrier Repair Serum',
    category: 'Skincare',
    brand: 'GLORY Select',
    price: 'From $28',
    image: 'https://images.pexels.com/photos/5069609/pexels-photo-5069609.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Soft Sculpt Lip Duo',
    category: 'Makeup',
    brand: 'New Season',
    price: 'From $22',
    image: 'https://images.pexels.com/photos/2688991/pexels-photo-2688991.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Hydration Wash Day Kit',
    category: 'Haircare',
    brand: 'Texture Edit',
    price: 'From $36',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Clean Girl Nail Set',
    category: 'Nails',
    brand: 'Studio Drop',
    price: 'From $18',
    image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
]

const routineSteps = [
  {
    title: 'Prep the skin',
    category: 'Skincare',
    copy: 'Start with gentle cleansing, barrier support and daily moisture.',
    image: 'https://images.pexels.com/photos/6724440/pexels-photo-6724440.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    title: 'Build the look',
    category: 'Makeup',
    copy: 'Layer complexion, lip color, lashes and detail without heaviness.',
    image: 'https://images.pexels.com/photos/2253833/pexels-photo-2253833.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    title: 'Finish with scent',
    category: 'Fragrance',
    copy: 'Choose a soft mist, perfume oil or statement fragrance to close it.',
    image: 'https://images.pexels.com/photos/4110337/pexels-photo-4110337.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
]

const concernTiles = [
  { label: 'Hydration', category: 'Skincare', color: '#f7e5d2' },
  { label: 'Glow makeup', category: 'Makeup', color: '#f7dce8' },
  { label: 'Scalp care', category: 'Haircare', color: '#dde9df' },
  { label: 'Press-on sets', category: 'Nails', color: '#e7def6' },
  { label: 'Everyday lashes', category: 'Lashes', color: '#f3e1d6' },
  { label: 'Warm fragrance', category: 'Fragrance', color: '#efe1cb' },
]

const HomePage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts()
        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const shopCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`)
  }

  const latestProducts = products.slice(0, 4)
  const bestsellerProducts = products.slice(0).reverse().slice(0, 4)

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
              <span>Free shipping over $75</span>
              <span>Authentic beauty products</span>
              <span>Verified sellers</span>
              <span>Card and crypto checkout</span>
            </span>
          ))}
        </div>
      </section>

      <section className='glory-section glory-category-showcase'>
        <div className='glory-section-inner'>
          <div className='glory-home-heading'>
            <span className='glory-eyebrow'>Shop by category</span>
            <h2>Beauty departments that feel real.</h2>
            <p>Every category has its own visual mood, clear link, and enough context to help shoppers move with intention.</p>
          </div>

          <div className='glory-category-grid glory-category-grid-rich'>
            {categoryTiles.map((category, index) => (
              <button
                key={category.name}
                className={`glory-category-card glory-category-card-rich ${index < 2 ? 'glory-category-featured' : ''}`}
                onClick={() => shopCategory(category.name)}
                aria-label={`Shop ${category.name}`}
              >
                <img src={category.image} alt={`${category.name} beauty products`} loading='lazy' />
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
            </div>
            <button className='glory-text-link' onClick={() => navigate('/products')}>
              View all
              <FiArrowRight size={16} />
            </button>
          </div>

          <div className='glory-arrivals-layout'>
            <div className='glory-arrivals-feature'>
              <span className='glory-arrivals-label'>Fresh edit</span>
              <h3>Curated arrivals for the week.</h3>
              <p>Feature the newest beauty drops, seller launches and seasonal routines without leaving the homepage feeling empty.</p>
              <button onClick={() => navigate('/products')}>
                Explore the edit
                <FiArrowRight size={17} />
              </button>
            </div>

            {loading ? (
              <Loader />
            ) : latestProducts.length > 0 ? (
              <div className='glory-product-grid'>
                {latestProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className='glory-editorial-grid'>
                {editorialArrivals.map((item) => (
                  <button
                    className='glory-editorial-card'
                    key={item.name}
                    onClick={() => shopCategory(item.category)}
                  >
                    <span className='glory-editorial-media'>
                      <img src={item.image} alt={item.name} loading='lazy' />
                    </span>
                    <span className='glory-editorial-body'>
                      <span>{item.brand}</span>
                      <strong>{item.name}</strong>
                      <small>{item.category}</small>
                      <b>{item.price}</b>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className='glory-section glory-routine-section'>
        <div className='glory-section-inner glory-routine-layout'>
          <div className='glory-home-heading glory-routine-heading'>
            <span className='glory-eyebrow'>Routine builder</span>
            <h2>Build the whole beauty moment.</h2>
            <p>Stack the homepage like a real store: discovery, routine, bestsellers, selling, and trust all working together.</p>
            <button className='glory-outline-action' onClick={() => navigate('/products')}>
              Shop all products
              <FiArrowRight size={17} />
            </button>
          </div>
          <div className='glory-routine-grid'>
            {routineSteps.map((step) => (
              <button className='glory-routine-card' key={step.title} onClick={() => shopCategory(step.category)}>
                <img src={step.image} alt={step.title} loading='lazy' />
                <span>
                  <small>{step.category}</small>
                  <strong>{step.title}</strong>
                  <em>{step.copy}</em>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className='glory-section-tight'>
        <div className='glory-section-inner'>
          <div className='glory-concern-panel'>
            <div>
              <span className='glory-eyebrow'>Shop by need</span>
              <h2>Fast paths for shoppers who know what they want.</h2>
            </div>
            <div className='glory-concern-grid'>
              {concernTiles.map((item) => (
                <button
                  key={item.label}
                  style={{ background: item.color }}
                  onClick={() => shopCategory(item.category)}
                >
                  <FiSearch size={17} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='glory-sell-banner'>
        <div className='glory-sell-banner-inner'>
          <span className='glory-eyebrow'>For independent beauty brands</span>
          <h2>Stop selling in DMs.</h2>
          <p>
            Turn your Instagram beauty brand into a real store. Join sellers across Canada building their business on Glory.
          </p>
          <button onClick={() => navigate('/register')}>
            Start selling today
            <FiArrowRight size={17} />
          </button>
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

      <section className='glory-trust-strip'>
        {[
          { Icon: FiTruck, title: 'Fast shipping', sub: 'Across Canada' },
          { Icon: FiShield, title: 'Secure payments', sub: 'Paystack and crypto' },
          { Icon: FiCheckCircle, title: 'Authentic products', sub: 'Verified sellers only' },
          { Icon: FiRefreshCw, title: 'Easy returns', sub: '30-day return policy' },
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
