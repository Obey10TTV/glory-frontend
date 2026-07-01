import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiYoutube, FiFacebook } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* NEWSLETTER */}
      <div style={{
        background: '#f5f5f5', padding: '48px 40px',
        borderTop: '1px solid #e5e5e5'
      }}>
        <div style={{
          maxWidth: '500px', margin: '0 auto', textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px', fontWeight: '700',
            color: '#999', letterSpacing: '0.2em', marginBottom: '10px'
          }}>
            STAY IN THE LOOP
          </div>
          <h3 style={{
            fontSize: '24px', fontWeight: '900',
            color: '#111', letterSpacing: '-0.5px', marginBottom: '8px'
          }}>
            GET THE LATEST DROPS FIRST
          </h3>
          <p style={{
            fontSize: '13px', color: '#666',
            marginBottom: '24px', lineHeight: '1.6'
          }}>
            New products, exclusive offers and beauty tips straight to your inbox.
          </p>
          <div className='glory-newsletter-form' style={{
            display: 'flex', gap: '0',
            border: '1.5px solid #111'
          }}>
            <input
              type='email'
              placeholder='Enter your email address'
              style={{
                flex: 1, padding: '14px 16px',
                border: 'none', outline: 'none',
                fontSize: '13px', fontFamily: "'Inter', sans-serif",
                background: '#fff'
              }}
            />
            <button style={{
              background: '#111', color: '#fff',
              border: 'none', padding: '14px 24px',
              fontSize: '12px', fontWeight: '800',
              cursor: 'pointer', letterSpacing: '0.08em',
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap'
            }}>
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div style={{
        background: '#111', padding: '60px 40px 40px',
        color: 'rgba(255,255,255,0.7)'
      }}>
        <div className='glory-footer-grid' style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: '40px', marginBottom: '48px'
        }}>

          {/* BRAND */}
          <div>
            <div style={{
              fontWeight: '900', fontSize: '24px',
              color: '#fff', letterSpacing: '-0.5px',
              marginBottom: '16px'
            }}>
              GLORY.
            </div>
            <p style={{
              fontSize: '13px', lineHeight: '1.8',
              maxWidth: '260px', marginBottom: '24px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              Canada's home for global beauty. Discover, shop and sell authentic beauty products for every shade and tradition.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {[
                { icon: <FiInstagram size={16} />, href: '#' },
                { icon: <FiTwitter size={16} />, href: '#' },
                { icon: <FiYoutube size={16} />, href: '#' },
                { icon: <FiFacebook size={16} />, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} style={{
                  width: '36px', height: '36px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#fff'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
            {/* LOCATION */}
            <div className='glory-drawer-location' style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', color: 'rgba(255,255,255,0.5)'
            }}>
              <span>🇨🇦</span>
              <span>Shipping across Canada</span>
              <span style={{
                fontSize: '10px', color: '#c97a9a',
                fontWeight: '600', cursor: 'pointer',
                textDecoration: 'underline'
              }}>CHANGE</span>
            </div>
          </div>

          {/* SHOP */}
          <div>
            <div style={footerHeadStyle}>SHOP</div>
            {['Skincare', 'Haircare', 'Makeup', 'Nails', 'Lashes', 'Body Care', 'Fragrance', 'Candles'].map(item => (
              <Link key={item} to={`/products?category=${item}`} style={footerLinkStyle}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* HELP */}
          <div>
            <div style={footerHeadStyle}>HELP</div>
            {['Contact Us', 'Track Order', 'Returns & Refunds', 'Shipping Info', 'FAQs', 'Support'].map(item => (
              <Link key={item} to='/' style={footerLinkStyle}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* ABOUT */}
          <div>
            <div style={footerHeadStyle}>ABOUT</div>
            {['Our Story', 'Careers', 'Press', 'Affiliates', 'Blog', 'Community'].map(item => (
              <Link key={item} to='/about' style={footerLinkStyle}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* SELL */}
          <div>
            <div style={footerHeadStyle}>SELL ON GLORY</div>
            {['Become a Seller', 'Seller Resources', 'Seller Agreement', 'Pricing', 'Seller FAQs', 'Success Stories'].map(item => (
              <Link key={item} to='/seller' style={footerLinkStyle}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* PAYMENTS */}
        <div className='glory-footer-bottom' style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '32px', marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '11px', fontWeight: '700',
            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em',
            marginBottom: '16px'
          }}>
            ACCEPTED PAYMENTS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

            {/* STRIPE */}
            <div style={payBadgeStyle}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#635BFF' }}>stripe</span>
            </div>

            {/* VISA */}
            <div style={payBadgeStyle}>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#1A1F71', fontStyle: 'italic' }}>VISA</span>
            </div>

            {/* MASTERCARD */}
            <div style={{ ...payBadgeStyle, display: 'flex', gap: '0', padding: '6px 10px', overflow: 'hidden' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EB001B', opacity: 0.9 }} />
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F79E1B', marginLeft: '-8px', opacity: 0.9 }} />
            </div>

            {/* AMEX */}
            <div style={payBadgeStyle}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#2E77BC' }}>AMEX</span>
            </div>

            {/* BITCOIN */}
            <div style={{ ...payBadgeStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#F7931A', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px', fontWeight: '900', color: '#fff'
              }}>₿</div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#F7931A' }}>BTC</span>
            </div>

            {/* ETHEREUM */}
            <div style={{ ...payBadgeStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#627EEA', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px', fontWeight: '900', color: '#fff'
              }}>Ξ</div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#627EEA' }}>ETH</span>
            </div>

            {/* USDT */}
            <div style={{ ...payBadgeStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#26A17B', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: '#fff'
              }}>₮</div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#26A17B' }}>USDT</span>
            </div>

            {/* SOLANA */}
            <div style={{ ...payBadgeStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #9945FF, #14F195)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '9px', fontWeight: '900', color: '#fff'
              }}>◎</div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#14F195' }}>SOL</span>
            </div>

            {/* XRP */}
            <div style={{ ...payBadgeStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#346AA9', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '9px', fontWeight: '900', color: '#fff'
              }}>✕</div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#346AA9' }}>XRP</span>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 GLORY. All rights reserved. Made for Canada 🇨🇦
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'Accessibility'].map(item => (
              <Link key={item} to='/' style={{
                fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                textDecoration: 'none', transition: 'color 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

const footerHeadStyle = {
  fontSize: '11px', fontWeight: '800',
  color: '#fff', letterSpacing: '0.15em',
  marginBottom: '18px', textTransform: 'uppercase'
}

const footerLinkStyle = {
  display: 'block', fontSize: '13px',
  color: 'rgba(255,255,255,0.5)',
  textDecoration: 'none', padding: '5px 0',
  transition: 'color 0.2s'
}

const payBadgeStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '6px', padding: '8px 12px',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center'
}

export default Footer
