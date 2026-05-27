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
    { name: 'SKINCARE', image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?w=150' },
    { name: 'MAKEUP', image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?w=150' },
    { name: 'HAIR', image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?w=150' },
    { name: 'NAILS', image: 'https://images.pexels.com/photos/3622613/pexels-photo-3622613.jpeg?w=150' },
    { name: 'BODY', image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?w=150' },
    { name: 'LASHES', image: 'https://images.pexels.com/photos/2253833/pexels-photo-2253833.jpeg?w=150' },
    { name: 'FRAGRANCE', image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?w=150' },
    { name: 'SALE', sale: true },
  ]

  return (
    <div style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      {/* HERO */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        height: '480px'
      }}>
        {/* LEFT HERO */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#f0e8e4'
        }}>
          <img
            src='https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=800'
            alt='hero'
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
          <div style={{
            position: 'absolute', bottom: '36px', left: '36px'
          }}>
            <h1 style={{
              fontFamily: 'serif', fontSize: '38px',
              fontWeight: '800', color: '#fff',
              lineHeight: '1.1', marginBottom: '10px',
              textShadow: '0 2px 12px rgba(0,0,0,0.2)'
            }}>
              GLASS SKIN<br />SEASON
            </h1>
            <p style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.9)',
              marginBottom: '18px'
            }}>
              Top skincare picks for a flawless glow
            </p>
            <button
              onClick={() => navigate('/products?category=Skincare')}
              style={{
                background: '#111', color: '#fff',
                border: 'none', padding: '12px 24px',
                fontSize: '11px', fontWeight: '700',
                cursor: 'pointer', letterSpacing: '0.06em'
              }}
            >
              SHOP SKINCARE
            </button>
          </div>
        </div>

        {/* RIGHT HERO */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            flex: 1, position: 'relative',
            overflow: 'hidden', background: '#e8ddd8',
            borderBottom: '2px solid #fff', borderLeft: '2px solid #fff'
          }}>
            <img
              src='https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400'
              alt='hair'
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)' }}>
              <h3 style={{ fontFamily: 'serif', fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '6px' }}>HAIR THAT<br />MOVES</h3>
              <button onClick={() => navigate('/products?category=Haircare')} style={smallBtnStyle}>SHOP HAIR</button>
            </div>
          </div>
          <div style={{
            flex: 1, position: 'relative',
            overflow: 'hidden', background: '#e0dce8',
            borderLeft: '2px solid #fff'
          }}>
            <img
              src='https://images.pexels.com/photos/3622613/pexels-photo-3622613.jpeg?auto=compress&cs=tinysrgb&w=400'
              alt='nails'
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)' }}>
              <h3 style={{ fontFamily: 'serif', fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '6px' }}>NAILS THAT<br />SPEAK</h3>
              <button onClick={() => navigate('/products?category=Nails')} style={smallBtnStyle}>SHOP NAILS</button>
            </div>
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div style={{
        background: '#111', padding: '11px 0',
        overflow: 'hidden', whiteSpace: 'nowrap'
      }}>
        <div style={{
          display: 'inline-flex', gap: '36px',
          animation: 'marquee 20s linear infinite'
        }}>
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: 'inline-flex', gap: '36px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}><b style={{ color: 'rgba(255,255,255,0.85)' }}>FREE DELIVERY</b> on orders over ₦30,000</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}><b style={{ color: 'rgba(255,255,255,0.85)' }}>100% AUTHENTIC</b> products only</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}><b style={{ color: 'rgba(255,255,255,0.85)' }}>SELL YOUR BRAND</b> on Glory today</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}><b style={{ color: 'rgba(255,255,255,0.85)' }}>PAY ON DELIVERY</b> available in Lagos</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: '40px 40px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px'
        }}>
          <h2 style={{ fontFamily: 'serif', fontSize: '20px', fontWeight: '700', color: '#111' }}>Shop by category</h2>
        </div>
        <div style={{
          display: 'flex', gap: '20px',
          justifyContent: 'space-between'
        }}>
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => navigate(`/products?category=${cat.name}`)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: '72px', height: '72px',
                borderRadius: '50%', overflow: 'hidden',
                background: cat.sale ? '#111' : '#fdf0f5',
                border: '0.5px solid #eee',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {cat.sale ? (
                  <span style={{ fontFamily: 'serif', fontWeight: '800', fontSize: '13px', color: '#fff' }}>SALE</span>
                ) : (
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <span style={{ fontSize: '9.5px', fontWeight: '600', color: '#111', letterSpacing: '0.07em' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NEW IN */}
      <div style={{ padding: '40px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px'
        }}>
          <h2 style={{ fontFamily: 'serif', fontSize: '20px', fontWeight: '800', color: '#111' }}>NEW IN</h2>
          <span
            onClick={() => navigate('/products')}
            style={{ fontSize: '11px', color: '#888', cursor: 'pointer', fontWeight: '500' }}
          >VIEW ALL</span>
        </div>

        {loading ? <Loader /> : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px'
          }}>
            {products.slice(0, 5).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* BESTSELLERS */}
      <div style={{ padding: '0 40px 40px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px'
        }}>
          <h2 style={{ fontFamily: 'serif', fontSize: '20px', fontWeight: '800', color: '#111' }}>BESTSELLERS</h2>
          <span
            onClick={() => navigate('/products')}
            style={{ fontSize: '11px', color: '#888', cursor: 'pointer', fontWeight: '500' }}
          >VIEW ALL</span>
        </div>

        {loading ? <Loader /> : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px'
          }}>
            {products.slice(0, 5).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* SELL BANNER */}
      <div style={{
        margin: '0 40px 40px',
        background: '#111', borderRadius: '16px',
        padding: '36px 44px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: '600' }}>FOR NIGERIAN BEAUTY BRANDS</p>
          <h3 style={{ fontFamily: 'serif', fontSize: '24px', fontWeight: '800', color: '#fff', lineHeight: '1.2' }}>
            Sell beauty. Earn more.<br />
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>Join thousands of sellers on Glory.</span>
          </h3>
        </div>
        <button
          onClick={() => navigate('/seller')}
          style={{
            background: '#fff', color: '#111',
            border: 'none', borderRadius: '999px',
            padding: '14px 28px', fontSize: '12px',
            fontWeight: '700', cursor: 'pointer',
            position: 'relative', zIndex: 1
          }}
        >
          JOIN AS SELLER
        </button>
      </div>

      {/* TRUST */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '24px 40px',
        borderTop: '0.5px solid #eee'
      }}>
        {[
          { icon: '🚚', title: 'FAST DELIVERY', sub: 'Across Nigeria' },
          { icon: '🔒', title: 'SECURE PAYMENTS', sub: '100% safe & secure' },
          { icon: '↩️', title: 'EASY RETURNS', sub: 'Hassle-free returns' },
          { icon: '📞', title: 'SUPPORT', sub: "We're here to help" },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '0 16px',
            borderRight: i < 3 ? '0.5px solid #eee' : 'none'
          }}>
            <span style={{ fontSize: '24px' }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>{item.title}</div>
              <div style={{ fontSize: '10px', color: '#888' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}

const smallBtnStyle = {
  background: '#fff', color: '#111',
  border: 'none', padding: '8px 14px',
  fontSize: '9px', fontWeight: '700',
  cursor: 'pointer', letterSpacing: '0.05em'
}

export default HomePage