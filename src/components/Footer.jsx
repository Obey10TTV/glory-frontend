import { Link } from 'react-router'
import { FiArrowRight, FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'
import UnitedKingdomFlag from './UnitedKingdomFlag'
import { SiAmericanexpress, SiBitcoin, SiEthereum, SiMastercard, SiSolana, SiStripe, SiVisa, SiXrp } from 'react-icons/si'

const footerGroups = [
  {
    title: 'Shop',
    links: [
      { label: 'Skincare', to: '/products?category=Skincare' },
      { label: 'Haircare', to: '/products?category=Haircare' },
      { label: 'Makeup', to: '/products?category=Makeup' },
      { label: 'Fragrance', to: '/products?category=Fragrance' },
      { label: 'All beauty', to: '/products' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact us', to: '/contact' },
      { label: 'Marketplace safety', to: '/marketplace-safety' },
      { label: 'Reviews policy', to: '/reviews-policy' },
      { label: 'How Glory works', to: '/about' },
      { label: 'Security', to: '/security' },
      { label: 'FAQs', to: '/faq' },
    ],
  },
  {
    title: 'Sell on Glory',
    links: [
      { label: 'Become a seller', to: '/sell-on-glory' },
      { label: 'Seller resources', to: '/seller-resources' },
      { label: 'Seller agreement', to: '/seller-agreement' },
      { label: 'Pricing', to: '/seller-pricing' },
      { label: 'Paid promotion terms', to: '/paid-promotion-terms' },
      { label: 'Seller FAQs', to: '/seller-faq' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our story', to: '/about' },
      { label: 'Community', to: '/community' },
      { label: 'Press', to: '/press' },
      { label: 'Careers', to: '/careers' },
      { label: 'Blog', to: '/blog' },
    ],
  },
]

const policyLinks = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Cookies', to: '/cookies' },
  { label: 'Security', to: '/security' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Reviews policy', to: '/reviews-policy' },
]

const socials = [
  { Icon: FiInstagram, label: 'Glory community on Instagram', to: '/community' },
  { Icon: FiTwitter, label: 'Glory updates', to: '/press' },
  { Icon: FiYoutube, label: 'Glory beauty videos', to: '/blog' },
  { Icon: FiFacebook, label: 'Glory customer support', to: '/contact' },
]

const paymentBadges = [
  { label: 'Stripe', Icon: SiStripe },
  { label: 'Visa', Icon: SiVisa },
  { label: 'Mastercard', Icon: SiMastercard },
  { label: 'American Express', Icon: SiAmericanexpress },
  { label: 'Bitcoin', Icon: SiBitcoin, className: 'is-bitcoin' },
  { label: 'Ethereum', Icon: SiEthereum, className: 'is-ethereum' },
  { label: 'Solana', Icon: SiSolana, className: 'is-solana' },
  { label: 'XRP', Icon: SiXrp, className: 'is-xrp' },
]

const Footer = () => (
  <footer className='glory-footer-v2'>
    <div className='glory-footer-invite'>
      <div className='glory-footer-shell'>
        <div>
          <span>Stay close to the glow</span>
          <h2>Beauty worth coming back for.</h2>
        </div>
        <Link to='/community' className='glory-footer-invite-link'>
          Join the community
          <FiArrowRight size={17} aria-hidden='true' />
        </Link>
      </div>
    </div>

    <div className='glory-footer-main'>
      <div className='glory-footer-shell'>
        <div className='glory-footer-topline'>
          <div className='glory-footer-brand'>
            <Link to='/' className='glory-footer-wordmark' aria-label='Glory home'>GLORY.</Link>
            <p>The UK beauty marketplace for every shade, texture and ritual. Discover independent sellers, ask thoughtful questions and buy with care.</p>
            <div className='glory-footer-market'>
              <UnitedKingdomFlag size={27} title='United Kingdom' />
              <span>United Kingdom marketplace<br />Worldwide delivery where available</span>
            </div>
          </div>

          <div className='glory-footer-links'>
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((link) => <li key={link.to}><Link to={link.to}>{link.label}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className='glory-footer-divider' />

        <div className='glory-footer-bottomline'>
          <div className='glory-footer-legal'>
            <span>© {new Date().getFullYear()} Glory Beauty Ltd.</span>
            {policyLinks.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
          </div>

          <div className='glory-footer-right'>
            <div className='glory-footer-payments' aria-label='Seller service payment and buyer payment options offered by independent sellers'>
              {paymentBadges.map(({ label, Icon, className = '' }) => (
                <Icon key={label} className={`glory-payment-icon ${className}`} title={label} aria-label={label} size={24} />
              ))}
            </div>
            <div className='glory-footer-socials'>
              {socials.map(({ Icon, label, to }) => (
                <Link key={label} to={to} aria-label={label}>
                  <Icon size={17} aria-hidden='true' />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
