import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'
import UnitedKingdomFlag from './UnitedKingdomFlag'
import {
  SiAmericanexpress,
  SiBitcoin,
  SiEthereum,
  SiMastercard,
  SiSolana,
  SiStripe,
  SiTether,
  SiVisa,
  SiXrp
} from 'react-icons/si'

const shopLinks = [
  { label: 'Skincare', to: '/products?category=Skincare' },
  { label: 'Haircare', to: '/products?category=Haircare' },
  { label: 'Makeup', to: '/products?category=Makeup' },
  { label: 'Nails', to: '/products?category=Nails' },
  { label: 'Lashes', to: '/products?category=Lashes' },
  { label: 'Body Care', to: '/products?category=Body%20Care' },
  { label: 'Fragrance', to: '/products?category=Fragrance' },
  { label: 'Candles', to: '/products?category=Scented%20Candles' },
]

const helpLinks = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Returns & Refunds', to: '/returns' },
  { label: 'Shipping Info', to: '/shipping' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Support', to: '/support' },
]

const aboutLinks = [
  { label: 'Our Story', to: '/about' },
  { label: 'Careers', to: '/careers' },
  { label: 'Press', to: '/press' },
  { label: 'Affiliates', to: '/affiliates' },
  { label: 'Blog', to: '/blog' },
  { label: 'Community', to: '/community' },
]

const sellerLinks = [
  { label: 'Become a Seller', to: '/sell-on-glory' },
  { label: 'Seller Resources', to: '/seller-resources' },
  { label: 'Seller Agreement', to: '/seller-agreement' },
  { label: 'Pricing', to: '/seller-pricing' },
  { label: 'Seller FAQs', to: '/seller-faq' },
  { label: 'Success Stories', to: '/success-stories' },
]

const policyLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
  { label: 'Security', to: '/security' },
  { label: 'Accessibility', to: '/accessibility' },
]

const socialLinks = [
  { icon: <FiInstagram size={16} />, to: '/community', label: 'Community' },
  { icon: <FiTwitter size={16} />, to: '/press', label: 'Press' },
  { icon: <FiYoutube size={16} />, to: '/blog', label: 'Blog' },
  { icon: <FiFacebook size={16} />, to: '/contact', label: 'Contact' }
]

const paymentBadges = [
  { label: 'Stripe', Icon: SiStripe, color: '#635BFF' },
  { label: 'Visa', Icon: SiVisa, color: '#1A1F71' },
  { label: 'Mastercard', Icon: SiMastercard, color: '#EB001B' },
  { label: 'Amex', Icon: SiAmericanexpress, color: '#2E77BC' },
  { label: 'BTC', Icon: SiBitcoin, color: '#F7931A' },
  { label: 'ETH', Icon: SiEthereum, color: '#627EEA' },
  { label: 'USDT', Icon: SiTether, color: '#26A17B' },
  { label: 'SOL', Icon: SiSolana, color: '#14F195' },
  { label: 'XRP', Icon: SiXrp, color: '#23292F' }
]

const Footer = () => {
  return (
    <footer style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        background: '#f5f5f5',
        padding: '48px 40px',
        borderTop: '1px solid #e5e5e5'
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#999',
            letterSpacing: '0.2em',
            marginBottom: '10px'
          }}>
            STAY IN THE LOOP
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '900',
            color: '#111',
            letterSpacing: '-0.5px',
            marginBottom: '8px'
          }}>
            GET THE LATEST DROPS FIRST
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            New products, exclusive offers and beauty tips straight to your inbox.
          </p>
          <div className='glory-newsletter-form' style={{
            display: 'flex',
            gap: '0',
            border: '1.5px solid #111'
          }}>
            <input
              type='email'
              placeholder='Enter your email address'
              aria-label='Email address'
              style={{
                flex: 1,
                padding: '14px 16px',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                fontFamily: "'Inter', sans-serif",
                background: '#fff'
              }}
            />
            <button style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              padding: '14px 24px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap'
            }}>
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>

      <div style={{
        background: '#111',
        padding: '60px 40px 40px',
        color: 'rgba(255,255,255,0.7)'
      }}>
        <div className='glory-footer-grid' style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: '40px',
          marginBottom: '48px'
        }}>
          <div>
            <div style={{
              fontWeight: '900',
              fontSize: '24px',
              color: '#fff',
              letterSpacing: '-0.5px',
              marginBottom: '16px'
            }}>
              GLORY.
            </div>
            <p style={{
              fontSize: '13px',
              lineHeight: '1.8',
              maxWidth: '260px',
              marginBottom: '24px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              The UK's home for global beauty. Discover, shop and sell authentic products for every shade and tradition, with international delivery where available.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  to={social.to}
                  aria-label={social.label}
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
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
                  {social.icon}
                </Link>
              ))}
            </div>
            <div className='glory-drawer-location' style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              <UnitedKingdomFlag size={22} title='United Kingdom marketplace' />
              <span>UK based · Worldwide delivery</span>
              <Link
                to='/shipping'
                style={{
                fontSize: '10px',
                color: '#c97a9a',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
                DETAILS
              </Link>
            </div>
          </div>

          <FooterColumn title='SHOP' links={shopLinks} />
          <FooterColumn title='HELP' links={helpLinks} />
          <FooterColumn title='ABOUT' links={aboutLinks} />
          <FooterColumn title='SELL ON GLORY' links={sellerLinks} />
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '32px',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.15em',
            marginBottom: '16px'
          }}>
            ACCEPTED PAYMENTS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {paymentBadges.map(({ label, Icon, color }) => (
              <div key={label} aria-label={label} style={payBadgeStyle}>
                <Icon size={18} color={color} aria-hidden='true' />
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color,
                  letterSpacing: '0.02em'
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='glory-footer-bottom' style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            (c) 2026 GLORY. All rights reserved. Based in the United Kingdom.
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {policyLinks.map(item => (
              <Link
                key={item.label}
                to={item.to}
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                {item.label}
              </Link>
            ))}
            <button
              type='button'
              className='glory-footer-cookie-button'
              onClick={() => window.dispatchEvent(new Event('glory:open-cookie-settings'))}
            >
              Manage cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

const FooterColumn = ({ title, links }) => (
  <div>
    <div style={footerHeadStyle}>{title}</div>
    {links.map(item => (
      <Link
        key={item.label}
        to={item.to}
        style={footerLinkStyle}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
      >
        {item.label}
      </Link>
    ))}
  </div>
)

const footerHeadStyle = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#fff',
  letterSpacing: '0.15em',
  marginBottom: '18px',
  textTransform: 'uppercase'
}

const footerLinkStyle = {
  display: 'block',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.5)',
  textDecoration: 'none',
  padding: '5px 0',
  transition: 'color 0.2s'
}

const payBadgeStyle = {
  background: '#fff',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '999px',
  padding: '9px 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  minHeight: '40px'
}

export default Footer
