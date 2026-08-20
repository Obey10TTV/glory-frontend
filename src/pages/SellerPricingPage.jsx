import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { FiArrowRight, FiCheck, FiShield, FiTrendingUp } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { getMarketplaceConfig } from '../api'
import { useMarket } from '../context/MarketContext'
import { formatMinorCurrency } from '../utils/currency'

const SellerPricingPage = () => {
  const { market } = useMarket()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    getMarketplaceConfig(market.code)
      .then(({ data }) => {
        if (active) setConfig(data)
      })
      .catch(() => {
        if (active) setError('Regional pricing is temporarily unavailable. Please try again shortly.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [market.code])

  const listingPromotions = useMemo(
    () => config?.promotionPlans?.filter(plan => plan.placement === 'homepage_featured') || [],
    [config]
  )
  const videoPromotions = useMemo(
    () => config?.promotionPlans?.filter(plan => plan.placement === 'homepage_video') || [],
    [config]
  )
  const renewalCopy = market.billingProvider === 'paystack'
    ? 'Paid plans give 30 days of access and renew only when you make another payment.'
    : 'Paid plans renew monthly until cancelled from your secure billing portal.'

  return (
    <div className='glory-page glory-pricing-page'>
      <Navbar />
      <main>
        <section className='glory-pricing-hero'>
          <div className='glory-pricing-shell'>
            <span>Seller pricing · {market.name}</span>
            <h1>Build reach before you pay for more of it.</h1>
            <p>
              Start free, then invest in catalogue capacity and clearly labelled visibility when your beauty business is ready. Glory takes no commission from private buyer-to-seller payments.
            </p>
            <div className='glory-pricing-actions'>
              <Link to='/register' className='is-primary'>Start selling <FiArrowRight aria-hidden='true' /></Link>
              <Link to='/paid-promotion-terms'>Read commercial terms</Link>
            </div>
          </div>
        </section>

        <section className='glory-pricing-plans' aria-labelledby='seller-plan-title'>
          <div className='glory-pricing-shell'>
            <div className='glory-pricing-heading'>
              <div>
                <span>Catalogue plans</span>
                <h2 id='seller-plan-title'>Choose the room you need to grow.</h2>
              </div>
              <p>{renewalCopy} Secure Glory service payments are handled by {market.billingProvider === 'paystack' ? 'Paystack' : 'Stripe'}.</p>
            </div>

            {loading && <div className='glory-pricing-state'><Loader /></div>}
            {!loading && error && (
              <div className='glory-pricing-state' role='status'>
                <p>{error}</p>
                <Link to='/contact'>Contact seller support <FiArrowRight aria-hidden='true' /></Link>
              </div>
            )}
            {!loading && config?.sellerPlans?.length > 0 && (
              <div className='glory-pricing-grid'>
                {config.sellerPlans.map((plan, index) => (
                  <article className={`glory-pricing-plan ${index === 1 ? 'is-featured' : ''}`} key={plan.code}>
                    <div className='glory-pricing-plan-topline'>
                      <span>{plan.label}</span>
                      {index === 1 && <small>Popular next step</small>}
                    </div>
                    <strong>
                      {plan.feeMinor === 0 ? 'Free' : formatMinorCurrency(plan.feeMinor, plan.currency, market.locale)}
                      {plan.feeMinor > 0 && <small>{market.billingProvider === 'paystack' ? ' / 30 days' : ' / month'}</small>}
                    </strong>
                    <p>{plan.description}</p>
                    <ul>
                      {plan.features.map(feature => (
                        <li key={feature}><FiCheck aria-hidden='true' /><span>{feature}</span></li>
                      ))}
                    </ul>
                    <Link to='/register'>Choose {plan.label} <FiArrowRight aria-hidden='true' /></Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {!loading && config && (
          <section className='glory-pricing-visibility' aria-labelledby='visibility-title'>
            <div className='glory-pricing-shell'>
              <div className='glory-pricing-heading'>
                <div>
                  <span>Paid visibility</span>
                  <h2 id='visibility-title'>Put approved products in front of more shoppers.</h2>
                </div>
                <p>Every paid placement is reviewed, market-specific and visibly labelled Sponsored. Paying never creates a verification badge.</p>
              </div>
              <div className='glory-promotion-price-groups'>
                <PromotionGroup icon={<FiTrendingUp />} title='Homepage listings' plans={listingPromotions} market={market} />
                <PromotionGroup icon={<FiShield />} title='Reviewed video campaigns' plans={videoPromotions} market={market} />
              </div>
            </div>
          </section>
        )}

        <section className='glory-pricing-principles'>
          <div className='glory-pricing-shell'>
            <article>
              <span>01</span>
              <h2>No sales commission</h2>
              <p>Glory charges sellers for platform services, not a percentage of the private product payment agreed with a buyer.</p>
            </article>
            <article>
              <span>02</span>
              <h2>Trust is not for sale</h2>
              <p>Identity, product evidence and compliance checks remain independent of every plan and promotion purchase.</p>
            </article>
            <article>
              <span>03</span>
              <h2>Grace for new founders</h2>
              <p>{market.code === 'NG' ? 'Nigeria starts with 10 free active listings so an emerging founder can prove demand before upgrading.' : 'Starter keeps the first catalogue free so a growing founder can prove demand before upgrading.'}</p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

const PromotionGroup = ({ icon, title, plans, market }) => (
  <article className='glory-promotion-price-group'>
    <div className='glory-promotion-price-title'>{icon}<h3>{title}</h3></div>
    <div>
      {plans.map(plan => (
        <div className='glory-promotion-price-row' key={plan.code}>
          <span><strong>{plan.label}</strong><small>{plan.durationDays} days</small></span>
          <b>{formatMinorCurrency(plan.feeMinor, plan.currency, market.locale)}</b>
        </div>
      ))}
    </div>
    <Link to='/seller'>Manage campaigns <FiArrowRight aria-hidden='true' /></Link>
  </article>
)

export default SellerPricingPage
