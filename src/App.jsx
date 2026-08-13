import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router'
import './App.css'
import CookieConsent from './components/CookieConsent'
import ScrollToTop from './components/ScrollToTop'
import Loader from './components/Loader'
import SeoManager from './components/Seo'
import { useUser } from './context/UserContext'
import { infoPageRoutes } from './data/infoPages'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const SellerDashboardPage = lazy(() => import('./pages/SellerDashboardPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const InfoPage = lazy(() => import('./pages/InfoPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const ChatBot = lazy(() => import('./components/ChatBot'))

const RequireAccess = ({ children, role }) => {
  const { user, authLoading } = useUser()
  const location = useLocation()
  if (authLoading) return <div className='glory-route-loader'><Loader /></div>
  if (!user) return <Navigate to='/login' replace state={{ from: location.pathname }} />
  if (role === 'seller' && !user.isSeller && !user.isAdmin) return <Navigate to='/account' replace />
  if (role === 'admin' && !user.isAdmin) return <Navigate to='/' replace />
  return children
}

function App() {
  const { user } = useUser()
  const focusMainContent = (event) => {
    event.preventDefault()
    const target = document.querySelector('main, [role="main"], .glory-container')
      || document.getElementById('glory-main')
    if (target) {
      target.setAttribute('tabindex', '-1')
      target.focus()
    }
  }
  return (
    <Router>
      <a className='glory-skip-link' href='#glory-main' onClick={focusMainContent}>Skip to main content</a>
      <ScrollToTop />
      <SeoManager />
      <div id='glory-main' tabIndex='-1'>
        <Suspense fallback={<div className='glory-route-loader'><Loader /></div>}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/products' element={<ProductsPage />} />
            <Route path='/brands/:brand' element={<ProductsPage />} />
            <Route path='/products/:id' element={<ProductDetailPage />} />
            <Route path='/cart' element={<Navigate to='/products' replace />} />
            <Route path='/wishlist' element={<WishlistPage />} />
            <Route path='/checkout' element={<Navigate to='/products' replace />} />
            <Route path='/payment/verify' element={<Navigate to='/products' replace />} />
            <Route path='/messages' element={<RequireAccess><MessagesPage /></RequireAccess>} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/account' element={<RequireAccess><AccountPage /></RequireAccess>} />
            <Route path='/seller' element={<RequireAccess role='seller'><SellerDashboardPage /></RequireAccess>} />
            <Route path='/admin' element={<RequireAccess role='admin'><AdminDashboardPage /></RequireAccess>} />
            <Route path='/about' element={<AboutPage />} />
            {infoPageRoutes.map(slug => <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />)}
          </Routes>
        </Suspense>
      </div>
      {user && <Suspense fallback={null}><ChatBot /></Suspense>}
      <CookieConsent />
    </Router>
  )
}

export default App
