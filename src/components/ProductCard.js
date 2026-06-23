import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { FiHeart, FiShoppingBag } from 'react-icons/fi'

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [wished, setWished] = useState(false)
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
    setWished(!wished)
  }

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '0.5px solid #f0f0f0',
      }}
    >
      <div style={{
        width: '100%', aspectRatio: '3/4',
        background: '#fdf0f5', overflow: 'hidden',
        position: 'relative'
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', display: 'block'
          }}
        />
        <button
          onClick={handleWishlist}
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
          onClick={handleAddToCart}
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
          <div style={{
            fontSize: '14px', fontWeight: '700', color: '#111'
          }}>
            ${product.price.toLocaleString()}
          </div>
          <div style={{
            fontSize: '11px', color: '#999'
          }}>
            ★ {product.rating.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard