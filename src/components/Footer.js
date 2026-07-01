import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'
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

const shopLinks = ['Skincare', 'Haircare', 'Makeup', 'Nails', 'Lashes', 'Body Care', 'Fragrance', 'Candles']
const helpLinks = ['Contact Us', 'Track Order', 'Returns & Refunds', 'Shipping Info', 'FAQs', 'Support']
const aboutLinks = ['Our Story', 'Careers', 'Press', 'Affiliates', 'Blog', 'Community']
const sellerLinks = ['Become a Seller', 'Seller Resources', 'Seller Agreement', 'Pricing', 'Seller FAQs', 'Success Stories']
const policyLinks = ['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'Accessibility']

const socialLinks = [
  { icon: <FiInstagram size={16} />, href: '#', label: 'Instagram' },
  { icon: <FiTwitter size={16} />, href: '#', label: 'Twitter' },
  { icon: <FiYoutube size={16} />, href: '#', label: 'YouTube' },
  { icon: <FiFacebook size={16} />, href: '#', label: 'Facebook' }
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
              Canada's home for global beauty. Discover, shop and sell authentic beauty products for every shade and tradition.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
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
                </a>
              ))}
            </div>
            <div className='glory-drawer-location' style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              <span>CA</span>
              <span>Shipping across Canada</span>
              <span style={{
                fontSize: '10px',
                color: '#c97a9a',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
                CHANGE
              </span>
            </div>
          </div>

          <FooterColumn title='SHOP' links={shopLinks} to={(item) => `/products?category=${item}`} />
          <FooterColumn title='HELP' links={helpLinks} to={() => '/'} />
          <FooterColumn title='ABOUT' links={aboutLinks} to={() => '/about'} />
          <FooterColumn title='SELL ON GLORY' links={sellerLinks} to={() => '/seller'} />
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
            (c) 2026 GLORY. All rights reserved. Made for Canada.
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {policyLinks.map(item => (
              <Link
                key={item}
                to='/'
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
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

const FooterColumn = ({ title, links, to }) => (
  <div>
    <div style={footerHeadStyle}>{title}</div>
    {links.map(item => (
      <Link
        key={item}
        to={to(item)}
        style={footerLinkStyle}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
      >
        {item}
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
