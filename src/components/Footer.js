import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiYoutube, FiFacebook } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer style={{
      background: '#111', color: 'rgba(255,255,255,0.7)',
      padding: '60px 40px 30px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        gap: '40px', marginBottom: '48px'
      }}>

        {/* BRAND */}
        <div>
          <div style={{
            fontFamily: 'serif', fontWeight: '800',
            fontSize: '22px', color: '#fff',
            letterSpacing: '0.1em', marginBottom: '14px'
          }}>GLORY.</div>
          <p style={{ fontSize: '12px', lineHeight: '1.8', maxWidth: '240px', marginBottom: '20px' }}>
            Your ultimate destination for beauty that empowers. Discover, shop, and glow with confidence.
          </p>
          <div style={{ display: 'flex', gap: '14px' }}>
            <FiInstagram size={18} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} />
            <FiTwitter size={18} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} />
            <FiYoutube size={18} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} />
            <FiFacebook size={18} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} />
          </div>
        </div>

        {/* SHOP */}
        <div>
          <div style={footerHeadStyle}>SHOP</div>
          <Link to='/products?category=Skincare' style={footerLinkStyle}>Skincare</Link>
          <Link to='/products?category=Makeup' style={footerLinkStyle}>Makeup</Link>
          <Link to='/products?category=Haircare' style={footerLinkStyle}>Haircare</Link>
          <Link to='/products?category=Nails' style={footerLinkStyle}>Nails</Link>
          <Link to='/products?category=Body Care' style={footerLinkStyle}>Body Care</Link>
          <Link to='/products?category=Lashes' style={footerLinkStyle}>Lashes</Link>
          <Link to='/products?category=Fragrance' style={footerLinkStyle}>Fragrance</Link>
          <Link to='/products?category=Scented Candles' style={footerLinkStyle}>Scented Candles</Link>
        </div>

        {/* ABOUT US */}
        <div>
          <div style={footerHeadStyle}>ABOUT US</div>
          <Link to='/about' style={footerLinkStyle}>Our Story</Link>
          <Link to='/about' style={footerLinkStyle}>Careers</Link>
          <Link to='/about' style={footerLinkStyle}>Press</Link>
          <Link to='/about' style={footerLinkStyle}>Affiliates</Link>
        </div>

        {/* CUSTOMER CARE */}
        <div>
          <div style={footerHeadStyle}>CUSTOMER CARE</div>
          <Link to='/' style={footerLinkStyle}>Contact Us</Link>
          <Link to='/' style={footerLinkStyle}>Track Order</Link>
          <Link to='/' style={footerLinkStyle}>Returns & Refunds</Link>
          <Link to='/' style={footerLinkStyle}>Shipping Info</Link>
          <Link to='/' style={footerLinkStyle}>FAQs</Link>
          <Link to='/' style={footerLinkStyle}>Support</Link>
        </div>

        {/* SELL ON GLORY */}
        <div>
          <div style={footerHeadStyle}>SELL ON GLORY</div>
          <Link to='/seller' style={footerLinkStyle}>Become a Seller</Link>
          <Link to='/seller' style={footerLinkStyle}>Seller Resources</Link>
          <Link to='/seller' style={footerLinkStyle}>Seller Agreement</Link>
          <Link to='/seller' style={footerLinkStyle}>Pricing</Link>
          <Link to='/seller' style={footerLinkStyle}>FAQs</Link>
        </div>
      </div>

      {/* TRUST BADGES */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px', padding: '28px 0',
        borderTop: '0.5px solid rgba(255,255,255,0.1)',
        borderBottom: '0.5px solid rgba(255,255,255,0.1)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🚚</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>100% AUTHENTIC</div>
            <div style={{ fontSize: '10px' }}>Genuine products only</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔒</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>SECURE PAYMENTS</div>
            <div style={{ fontSize: '10px' }}>Safe & encrypted</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>↩️</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>EASY RETURNS</div>
            <div style={{ fontSize: '10px' }}>Hassle-free process</div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: '11px'
      }}>
        <div>© 2024 GLORY. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to='/' style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to='/' style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  )
}

const footerHeadStyle = {
  fontSize: '10px', fontWeight: '700', color: '#fff',
  letterSpacing: '0.12em', marginBottom: '16px'
}

const footerLinkStyle = {
  display: 'block', fontSize: '12px',
  color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
  padding: '4px 0', transition: 'color 0.2s'
}

export default Footer