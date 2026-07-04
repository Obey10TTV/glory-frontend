import { Link, Navigate } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle, FiMail } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { infoPages } from '../data/infoPages'

const InfoPage = ({ slug }) => {
  const page = infoPages[slug]

  if (!page) {
    return <Navigate to='/' replace />
  }

  return (
    <div className='glory-page glory-info-page'>
      <Navbar />

      <main>
        <section className='glory-info-hero'>
          <div className='glory-section-inner glory-info-hero-inner'>
            <span className='glory-info-eyebrow'>{page.eyebrow || page.group}</span>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <div className='glory-info-actions'>
              <InfoAction action={page.primaryAction} primary />
              <InfoAction action={page.secondaryAction} />
            </div>
          </div>
        </section>

        {page.cards?.length > 0 && (
          <section className='glory-section'>
            <div className='glory-section-inner glory-info-card-grid'>
              {page.cards.map((card) => (
                <article className='glory-info-card' key={card.title}>
                  <span>
                    <FiCheckCircle size={20} />
                  </span>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {page.sections?.length > 0 && (
          <section className='glory-section-tight'>
            <div className='glory-section-inner glory-info-section-list'>
              {page.sections.map((section) => (
                <article className='glory-info-section' key={section.title}>
                  <div>
                    <span>{page.group}</span>
                    <h2>{section.title}</h2>
                  </div>
                  {section.body && <p>{section.body}</p>}
                  {section.items?.length > 0 && (
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
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
