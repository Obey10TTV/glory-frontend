// Glory Store v1.0
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'



// Pages
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import SellerDashboardPage from './pages/SellerDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AboutPage from './pages/AboutPage'
import InfoPage from './pages/InfoPage'
import WishlistPage from './pages/WishlistPage'
import PaymentVerifyPage from './pages/PaymentVerifyPage'
import ChatBot from './components/ChatBot'
import CookieConsent from './components/CookieConsent'
import ScrollToTop from './components/ScrollToTop'
import Loader from './components/Loader'
import { useUser } from './context/UserContext'
import { infoPageRoutes } from './data/infoPages'

const RequireAccess = ({ children, role }) => {
  const { user, authLoading } = useUser()
  const location = useLocation()

  if (authLoading) {
    return <div className='glory-route-loader'><Loader /></div>
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />
  }

  if (role === 'seller' && !user.isSeller && !user.isAdmin) {
    return <Navigate to='/account' replace />
  }

  if (role === 'admin' && !user.isAdmin) {
    return <Navigate to='/' replace />
  }

  return children
}

function App() {
  const { user } = useUser()

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/products' element={<ProductsPage />} />
        <Route path='/brands/:brand' element={<ProductsPage />} />
        <Route path='/products/:id' element={<ProductDetailPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
        <Route path='/checkout' element={<RequireAccess><CheckoutPage /></RequireAccess>} />
        <Route path='/payment/verify' element={<RequireAccess><PaymentVerifyPage /></RequireAccess>} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/account' element={<RequireAccess><AccountPage /></RequireAccess>} />
        <Route path='/seller' element={<RequireAccess role='seller'><SellerDashboardPage /></RequireAccess>} />
        <Route path='/admin' element={<RequireAccess role='admin'><AdminDashboardPage /></RequireAccess>} />
        <Route path='/about' element={<AboutPage />} />
        {infoPageRoutes.map((slug) => (
          <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
        ))}
      </Routes>
      {user && <ChatBot />}
      <CookieConsent />
    </Router>
  )
}

export default App
