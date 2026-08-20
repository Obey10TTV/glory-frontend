import { useNavigate } from 'react-router'
import { FiGlobe, FiMessageCircle, FiShield, FiShoppingBag, FiUsers } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useMarket } from '../context/MarketContext'
import { ACTIVE_MARKETS } from '../data/markets'

const values = [
  {
    Icon: FiShoppingBag,
    title: 'Built for independent sellers',
    text: 'Glory gives emerging and established beauty businesses a professional place to present their products and earn visibility.'
  },
  {
    Icon: FiShield,
    title: 'Trust before reach',
    text: 'Seller checks, reviewed listings, interaction-based reviews and confidential reporting help people make more informed decisions.'
  },
  {
    Icon: FiUsers,
    title: 'Room for new businesses',
    text: 'A useful free tier keeps entry open, while paid plans and clearly labelled promotion support businesses ready to grow.'
  }
]

const AboutPage = () => {
  const navigate = useNavigate()
  const { market } = useMarket()

  return (
    <div className='glory-about-page glory-about-global'>
      <Navbar />

      <main>
        <section className='glory-about-hero'>
          <div className='glory-about-hero-layer' />
          <div className='glory-about-hero-content'>
            <p className='glory-about-eyebrow'>About Glory</p>
            <h1 className='glory-about-hero-title'>
              Local beauty,
              <span>without borders.</span>
            </h1>
            <p className='glory-about-hero-copy'>
              Glory is a global classified beauty marketplace. Independent sellers publish reviewed listings,
              shoppers ask questions directly, and each region keeps the currency and context that make it feel local.
            </p>
          </div>
        </section>

        <section className='glory-about-section glory-about-mission'>
          <div className='glory-about-narrow'>
            <p className='glory-about-eyebrow'>Why we exist</p>
            <h2 className='glory-about-heading'>
              A storefront is more than a social post.
              <span>It should be findable, credible and built to grow.</span>
            </h2>
            <p className='glory-about-body'>
              Beauty businesses often begin in messages and social feeds. Glory gives those sellers a structured
              catalogue, brand identity, trust signals and paid visibility without taking over their customer relationship.
              Glory hosts discovery and conversation; buyers and sellers arrange payment and delivery directly.
            </p>
          </div>
        </section>

        <section className='glory-about-section glory-about-values' aria-label='What guides Glory'>
          <div className='glory-about-values-grid'>
            {values.map(({ Icon, title, text }) => (
              <article className='glory-about-card' key={title}>
                <div className='glory-about-card-icon'><Icon size={24} aria-hidden='true' /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='glory-about-regions' aria-labelledby='glory-regions-title'>
          <div className='glory-about-regions-copy'>
            <p className='glory-about-eyebrow'>One marketplace, local context</p>
            <h2 id='glory-regions-title'>Built once. Shaped for each market.</h2>
            <p>
              Nigeria, the United Kingdom, the United States and Canada share one trusted Glory account system.
              Products, pricing, seller services and campaigns are presented in the selected market&apos;s currency.
            </p>
          </div>
          <div className='glory-about-region-list'>
            {Object.values(ACTIVE_MARKETS).map((item) => (
              <button
                type='button'
                key={item.code}
                className={item.code === market.code ? 'is-current' : ''}
                onClick={() => navigate(`/${item.slug}`)}
              >
                <span role='img' aria-label={`${item.name} flag`}>{item.flag}</span>
                <strong>{item.name}</strong>
                <small>{item.currency}</small>
              </button>
            ))}
          </div>
        </section>

        <section className='glory-about-trust' aria-labelledby='glory-about-trust-title'>
          <FiMessageCircle size={25} aria-hidden='true' />
          <div>
            <p className='glory-about-eyebrow'>The Glory model</p>
            <h2 id='glory-about-trust-title'>Discovery and safer conversation, not a hidden checkout.</h2>
            <p>
              Glory does not collect the product purchase money or deliver products. Payment methods, returns and
              fulfilment are stated by each seller. Keeping questions and agreements inside Glory creates a clearer
              interaction history if something needs to be reported.
            </p>
          </div>
          <FiGlobe size={38} aria-hidden='true' />
        </section>

        <section className='glory-about-cta' aria-labelledby='about-cta-title'>
          <div className='glory-about-cta-layer' />
          <div className='glory-about-cta-content'>
            <h2 id='about-cta-title'>Discover beauty or build your brand.</h2>
            <p>Explore Glory {market.name}, or create a verified storefront for your next chapter.</p>
            <div className='glory-about-cta-actions'>
              <button onClick={() => navigate('/register')} className='glory-btn glory-about-cta-primary'>Start selling</button>
              <button onClick={() => navigate('/products')} className='glory-about-cta-secondary'>Shop beauty</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage
