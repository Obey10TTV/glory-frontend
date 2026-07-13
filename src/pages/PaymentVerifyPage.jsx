import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiRefreshCw, FiXCircle } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { verifyPayment } from '../api'
import { useCart } from '../context/CartContext'

const PaymentVerifyPage = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [state, setState] = useState({ status: 'loading', message: 'Confirming your payment securely...' })

  useEffect(() => {
    const reference = params.get('reference') || params.get('trxref')
    if (!reference) {
      setState({ status: 'error', message: 'The payment reference is missing.' })
      return
    }

    verifyPayment(reference)
      .then(({ data }) => {
        if (data.data?.status !== 'success') {
          throw new Error('Payment has not been confirmed.')
        }
        clearCart()
        setState({ status: 'success', message: 'Payment confirmed. Your order is now being processed.' })
      })
      .catch((error) => {
        setState({
          status: 'error',
          message: error.response?.data?.message || error.message || 'Payment verification failed.'
        })
      })
  }, [params, clearCart])

  return (
    <div className='glory-page'>
      <Navbar />
      <main className='glory-payment-result'>
        {state.status === 'loading' && <FiRefreshCw className='is-spinning' size={34} />}
        {state.status === 'success' && <FiCheckCircle size={38} />}
        {state.status === 'error' && <FiXCircle size={38} />}
        <h1>{state.status === 'success' ? 'Payment confirmed' : state.status === 'error' ? 'Payment needs attention' : 'Checking payment'}</h1>
        <p>{state.message}</p>
        <button type='button' onClick={() => navigate(state.status === 'success' ? '/account' : '/cart')}>
          {state.status === 'success' ? 'View my orders' : 'Return to bag'}
        </button>
      </main>
      <Footer />
    </div>
  )
}

export default PaymentVerifyPage
