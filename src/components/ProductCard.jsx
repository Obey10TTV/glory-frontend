import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi'
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
    if (product.variants?.length) {
      navigate(`/products/${product._id}`)
      return
    }
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
          width='600'
          height='800'
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
          {product.variants?.length ? 'Select options' : added ? 'Added!' : 'Add to Bag'}
        </button>
      </div>
      <div className='glory-product-card-content' style={{ padding: '12px 14px' }}>
        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/brands/${encodeURIComponent(product.brand)}`)
          }}
          className='glory-product-brand-link'
          style={{
          fontSize: '9px', color: '#aaa',
          letterSpacing: '0.08em', marginBottom: '3px',
          fontWeight: '600', textTransform: 'uppercase'
        }}>
          {product.brand}
        </button>
        <div className='glory-product-card-name' style={{
          fontSize: '13px', color: '#111',
          fontWeight: '500', marginBottom: '2px',
          lineHeight: '1.35'
        }}>
          {product.name}
        </div>
        <div className='glory-product-card-category' style={{
          fontSize: '11px', color: '#999',
          marginBottom: '8px'
        }}>
          {product.category}
        </div>
        <div className='glory-product-card-footer' style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div className='glory-product-card-prices' style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>
              {formatCurrency(product.price)}
            </strong>
            {product.compareAtPrice > product.price && (
              <span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          {Number(product.numReviews || 0) > 0 ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', color: '#68615d'
            }}>
              <FiStar size={11} fill='currentColor' aria-hidden='true' />
              <span>{Number(product.rating || 0).toFixed(1)}</span>
              <span className='sr-only'>out of 5 stars</span>
            </div>
          ) : (
            <div style={{
              fontSize: '10px', color: '#8f2648',
              fontWeight: '700', textTransform: 'uppercase'
            }}>
              New
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
