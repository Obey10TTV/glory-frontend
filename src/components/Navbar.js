import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useCart } from '../context/CartContext'
import { useState, useEffect, useRef } from 'react'
import { FiUser, FiShoppingBag, FiHeart, FiX, FiChevronDown } from 'react-icons/fi'
import { getProducts } from '../api'

const Navbar = () => {
  const { user, logout } = useUser()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDrop, setActiveDrop] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const searchRef = useRef(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts()
        setAllProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.log(err)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      return
    }
    const results = allProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSearchResults(results.slice(0, 6))
  }, [searchQuery, allProducts])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const megaMenus = {
    SKINCARE: {
      cols: [
        {
          title: 'BY CONCERN',
          links: ['Brightening', 'Acne Control', 'Anti-Ageing', 'Hydration', 'Dark Spots', 'Sensitive Skin']
        },
        {
          title: 'PRODUCT TYPE',
          links: ['Serums', 'Moisturisers', 'Cleansers', 'Toners', 'Sunscreen', 'Eye Cream']
        },
        {
          title: 'SHOP BY BRAND',
          links: ['Nuban Skin', 'Zaron', 'Dr. Sheth\'s', 'The Ordinary', 'CeraVe', 'Neutrogena']
        }
      ],
      featured: { title: 'Glass Skin Edit', sub: 'Top rated serums for flawless skin', link: '/products?category=Skincare' }
    },
    HAIRCARE: {
      cols: [
        {
          title: 'HAIR TYPE',
          links: ['Natural Hair', 'Relaxed Hair', 'Loc Care', 'Scalp Treatment', '4C Hair', 'Low Porosity']
        },
        {
          title: 'PRODUCTS',
          links: ['Shampoos', 'Conditioners', 'Hair Oils', 'Growth Serums', 'Leave-In', 'Heat Protectant']
        },
        {
          title: 'CONCERNS',
          links: ['Hair Growth', 'Breakage', 'Dry Hair', 'Dandruff', 'Frizz Control', 'Shine']
        }
      ],
      featured: { title: 'Natural Hair Edit', sub: 'Everything your curls need', link: '/products?category=Haircare' }
    },
    MAKEUP: {
      cols: [
        {
          title: 'FACE',
          links: ['Foundation', 'Concealer', 'Blush', 'Highlighter', 'Setting Powder', 'Primer']
        },
        {
          title: 'EYES & LIPS',
          links: ['Lipstick', 'Lip Gloss', 'Mascara', 'Eyeshadow', 'Eyeliner', 'Brow Products']
        },
        {
          title: 'TOOLS',
          links: ['Brushes', 'Sponges', 'Lashes', 'Nails', 'Nail Art', 'Accessories']
        }
      ],
      featured: { title: 'New Arrivals', sub: 'Fresh makeup drops this week', link: '/products?category=Makeup' }
    }
  }

  return (
    <>
      {/* TOP BAR */}
      <div style={{
        background: '#111', color: 'rgba(255,255,255,0.8)',
        fontSize: '11px', textAlign: 'center', padding: '9px',
        letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif",
        fontWeight: '500'
      }}>
        <b style={{ color: '#fff' }}>FREE DELIVERY</b> on orders over ₦30,000 &nbsp;·&nbsp;
        <b style={{ color: '#fff' }}>100% AUTHENTIC</b> products only &nbsp;·&nbsp;
        <b style={{ color: '#fff' }}>SELL ON GLORY</b> — Start your store today
      </div>

      {/* MAIN NAV */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        position: 'sticky', top: 0, zIndex: 1000,
      }}>
        {/* TOP ROW */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px', height: '70px',
          gap: '24px'
        }}>
          {/* LOGO */}
          <Link to='/' style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: '900', fontSize: '24px',
            color: '#111', textDecoration: 'none',
            letterSpacing: '-0.5px', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            GLORY.
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#f5f5f5', borderRadius: '999px',
              padding: '3px 10px'
            }}>
              <span style={{ fontSize: '13px' }}>🇳🇬</span>
              <span style={{
                fontSize: '10px', fontWeight: '600',
                color: '#555', letterSpacing: '0.04em',
                fontFamily: "'Inter', sans-serif"
              }}>NGN</span>
            </div>
          </Link>

          {/* SEARCH BAR */}
          <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#f5f5f5', borderRadius: '4px',
              padding: '0 16px', height: '44px',
              border: '1px solid transparent',
              transition: 'border-color 0.2s'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: '14px',
                  color: '#111', marginLeft: '10px',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#888',
                  display: 'flex', alignItems: 'center'
                }}>
                  <FiX size={16} />
                </button>
              )}
            </div>

            {/* SEARCH RESULTS */}
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#fff', border: '1px solid #e5e5e5',
                borderTop: 'none', zIndex: 999,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }}>
                {searchResults.map((product, i) => (
                  <div
                    key={product._id}
                    onClick={() => {
                      navigate(`/products/${product._id}`)
                      setSearchQuery('')
                    }}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: '14px', padding: '12px 16px',
                      cursor: 'pointer', borderBottom: i < searchResults.length - 1 ? '1px solid #f5f5f5' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '44px', height: '44px',
                        objectFit: 'cover', borderRadius: '4px',
                        background: '#f5f5f5', flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                        {product.brand} · {product.category}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>
                      ₦{product.price.toLocaleString()}
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => { navigate('/products'); setSearchQuery('') }}
                  style={{
                    padding: '12px 16px', fontSize: '12px',
                    color: '#111', fontWeight: '700',
                    cursor: 'pointer', background: '#f9f9f9',
                    textAlign: 'center', letterSpacing: '0.05em',
                    borderTop: '1px solid #e5e5e5'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f9f9f9'}
                >
                  SEE ALL RESULTS FOR "{searchQuery.toUpperCase()}" →
                </div>
              </div>
            )}
            

            
          </div>

          {/* RIGHT ICONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            {user ? (
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <FiUser size={20} style={{ color: '#111' }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#111' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%',
                    background: '#fff', border: '1px solid #e5e5e5',
                    minWidth: '200px', zIndex: 999,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      padding: '16px', borderBottom: '1px solid #f0f0f0',
                      fontSize: '13px', color: '#888'
                    }}>
                      Signed in as <b style={{ color: '#111' }}>{user.name}</b>
                    </div>
                    {[
                      { label: 'My Account', path: '/account' },
                      ...(user.isSeller ? [{ label: 'Seller Dashboard', path: '/seller' }] : []),
                      ...(user.isAdmin ? [{ label: 'Admin Dashboard', path: '/admin' }] : []),
                    ].map(item => (
                      <Link key={item.path} to={item.path} style={{
                        display: 'block', padding: '12px 16px',
                        fontSize: '13px', fontWeight: '500',
                        color: '#111', textDecoration: 'none',
                        borderBottom: '1px solid #f5f5f5',
                        transition: 'background 0.15s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div
                      onClick={handleLogout}
                      style={{
                        display: 'block', padding: '12px 16px',
                        fontSize: '13px', fontWeight: '500',
                        color: '#e74c3c', cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      Sign Out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/login')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <FiUser size={20} style={{ color: '#111' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#111' }}>Sign In</span>
              </div>
            )}

            <div style={{ cursor: 'pointer' }}>
              <FiHeart size={20} style={{ color: '#111' }} />
            </div>

            <div
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => navigate('/cart')}
            >
              <FiShoppingBag size={20} style={{ color: '#111' }} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: '#111', color: '#fff',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '10px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700'
                }}>
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM NAV ROW */}
                  <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 40px',
                  borderTop: '1px solid #f0f0f0',
                  height: '44px', gap: '0'
            }}>
          {['NEW IN', 'SKINCARE', 'HAIRCARE', 'MAKEUP', 'NAILS', 'LASHES', 'BODY CARE', 'FRAGRANCE', 'CANDLES', 'ABOUT', 'SELL ON GLORY'].map(item => (
            <div
              key={item}
              style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setActiveDrop(item)}
              onMouseLeave={() => setActiveDrop(null)}
            >
              <Link
                to={
                  item === 'NEW IN' ? '/products' :
                  item === 'ABOUT' ? '/about' :
                  item === 'SELL ON GLORY' ? '/seller' :
                  `/products?category=${item.replace(' CARE', ' Care')}`
                }
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  height: '100%', padding: '0 14px',
                  fontSize: '11.5px', fontWeight: '700',
                  color: item === 'SELL ON GLORY' ? '#c97a9a' : '#111',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  letterSpacing: '0.04em',
                  borderBottom: activeDrop === item ? '2px solid #111' : '2px solid transparent',
                  transition: 'border-color 0.15s',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {item}
                {megaMenus[item] && <FiChevronDown size={12} />}
              </Link>

              {/* MEGA MENU */}
              {megaMenus[item] && activeDrop === item && (
                <div style={{
                  position: 'fixed', left: 0, right: 0,
                  top: '114px',
                  background: '#fff',
                  borderTop: '2px solid #111',
                  borderBottom: '1px solid #e5e5e5',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  zIndex: 998, padding: '40px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 280px',
                  gap: '40px'
                }}>
                  {megaMenus[item].cols.map((col, i) => (
                    <div key={i}>
                      <div style={{
                        fontSize: '11px', fontWeight: '800',
                        color: '#111', letterSpacing: '0.12em',
                        marginBottom: '16px', borderBottom: '1px solid #f0f0f0',
                        paddingBottom: '8px'
                      }}>
                        {col.title}
                      </div>
                      {col.links.map(link => (
                        <Link
                          key={link}
                          to={`/products?category=${item}`}
                          style={{
                            display: 'block', fontSize: '14px',
                            fontWeight: '500', color: '#333',
                            textDecoration: 'none', padding: '6px 0',
                            transition: 'color 0.15s, padding-left 0.15s',
                            fontFamily: "'Inter', sans-serif"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#111'
                            e.currentTarget.style.paddingLeft = '6px'
                            e.currentTarget.style.fontWeight = '700'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = '#333'
                            e.currentTarget.style.paddingLeft = '0'
                            e.currentTarget.style.fontWeight = '500'
                          }}
                        >
                          {link}
                        </Link>
                      ))}
                    </div>
                  ))}

                  {/* FEATURED */}
                  <div style={{
                    background: '#fafaf9',
                    borderRadius: '8px', padding: '24px',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '10px', fontWeight: '700',
                        color: '#c97a9a', letterSpacing: '0.15em',
                        marginBottom: '8px'
                      }}>
                        FEATURED
                      </div>
                      <div style={{
                        fontSize: '20px', fontWeight: '800',
                        color: '#111', lineHeight: '1.2',
                        marginBottom: '8px'
                      }}>
                        {megaMenus[item].featured.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                        {megaMenus[item].featured.sub}
                      </div>
                    </div>
                    <Link
                      to={megaMenus[item].featured.link}
                      style={{
                        display: 'inline-block', marginTop: '20px',
                        background: '#111', color: '#fff',
                        padding: '12px 20px', fontSize: '11px',
                        fontWeight: '700', textDecoration: 'none',
                        letterSpacing: '0.06em',
                        transition: 'background 0.2s'
                      }}
                    >
                      SHOP NOW →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Navbar