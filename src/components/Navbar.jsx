import { Link, useNavigate } from 'react-router'
import { useUser } from '../context/UserContext'
import { useState, useEffect, useRef } from 'react'
import { FiUser, FiHeart, FiX, FiChevronDown, FiMenu, FiMessageCircle, FiSearch } from 'react-icons/fi'
import { getProducts } from '../api'
import useIsMobile from '../hooks/useIsMobile'
import UnitedKingdomFlag from './UnitedKingdomFlag'
import { formatCurrency } from '../utils/currency'
import { getWishlistIds } from '../utils/wishlist'

const Navbar = () => {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const isMobile = useIsMobile(1024)

  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDrop, setActiveDrop] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(() => getWishlistIds().length)
  const searchRef = useRef(null)

  useEffect(() => {
    const updateWishlistCount = () => setWishlistCount(getWishlistIds().length)
    window.addEventListener('glory:wishlist-change', updateWishlistCount)
    return () => window.removeEventListener('glory:wishlist-change', updateWishlistCount)
  }, [])

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

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false)
      setMobileSearchOpen(false)
    }
  }, [isMobile])

  useEffect(() => {
    if (!isMobile) return
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen, isMobile])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = ['NEW IN', 'SKINCARE', 'HAIRCARE', 'MAKEUP', 'NAILS', 'LASHES', 'BODY CARE', 'FRAGRANCE', 'CANDLES', 'ABOUT', 'SELL ON GLORY']

  const navRoutes = {
    'NEW IN': '/products',
    SKINCARE: '/products?category=Skincare',
    HAIRCARE: '/products?category=Haircare',
    MAKEUP: '/products?category=Makeup',
    NAILS: '/products?category=Nails',
    LASHES: '/products?category=Lashes',
    'BODY CARE': '/products?category=Body%20Care',
    FRAGRANCE: '/products?category=Fragrance',
    CANDLES: '/products?category=Scented%20Candles',
    ABOUT: '/about',
    'SELL ON GLORY': '/sell-on-glory',
  }

  const getNavPath = (item) => navRoutes[item] || '/products'

  const megaMenus = {
    SKINCARE: {
      cols: [
        { title: 'BY CONCERN', links: ['Brightening', 'Acne Control', 'Anti-Ageing', 'Hydration', 'Dark Spots', 'Sensitive Skin'] },
        { title: 'PRODUCT TYPE', links: ['Serums', 'Moisturisers', 'Cleansers', 'Toners', 'Sunscreen', 'Eye Cream'] },
        { title: 'SHOP BY BRAND', links: ['Nuban Skin', 'Zaron', 'Dr. Sheth\'s', 'The Ordinary', 'CeraVe', 'Neutrogena'] }
      ],
      featured: { title: 'Glass Skin Edit', sub: 'Top rated serums for flawless skin', link: '/products?category=Skincare' }
    },
    HAIRCARE: {
      cols: [
        { title: 'HAIR TYPE', links: ['Natural Hair', 'Relaxed Hair', 'Loc Care', 'Scalp Treatment', '4C Hair', 'Low Porosity'] },
        { title: 'PRODUCTS', links: ['Shampoos', 'Conditioners', 'Hair Oils', 'Growth Serums', 'Leave-In', 'Heat Protectant'] },
        { title: 'CONCERNS', links: ['Hair Growth', 'Breakage', 'Dry Hair', 'Dandruff', 'Frizz Control', 'Shine'] }
      ],
      featured: { title: 'Natural Hair Edit', sub: 'Everything your curls need', link: '/products?category=Haircare' }
    },
    MAKEUP: {
      cols: [
        { title: 'FACE', links: ['Foundation', 'Concealer', 'Blush', 'Highlighter', 'Setting Powder', 'Primer'] },
        { title: 'EYES & LIPS', links: ['Lipstick', 'Lip Gloss', 'Mascara', 'Eyeshadow', 'Eyeliner', 'Brow Products'] },
        { title: 'TOOLS', links: ['Brushes', 'Sponges', 'Lashes', 'Nails', 'Nail Art', 'Accessories'] }
      ],
      featured: { title: 'New Arrivals', sub: 'Fresh makeup drops this week', link: '/products?category=Makeup' }
    }
  }

  const renderSearchResults = () => (
    <>
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
                setMobileSearchOpen(false)
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
                <div
                  className='glory-search-meta'
                  data-meta={`${product.brand} - ${product.category}`}
                  style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}
                >
                  {product.brand} · {product.category}
                </div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>
                {formatCurrency(product.price)}
              </div>
            </div>
          ))}
          <div
            className='glory-search-all'
            data-label={`SEE ALL RESULTS FOR "${searchQuery.toUpperCase()}" ->`}
            onClick={() => { navigate('/products'); setSearchQuery(''); setMobileSearchOpen(false) }}
            style={{
              padding: '12px 16px', fontSize: '12px',
              color: '#111', fontWeight: '700',
              cursor: 'pointer', background: '#f9f9f9',
              textAlign: 'center', letterSpacing: '0.05em',
              borderTop: '1px solid #e5e5e5'
            }}
          >
            SEE ALL RESULTS FOR "{searchQuery.toUpperCase()}" →
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* TOP BAR */}
      <div className='glory-announcement-bar' style={{
        background: '#111', color: 'rgba(255,255,255,0.8)',
        fontSize: isMobile ? '10px' : '11px',
        textAlign: 'center', padding: isMobile ? '7px 10px' : '9px',
        letterSpacing: '0.06em', fontFamily: "'Inter', sans-serif",
        fontWeight: '500', lineHeight: '1.6'
      }}>
        <b style={{ color: '#fff' }}>THE UK'S GLOBAL BEAUTY MARKETPLACE</b>
        {!isMobile && (
          <span>
            &nbsp;-&nbsp;<b style={{ color: '#fff' }}>CURATED DEPARTMENTS</b>
            &nbsp;-&nbsp;<b style={{ color: '#fff' }}>SELL ON GLORY</b> - Apply to open your store
          </span>
        )}
        {false && !isMobile && (
          <>
            &nbsp;·&nbsp;<b style={{ color: '#fff' }}>100% AUTHENTIC</b> products only
            &nbsp;·&nbsp;<b style={{ color: '#fff' }}>SELL ON GLORY</b> — Start your store today
          </>
        )}
      </div>

      {/* MAIN NAV */}
      <nav className='glory-navbar' style={{
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        position: 'sticky', top: 0, zIndex: 1000,
      }}>
        {/* TOP ROW */}
        <div className='glory-navbar-main-row' style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 40px',
          height: isMobile ? '58px' : '70px',
          gap: isMobile ? '12px' : '24px'
        }}>
          {isMobile && (
            <button
              className='glory-navbar-icon-button'
              onClick={() => setDrawerOpen(true)}
              aria-label='Open navigation menu'
              aria-expanded={drawerOpen}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', padding: 0, flexShrink: 0
              }}
            >
              <FiMenu size={22} color='#111' />
            </button>
          )}

          {/* LOGO */}
          <Link className='glory-navbar-logo' to='/' style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: '900', fontSize: isMobile ? '18px' : '24px',
            color: '#111', textDecoration: 'none',
            letterSpacing: '-0.5px', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px'
          }}>
            GLORY.
            {!isMobile && (
              <div className='glory-currency-badge' style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#f5f5f5', borderRadius: '999px',
                padding: '4px 10px 4px 6px'
              }}>
                <UnitedKingdomFlag size={22} />
                <span style={{
                  fontSize: '10px', fontWeight: '700',
                  color: '#555', letterSpacing: '0.04em',
                  fontFamily: "'Inter', sans-serif"
                }}>UK</span>
              </div>
            )}
          </Link>

          {/* DESKTOP SEARCH BAR */}
          {!isMobile && (
            <div className='glory-navbar-search' style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#f5f5f5', borderRadius: '999px',
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
              {renderSearchResults()}
            </div>
          )}

          {/* RIGHT ICONS */}
          <div className='glory-navbar-actions' style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '20px', flexShrink: 0 }}>
            {isMobile && (
              <button
                className='glory-navbar-icon-button'
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
                aria-expanded={mobileSearchOpen}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '44px', height: '44px'
                }}
              >
                <FiSearch size={20} color='#111' />
              </button>
            )}

            {user ? (
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => !isMobile && setMenuOpen(true)}
                onMouseLeave={() => !isMobile && setMenuOpen(false)}
                onClick={() => isMobile && setMenuOpen(!menuOpen)}
              >
                <div
                  className='glory-navbar-action'
                  role='button'
                  tabIndex={0}
                  aria-label='Open account menu'
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '44px', minHeight: '44px', gap: '6px', cursor: 'pointer'
                  }}
                >
                  <FiUser size={20} style={{ color: '#111' }} />
                  {!isMobile && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#111' }}>
                      {user.name.split(' ')[0]}
                    </span>
                  )}
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
                      { label: 'Messages', path: '/messages' },
                      ...(user.isSeller ? [{ label: 'Seller Dashboard', path: '/seller' }] : []),
                      ...(user.isAdmin ? [{ label: 'Admin Dashboard', path: '/admin' }] : []),
                    ].map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)} style={{
                        display: 'block', padding: '12px 16px',
                        fontSize: '13px', fontWeight: '500',
                        color: '#111', textDecoration: 'none',
                        borderBottom: '1px solid #f5f5f5',
                        transition: 'background 0.15s'
                      }}>
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
                    >
                      Sign Out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className='glory-navbar-action'
                onClick={() => navigate('/login')}
                role='button'
                tabIndex={0}
                aria-label='Sign in'
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '44px', minHeight: '44px', gap: '6px', cursor: 'pointer'
                }}
              >
                <FiUser size={20} style={{ color: '#111' }} />
                {!isMobile && <span style={{ fontSize: '12px', fontWeight: '600', color: '#111' }}>Sign In</span>}
              </div>
            )}

            {!isMobile && (
              <div
                className='glory-navbar-action'
                style={{
                  position: 'relative', cursor: 'pointer', minWidth: '44px', minHeight: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onClick={() => navigate('/wishlist')}
                role='button'
                tabIndex={0}
                aria-label={`Open saved products with ${wishlistCount} items`}
              >
                <FiHeart size={20} style={{ color: '#111' }} />
                {wishlistCount > 0 && <span className='glory-nav-count'>{wishlistCount}</span>}
              </div>
            )}

            {user && (
              <button
                type='button'
                className='glory-navbar-action glory-navbar-icon-button'
                onClick={() => navigate('/messages')}
                aria-label='Open Glory messages'
                style={{
                  background: 'none', border: 'none', position: 'relative', cursor: 'pointer',
                  minWidth: '44px', minHeight: '44px', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <FiMessageCircle size={20} style={{ color: '#111' }} />
              </button>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH ROW */}
        {isMobile && mobileSearchOpen && (
          <div className='glory-navbar-mobile-search' style={{ padding: '0 16px 14px', position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#f5f5f5', borderRadius: '999px',
              padding: '0 14px', height: '42px'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: '14px',
                  color: '#111', marginLeft: '10px',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                  <FiX size={15} />
                </button>
              )}
            </div>
            {renderSearchResults()}
          </div>
        )}

        {/* DESKTOP BOTTOM NAV ROW */}
        {!isMobile && (
          <div className='glory-navbar-desktop-links' style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            padding: '0 40px',
            borderTop: '1px solid #f0f0f0',
            height: '44px', gap: '0'
          }}>
            {navItems.map(item => (
              <div
                key={item}
                style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                onMouseEnter={() => setActiveDrop(item)}
                onMouseLeave={() => setActiveDrop(null)}
              >
                <Link
                  to={getNavPath(item)}
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
                            to={getNavPath(item)}
                            style={{
                              display: 'block', fontSize: '14px',
                              fontWeight: '500', color: '#333',
                              textDecoration: 'none', padding: '6px 0',
                              fontFamily: "'Inter', sans-serif"
                            }}
                          >
                            {link}
                          </Link>
                        ))}
                      </div>
                    ))}

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
                          className='glory-mega-shop'
                          data-label='SHOP NOW ->'
                          to={megaMenus[item].featured.link}
                        style={{
                          display: 'inline-block', marginTop: '20px',
                          background: '#111', color: '#fff',
                          padding: '12px 20px', fontSize: '11px',
                          fontWeight: '700', textDecoration: 'none',
                          letterSpacing: '0.06em'
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
        )}
      </nav>

      {/* MOBILE DRAWER */}
      {isMobile && drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(17,17,17,0.52)', zIndex: 1998
            }}
          />
          <div className='glory-mobile-drawer' style={{
            position: 'fixed', top: 0, left: 0, height: '100dvh',
            width: '86%', maxWidth: '360px', background: '#fff',
            zIndex: 1999, overflowY: 'auto',
            boxShadow: '2px 0 24px rgba(0,0,0,0.15)',
            animation: 'slideInLeft 0.25s ease'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '18px 20px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <span style={{ fontWeight: '900', fontSize: '19px', letterSpacing: '-0.5px' }}>GLORY.</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label='Close navigation menu'
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '44px', height: '44px'
                }}
              >
                <FiX size={22} color='#111' />
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {user && (
                <Link
                  to='/messages'
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
                    fontSize: '14px', fontWeight: '700', color: '#111', textDecoration: 'none',
                    borderBottom: '1px solid #f5f5f5'
                  }}
                >
                  <FiMessageCircle size={17} /> MESSAGES
                </Link>
              )}
              <Link
                to='/wishlist'
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
                  fontSize: '14px', fontWeight: '700', color: '#111', textDecoration: 'none',
                  borderBottom: '1px solid #f5f5f5'
                }}
              >
                <FiHeart size={17} /> SAVED {wishlistCount > 0 ? `(${wishlistCount})` : ''}
              </Link>
              {navItems.map(item => (
                <Link
                  key={item}
                  to={getNavPath(item)}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    display: 'block', padding: '14px 20px',
                    fontSize: '14px', fontWeight: '700',
                    color: item === 'SELL ON GLORY' ? '#c97a9a' : '#111',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f5f5f5',
                    letterSpacing: '0.02em'
                  }}
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className='glory-drawer-location' style={{
              padding: '16px 20px', display: 'flex',
              alignItems: 'center', gap: '8px',
              borderTop: '1px solid #f0f0f0', marginTop: '8px'
            }}>
              <UnitedKingdomFlag size={24} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>UK marketplace · Prices in GBP · Worldwide delivery</span>
            </div>
          </div>
          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </>
  )
}

export default Navbar
