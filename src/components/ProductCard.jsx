import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { FiHeart, FiShoppingBag } from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'
import { isWishlisted, toggleWishlist } from '../utils/wishlist'

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [wished, setWished] = useState(() => isWishlisted(product._id))
  const [added, setAdded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWishlist = (e) => {
    e.stopPropagation()
    setWished(toggleWishlist(product._id))
  }

  return (
    <div
      className='glory-product-card'
      onClick={() => navigate(`/products/${product._id}`)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/products/${product._id}`)
        }
      }}
      role='button'
      tabIndex={0}
      style={{
        cursor: 'pointer',
        position: 'relative',
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '0.5px solid #f0f0f0',
      }}
    >
      <div className='glory-product-media' style={{
        width: '100%', aspectRatio: '3/4',
        background: '#fdf0f5', overflow: 'hidden',
        position: 'relative'
      }}>
        <img
          src={product.image}
          alt={product.name}
          loading='lazy'
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', display: 'block'
          }}
        />
        <button
          className='glory-icon-button'
          onClick={handleWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '32px', height: '32px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer'
          }}
        >
          <FiHeart
            size={14}
            style={{
              color: wished ? '#e74c3c' : '#aaa',
              fill: wished ? '#e74c3c' : 'none'
            }}
          />
        </button>
        <button
          className='glory-product-cta'
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to bag`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'absolute', bottom: '10px',
            left: '10px', right: '10px',
            background: added ? '#2ecc71' : hovered ? '#2ecc71' : '#111',
            color: '#fff', border: 'none',
            borderRadius: '999px', padding: '10px',
            fontSize: '11px', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            transition: 'background 0.25s ease'
          }}
        >
          <FiShoppingBag size={13} />
          {added ? 'Added!' : 'Add to Bag'}
        </button>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{
          fontSize: '9px', color: '#aaa',
          letterSpacing: '0.08em', marginBottom: '3px',
          fontWeight: '600', textTransform: 'uppercase'
        }}>
          {product.brand}
        </div>
        <div style={{
          fontSize: '13px', color: '#111',
          fontWeight: '500', marginBottom: '2px',
          lineHeight: '1.35'
        }}>
          {product.name}
        </div>
        <div style={{
          fontSize: '11px', color: '#999',
          marginBottom: '8px'
        }}>
          {product.category}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>
              {formatCurrency(product.price)}
            </strong>
            {product.compareAtPrice > product.price && (
              <span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          <div style={{
            fontSize: '11px', color: '#999'
          }}>
            Rated {Number(product.rating || 0).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
