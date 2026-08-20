import { useNavigate, useParams } from 'react-router'
import { FiArrowLeft, FiArrowRight, FiGlobe } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MarketFlag from '../components/MarketFlag'
import { getComingSoonMarket } from '../data/markets'

const ComingSoonPage = () => {
  const navigate = useNavigate()
  const { marketSlug } = useParams()
  const destination = getComingSoonMarket(marketSlug)

  if (!destination) {
    return (
      <div className='glory-page'>
        <Navbar />
        <main className='glory-coming-page'>
          <FiGlobe size={30} aria-hidden='true' />
          <h1>That marketplace is not on our map yet.</h1>
          <button type='button' onClick={() => navigate('/')}><FiArrowLeft /> Back to Glory</button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className='glory-page'>
      <Navbar />
      <main className='glory-coming-page'>
        <MarketFlag market={destination} size={64} className='glory-coming-page-flag' />
        <p>Glory worldwide</p>
        <h1>{destination.name} is coming to Glory.</h1>
        <span>We are preparing local seller standards, pricing, payments and support before opening this marketplace.</span>
        <div className='glory-coming-page-actions'>
          <button type='button' className='is-primary' onClick={() => navigate('/register')}>
            Join Glory <FiArrowRight aria-hidden='true' />
          </button>
          <button type='button' onClick={() => navigate('/')}>
            <FiArrowLeft aria-hidden='true' /> Browse an open market
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ComingSoonPage
