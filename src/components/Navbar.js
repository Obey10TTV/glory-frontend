import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useCart } from '../context/CartContext'
import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiUser, FiShoppingBag, FiX } from 'react-icons/fi'
import { getProducts } from '../api'

const Navbar = () => {
  const { user, logout } = useUser()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [skincareDrop, setSkincareDrop] = useState(false)
  const [haircareDrop, setHaircareDrop] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const searchRef = useRef(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts()
        setAllProducts(data)
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
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearchClose = () => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleProductClick = (id) => {
    handleSearchClose()
    navigate(`/products/${id}`)
  }

  return (
    <>
      {/* TOP BAR */}
      <div style={{
        background: '#111', color: 'rgba(255,255,255,0.7)',
        fontSize: '11px', textAlign: 'center', padding: '8px',
        letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif"
      }}>
        <b style={{ color: '#fff' }}>FREE DELIVERY</b> on orders over ₦30,000 &nbsp;·&nbsp;
        <b style={{ color: '#fff' }}>100% AUTHENTIC</b> products only
      </div>

      {/* MAIN NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px', height: '64px',
        background: '#fff',
        borderBottom: '0.5px solid #eee',
        position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
      }}>

        {/* SEARCH OVERLAY */}
        {searchOpen && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '64px', background: '#fff', zIndex: 10,
            display: 'flex', alignItems: 'center',
            padding: '0 40px', gap: '16px',
            borderBottom: '0.5px solid #eee'
          }}>
            <FiSearch size={18} style={{ color: '#aaa', flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search for products, brands, categories...'
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: '15px', color: '#111',
                fontFamily: "'DM Sans', sans-serif",
                background: 'transparent'
              }}
            />
            <button
              onClick={handleSearchClose}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#888',
                display: 'flex', alignItems: 'center'
              }}
            >
              <FiX size={20} />
            </button>

            {/* SEARCH RESULTS DROPDOWN */}
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: '40px', right: '40px',
                background: '#fff', border: '0.5px solid #eee',
                borderRadius: '0 0 16px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                zIndex: 999, overflow: 'hidden'
              }}>
                {searchResults.map((product, i) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: '14px', padding: '12px 20px',
                      cursor: 'pointer',
                      borderBottom: i < searchResults.length - 1 ? '0.5px solid #f5f5f5' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafaf9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '40px', height: '40px',
                        borderRadius: '8px', objectFit: 'cover',
                        background: '#fdf0f5', flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '13px', fontWeight: '600', color: '#111'
                      }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                        {product.brand} · {product.category}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '13px', fontWeight: '700', color: '#111'
                    }}>
                      ₦{product.price.toLocaleString()}
                    </div>
                  </div>
                ))}
                {searchQuery && (
                  <div
                    onClick={() => {
                      handleSearchClose()
                      navigate('/products')
                    }}
                    style={{
                      padding: '12px 20px', fontSize: '12px',
                      color: '#c97a9a', fontWeight: '600',
                      cursor: 'pointer', textAlign: 'center',
                      background: '#fdf6f8'
                    }}
                  >
                    View all results for "{searchQuery}" →
                  </div>
                )}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: '40px', right: '40px',
                background: '#fff', border: '0.5px solid #eee',
                borderRadius: '0 0 16px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                padding: '24px', textAlign: 'center',
                color: '#888', fontSize: '13px'
              }}>
                No products found for "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* LOGO + FLAG */}
        <Link to='/' style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: '700', fontSize: '24px', color: '#111',
          textDecoration: 'none', letterSpacing: '0.12em',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          GLORY.
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#f5f5f5', borderRadius: '999px',
            padding: '4px 10px'
          }}>
            <span style={{ fontSize: '14px' }}>🇳🇬</span>
            <span style={{
              fontSize: '10px', fontWeight: '600',
              color: '#555', letterSpacing: '0.04em',
              fontFamily: "'DM Sans', sans-serif"
            }}>NGN</span>
            <span style={{ fontSize: '10px', color: '#aaa' }}>▾</span>
          </div>
        </Link>

        {/* NAV LINKS */}
        <div style={{ display: 'flex', height: '100%', gap: '0' }}>
          <Link to='/products' style={navLinkStyle}>NEW IN</Link>

          {/* SKINCARE DROPDOWN */}
          <div
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setSkincareDrop(true)}
            onMouseLeave={() => setSkincareDrop(false)}
          >
            <div style={navLinkStyle}>SKINCARE</div>
            {skincareDrop && (
              <div style={dropdownStyle}>
                <div style={dropColStyle}>
                  <div style={dropHeadStyle}>BY CONCERN</div>
                  <Link to='/products?category=Skincare' style={dropLinkStyle}>Brightening</Link>
                  <Link to='/products?category=Skincare' style={dropLinkStyle}>Acne Control</Link>
                  <Link to='/products?category=Skincare' style={dropLinkStyle}>Anti-Ageing</Link>
                  <Link to='/products?category=Skincare' style={dropLinkStyle}>Hydration</Link>
                </div>
                <div style={dropColStyle}>
                  <div style={dropHeadStyle}>PRODUCT TYPE</div>
                  <Link to='/products?category=Skincare' style={dropLinkStyle}>Serums</Link>
                  <Link to='/products?category=Skincare' style={dropLinkStyle}>Moisturisers</Link>
                  <Link to='/products?category=Skincare' style={dropLinkStyle}>Cleansers</Link>
                  <Link to='/products?category=Skincare' style={dropLinkStyle}>Sunscreen</Link>
                </div>
                <div style={{
                  background: '#fdf6f8', borderRadius: '10px',
                  padding: '16px', minWidth: '130px'
                }}>
                  <div style={{
                    fontSize: '9px', color: '#c97a9a',
                    letterSpacing: '0.1em', marginBottom: '5px', fontWeight: '600'
                  }}>FEATURED</div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '14px', fontWeight: '700', color: '#111',
                    marginBottom: '10px', lineHeight: '1.3'
                  }}>Glass Skin Essentials</div>
                  <Link to='/products?category=Skincare' style={{
                    fontSize: '10px', color: '#111',
                    fontWeight: '600', textDecoration: 'underline'
                  }}>Shop now →</Link>
                </div>
              </div>
            )}
          </div>

          {/* HAIRCARE DROPDOWN */}
          <div
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setHaircareDrop(true)}
            onMouseLeave={() => setHaircareDrop(false)}
          >
            <div style={navLinkStyle}>HAIRCARE</div>
            {haircareDrop && (
              <div style={dropdownStyle}>
                <div style={dropColStyle}>
                  <div style={dropHeadStyle}>HAIR TYPE</div>
                  <Link to='/products?category=Haircare' style={dropLinkStyle}>Natural Hair</Link>
                  <Link to='/products?category=Haircare' style={dropLinkStyle}>Relaxed Hair</Link>
                  <Link to='/products?category=Haircare' style={dropLinkStyle}>Loc Care</Link>
                  <Link to='/products?category=Haircare' style={dropLinkStyle}>Scalp Treatment</Link>
                </div>
                <div style={dropColStyle}>
                  <div style={dropHeadStyle}>PRODUCTS</div>
                  <Link to='/products?category=Haircare' style={dropLinkStyle}>Shampoos</Link>
                  <Link to='/products?category=Haircare' style={dropLinkStyle}>Conditioners</Link>
                  <Link to='/products?category=Haircare' style={dropLinkStyle}>Hair Oils</Link>
                  <Link to='/products?category=Haircare' style={dropLinkStyle}>Growth Serums</Link>
                </div>
                <div style={{
                  background: '#fdf6f8', borderRadius: '10px',
                  padding: '16px', minWidth: '130px'
                }}>
                  <div style={{
                    fontSize: '9px', color: '#c97a9a',
                    letterSpacing: '0.1em', marginBottom: '5px', fontWeight: '600'
                  }}>FEATURED</div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '14px', fontWeight: '700', color: '#111',
                    marginBottom: '10px', lineHeight: '1.3'
                  }}>Natural Hair Essentials</div>
                  <Link to='/products?category=Haircare' style={{
                    fontSize: '10px', color: '#111',
                    fontWeight: '600', textDecoration: 'underline'
                  }}>Shop now →</Link>
                </div>
              </div>
            )}
          </div>

          <Link to='/products?category=Makeup' style={navLinkStyle}>MAKEUP</Link>
          <Link to='/products?category=Nails' style={navLinkStyle}>NAILS</Link>
          <Link to='/products?category=Body Care' style={navLinkStyle}>BODY</Link>
          <Link to='/about' style={navLinkStyle}>ABOUT</Link>
        </div>

        {/* NAV ICONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <FiSearch
            size={18}
            style={{ cursor: 'pointer', color: '#444' }}
            onClick={() => setSearchOpen(true)}
          />

          {user ? (
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <FiUser size={18} style={{ cursor: 'pointer', color: '#444' }} />
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%',
                  background: '#fff', border: '0.5px solid #eee',
                  borderRadius: '12px', padding: '12px',
                  minWidth: '170px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  zIndex: 999
                }}>
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    color: '#111', padding: '4px 8px 10px',
                    borderBottom: '0.5px solid #eee', marginBottom: '6px'
                  }}>
                    {user.name}
                  </div>
                  <Link to='/account' style={dropLinkStyle}>My Account</Link>
                  {user.isSeller && (
                    <Link to='/seller' style={dropLinkStyle}>Seller Dashboard</Link>
                  )}
                  {user.isAdmin && (
                    <Link to='/admin' style={dropLinkStyle}>Admin Dashboard</Link>
                  )}
                  <div
                    onClick={handleLogout}
                    style={{ ...dropLinkStyle, color: '#e74c3c', cursor: 'pointer' }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <FiUser
              size={18}
              style={{ cursor: 'pointer', color: '#444' }}
              onClick={() => navigate('/login')}
            />
          )}

          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => navigate('/cart')}
          >
            <FiShoppingBag size={18} style={{ color: '#444' }} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#111', color: '#fff',
                borderRadius: '50%', width: '16px', height: '16px',
                fontSize: '9px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: '700'
              }}>
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

const navLinkStyle = {
  height: '100%', display: 'flex', alignItems: 'center',
  padding: '0 14px', fontSize: '11.5px', fontWeight: '500',
  color: '#444', textDecoration: 'none', letterSpacing: '0.08em',
  cursor: 'pointer', whiteSpace: 'nowrap',
  borderBottom: '2px solid transparent',
  transition: 'all 0.2s',
  fontFamily: "'DM Sans', sans-serif"
}

const dropdownStyle = {
  position: 'absolute', top: '100%', left: '-20px',
  background: '#fff', border: '0.5px solid #eee',
  borderRadius: '12px', padding: '22px 24px',
  display: 'flex', gap: '28px', minWidth: '420px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)', zIndex: 999
}

const dropColStyle = {
  display: 'flex', flexDirection: 'column', gap: '2px'
}

const dropHeadStyle = {
  fontSize: '9px', fontWeight: '600', color: '#aaa',
  letterSpacing: '0.12em', textTransform: 'uppercase',
  marginBottom: '10px'
}

const dropLinkStyle = {
  fontSize: '12px', color: '#555', textDecoration: 'none',
  padding: '4px 0', display: 'block', transition: 'color 0.15s',
  fontFamily: "'DM Sans', sans-serif"
}

export default Navbar