// Glory Store v1.0
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'



// Pages (we'll create these next)
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/products' element={<ProductsPage />} />
        <Route path='/products/:id' element={<ProductDetailPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/account' element={<AccountPage />} />
        <Route path='/seller' element={<SellerDashboardPage />} />
        <Route path='/admin' element={<AdminDashboardPage />} />
        <Route path='/about' element={<AboutPage />} />
      </Routes>
    </Router>
  )
}

export default App