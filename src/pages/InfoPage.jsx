import { Link, Navigate } from 'react-router'
import { FiArrowRight, FiCheckCircle, FiMail } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { infoPages } from '../data/infoPages'

const InfoPage = ({ slug }) => {
  const page = infoPages[slug]
  const isSellerLanding = slug === 'sell-on-glory'
  const pageGroup = String(page?.group || '').toLowerCase().replace(/\s+/g, '-')

  if (!page) {
    return <Navigate to='/' replace />
  }

  return (
    <div className={`glory-page glory-info-page glory-info-v2 glory-info-group-${pageGroup} ${isSellerLanding ? 'glory-seller-landing' : ''}`}>
      <Navbar />

      <main>
        <section className={`glory-info-hero-v2 ${isSellerLanding ? 'has-image' : ''}`}>
          {isSellerLanding && (
            <>
              <img
                src='/images/home/seller-founder.jpg'
                alt='Independent beauty founder preparing products for her store'
                width='1672'
                height='940'
                fetchPriority='high'
              />
              <span className='glory-info-hero-wash' />
            </>
          )}
          <div className='glory-info-shell glory-info-hero-content'>
            <span className='glory-info-eyebrow'>{page.eyebrow || page.group}</span>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <div className='glory-info-actions'>
              <InfoAction action={page.primaryAction} primary />
              <InfoAction action={page.secondaryAction} />
            </div>
          </div>
        </section>

        {isSellerLanding && (
          <section className='glory-seller-proof' aria-label='Glory seller platform'>
            <div className='glory-info-shell'>
              {[
                ['Verified profiles', 'Trust starts with a reviewed seller identity.'],
                ['Reviewed products', 'Listings are checked before shoppers can buy.'],
                ['Local markets, global ambition', 'Regional pricing and standards with room to reach shoppers elsewhere.'],
              ].map(([title, text], index) => (
                <div key={title}>
                  <span>0{index + 1}</span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {page.cards?.length > 0 && (
          <section className='glory-info-content-section'>
            <div className='glory-info-shell'>
              <div className='glory-info-section-heading'>
                <span>{page.group}</span>
                <h2>{isSellerLanding ? 'A storefront built for beauty.' : 'What you should know.'}</h2>
              </div>
              <div className='glory-info-card-grid-v2'>
              {page.cards.map((card, index) => (
                <article className='glory-info-card' key={card.title}>
                  <span className='glory-info-card-number'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                </article>
              ))}
              </div>
            </div>
          </section>
        )}

        {page.sections?.length > 0 && (
          <section className='glory-info-content-section glory-info-detail-band'>
            <div className='glory-info-shell glory-info-section-list-v2'>
              {page.sections.map((section, index) => (
                <article className='glory-info-section-v2' key={section.title}>
                  <div>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h2>{section.title}</h2>
                  </div>
                  {section.body && <p>{section.body}</p>}
                  {section.items?.length > 0 && (
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>
                          <FiCheckCircle size={17} aria-hidden='true' />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

const InfoAction = ({ action, primary = false }) => {
  if (!action) return null

  const content = (
    <>
      {action.href && <FiMail size={17} />}
      {action.label}
      {!action.href && <FiArrowRight size={17} />}
    </>
  )

  const className = primary ? 'glory-info-action glory-info-action-primary' : 'glory-info-action'

  if (action.href) {
    return (
      <a className={className} href={action.href}>
        {content}
      </a>
    )
  }

  return (
    <Link className={className} to={action.to || '/'}>
      {content}
    </Link>
  )
}

export default InfoPage
