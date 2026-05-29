import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { getProducts } from '../api'

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

  const categories = [
    { name: 'Skincare', image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?w=400' },
    { name: 'Makeup', image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?w=400' },
    { name: 'Haircare', image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?w=400' },
    { name: 'Nails', image: 'https://images.pexels.com/photos/3622613/pexels-photo-3622613.jpeg?w=400' },
    { name: 'Lashes', image: 'https://images.pexels.com/photos/2253833/pexels-photo-2253833.jpeg?w=400' },
    { name: 'Fragrance', image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?w=400' },
  ]

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

    {/* HERO */}
<div style={{
  position: 'relative', width: '100%',
  height: '90vh', overflow: 'hidden',
  background: '#111'
}}>
  {/* 4K VIDEO BACKGROUND */}
  <video
  autoPlay
  muted
  loop
  playsInline
  style={{
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '100%', minHeight: '100%',
    width: 'auto', height: 'auto',
    objectFit: 'cover', opacity: 0.6,
    objectPosition: 'center top'
  }}
>
    <source src='https://res.cloudinary.com/dd8y3dijs/video/upload/v1780042517/5937414-uhd_2160_3840_24fps_i28m6z.mp4' type='video/mp4' />
  </video>

  {/* DARK OVERLAY */}
  <div style={{
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.35)'
  }} />

 {/* HERO CONTENT */}
<div style={{
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  textAlign: 'center', padding: '0 20px',
  paddingBottom: '80px'
}}>
    <div style={{
      fontSize: '12px', fontWeight: '700',
      color: 'rgba(255,255,255,0.7)',
      letterSpacing: '0.3em', marginBottom: '20px',
      textTransform: 'uppercase'
    }}>
      African Beauty Marketplace
    </div>
    <h1 style={{
      fontSize: '72px', fontWeight: '900',
      color: '#fff', lineHeight: '1',
      letterSpacing: '-2px', marginBottom: '20px',
      textTransform: 'uppercase'
    }}>
      GLOW.<br />SHINE.<br />GLORY.
    </h1>
    <p style={{
      fontSize: '16px', color: 'rgba(255,255,255,0.8)',
      maxWidth: '480px', lineHeight: '1.7',
      marginBottom: '36px', fontWeight: '400'
    }}>
      Discover authentic beauty products from the best Nigerian and international brands.
    </p>
    <div style={{ display: 'flex', gap: '14px' }}>
      <button
        onClick={() => navigate('/products')}
        style={{
          background: '#fff', color: '#111',
          border: 'none', padding: '16px 36px',
          fontSize: '13px', fontWeight: '800',
          cursor: 'pointer', letterSpacing: '0.08em',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
          fontFamily: "'Inter', sans-serif"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#111'
          e.currentTarget.style.color = '#fff'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#fff'
          e.currentTarget.style.color = '#111'
        }}
      >
        Shop Now
      </button>
      <button
        onClick={() => navigate('/seller')}
        style={{
          background: 'transparent', color: '#fff',
          border: '2px solid rgba(255,255,255,0.6)',
          padding: '16px 36px', fontSize: '13px',
          fontWeight: '800', cursor: 'pointer',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          transition: 'all 0.2s',
          fontFamily: "'Inter', sans-serif"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#fff'
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        Sell on Glory
      </button>
    </div>
  </div>

  {/* SCROLL INDICATOR */}
  <div style={{
    position: 'absolute', bottom: '30px',
    left: '50%', transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px',
    animation: 'bounce 2s ease-in-out infinite'
  }}>
    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em' }}>SCROLL</div>
    <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
  </div>
  <style>{`@keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }`}</style>
</div>

      {/* MARQUEE */}
      <div style={{
        background: '#111', padding: '14px 0',
        overflow: 'hidden', whiteSpace: 'nowrap'
      }}>
        <div style={{
          display: 'inline-flex', gap: '48px',
          animation: 'marquee 25s linear infinite'
        }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ display: 'inline-flex', gap: '48px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', fontWeight: '600' }}>FREE DELIVERY OVER ₦30,000</span>
              <span style={{ color: '#c97a9a', fontSize: '16px' }}>✦</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', fontWeight: '600' }}>100% AUTHENTIC PRODUCTS</span>
              <span style={{ color: '#c97a9a', fontSize: '16px' }}>✦</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', fontWeight: '600' }}>SELL YOUR BEAUTY BRAND ON GLORY</span>
              <span style={{ color: '#c97a9a', fontSize: '16px' }}>✦</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', fontWeight: '600' }}>PAY WITH CRYPTO OR PAYSTACK</span>
              <span style={{ color: '#c97a9a', fontSize: '16px' }}>✦</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }`}</style>
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: '80px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            fontSize: '11px', fontWeight: '700',
            color: '#999', letterSpacing: '0.2em',
            marginBottom: '12px'
          }}>
            SHOP BY CATEGORY
          </div>
          <h2 style={{
            fontSize: '40px', fontWeight: '900',
            color: '#111', letterSpacing: '-1px'
          }}>
            FIND YOUR GLOW
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px'
        }}>
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => navigate(`/products?category=${cat.name}`)}
              style={{
                position: 'relative', cursor: 'pointer',
                aspectRatio: '3/4', overflow: 'hidden',
                background: '#f5f5f5'
              }}
              onMouseEnter={e => {
                e.currentTarget.querySelector('img').style.transform = 'scale(1.05)'
                e.currentTarget.querySelector('.cat-label').style.background = '#111'
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelector('img').style.transform = 'scale(1)'
                e.currentTarget.querySelector('.cat-label').style.background = 'rgba(0,0,0,0.6)'
              }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  transition: 'transform 0.4s ease'
                }}
              />
              <div className='cat-label' style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.6)',
                padding: '16px', transition: 'background 0.3s'
              }}>
                <div style={{
                  fontSize: '13px', fontWeight: '800',
                  color: '#fff', letterSpacing: '0.1em'
                }}>
                  {cat.name.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW IN */}
      <div style={{ padding: '0 40px 80px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', marginBottom: '32px',
          borderBottom: '2px solid #111', paddingBottom: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '11px', fontWeight: '700',
              color: '#999', letterSpacing: '0.2em', marginBottom: '8px'
            }}>
              JUST DROPPED
            </div>
            <h2 style={{
              fontSize: '36px', fontWeight: '900',
              color: '#111', letterSpacing: '-1px'
            }}>
              NEW IN
            </h2>
          </div>
          <span
            onClick={() => navigate('/products')}
            style={{
              fontSize: '12px', fontWeight: '700',
              color: '#111', cursor: 'pointer',
              letterSpacing: '0.08em', textDecoration: 'underline'
            }}
          >
            VIEW ALL →
          </span>
        </div>

        {loading ? <Loader /> : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {products.slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* SELL BANNER */}
      <div style={{
        background: '#111', padding: '100px 40px',
        textAlign: 'center', position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(201,122,154,0.2), transparent 60%), radial-gradient(circle at 70% 50%, rgba(201,122,154,0.1), transparent 60%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '11px', fontWeight: '700',
            color: '#c97a9a', letterSpacing: '0.3em',
            marginBottom: '20px'
          }}>
            FOR AFRICAN BEAUTY BRANDS
          </div>
          <h2 style={{
            fontSize: '56px', fontWeight: '900',
            color: '#fff', lineHeight: '1',
            letterSpacing: '-2px', marginBottom: '20px',
            textTransform: 'uppercase'
          }}>
            STOP SELLING<br />IN DMS.
          </h2>
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.6)',
            maxWidth: '520px', margin: '0 auto 36px',
            lineHeight: '1.7'
          }}>
            Turn your Instagram beauty brand into a real store. Join thousands of African women selling on Glory.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: '#fff', color: '#111',
              border: 'none', padding: '18px 48px',
              fontSize: '13px', fontWeight: '800',
              cursor: 'pointer', letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#c97a9a'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.color = '#111'
            }}
          >
            Start Selling Today →
          </button>
        </div>
      </div>

      {/* BESTSELLERS */}
      <div style={{ padding: '80px 40px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', marginBottom: '32px',
          borderBottom: '2px solid #111', paddingBottom: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '11px', fontWeight: '700',
              color: '#999', letterSpacing: '0.2em', marginBottom: '8px'
            }}>
              MOST LOVED
            </div>
            <h2 style={{
              fontSize: '36px', fontWeight: '900',
              color: '#111', letterSpacing: '-1px'
            }}>
              BESTSELLERS
            </h2>
          </div>
          <span
            onClick={() => navigate('/products')}
            style={{
              fontSize: '12px', fontWeight: '700',
              color: '#111', cursor: 'pointer',
              letterSpacing: '0.08em', textDecoration: 'underline'
            }}
          >
            VIEW ALL →
          </span>
        </div>

        {loading ? <Loader /> : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {products.slice(0).reverse().slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* TRUST STRIP */}
      <div style={{
        borderTop: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '0 40px'
      }}>
        {[
          { icon: '🚚', title: 'FAST DELIVERY', sub: 'Across all 36 states' },
          { icon: '🔒', title: 'SECURE PAYMENTS', sub: 'Paystack + Crypto' },
          { icon: '✓', title: '100% AUTHENTIC', sub: 'Verified sellers only' },
          { icon: '↩️', title: 'EASY RETURNS', sub: '30-day return policy' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '28px 20px',
            borderRight: i < 3 ? '1px solid #f0f0f0' : 'none'
          }}>
            <span style={{ fontSize: '28px' }}>{item.icon}</span>
            <div>
              <div style={{
                fontSize: '12px', fontWeight: '800',
                color: '#111', letterSpacing: '0.06em',
                marginBottom: '4px'
              }}>
                {item.title}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {item.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}

export default HomePage