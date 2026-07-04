import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { getProducts } from '../api'

const ProductsPage = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const categoryParam = queryParams.get('category') || ''

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState('all')

  const categories = [
    'All', 'Skincare', 'Haircare', 'Makeup', 'Nails',
    'Lashes', 'Body Care', 'Body Liquid', 'Fragrance',
    'Scented Candles', 'Tools & Accessories'
  ]

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under $25', value: '0-25' },
    { label: '$25 - $50', value: '25-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: 'Above $100', value: '100-999999' },
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts()
        setProducts(Array.isArray(data) ? data : [])
        setCatalogError('')
      } catch (error) {
        console.log(error)
        setCatalogError('We could not load the live product catalog. Please refresh or try again shortly.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  const filteredProducts = products
    .filter(p => !selectedCategory || selectedCategory === 'All' ? true : p.category === selectedCategory)
    .filter(p => {
      if (priceRange === 'all') return true
      const [min, max] = priceRange.split('-').map(Number)
      return p.price >= min && p.price <= max
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      return 0
    })

  return (
    <div className='glory-page' style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      <div className='glory-products-heading' style={{
        padding: '40px 40px 0',
        borderBottom: '0.5px solid #eee',
        background: '#fff'
      }}>
        <h1 style={{
          fontSize: '28px', fontWeight: '700',
          color: '#111', marginBottom: '20px'
        }}>
          {selectedCategory && selectedCategory !== 'All' ? selectedCategory : 'All Products'}
        </h1>

        <div className='glory-category-tabs' style={{
          display: 'flex', gap: '0',
          overflowX: 'auto', paddingBottom: '0'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
              style={{
                padding: '12px 20px',
                border: 'none', background: 'none',
                fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                color: (selectedCategory === cat || (cat === 'All' && !selectedCategory))
                  ? '#111' : '#888',
                borderBottom: (selectedCategory === cat || (cat === 'All' && !selectedCategory))
                  ? '2px solid #111' : '2px solid transparent',
                transition: 'all 0.2s',
                letterSpacing: '0.03em'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className='glory-products-layout' style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: '32px',
        padding: '32px 40px'
      }}>
        <div>
          <div className='glory-filter-panel' style={{
            background: '#fff', borderRadius: '14px',
            padding: '24px', border: '0.5px solid #eee',
            position: 'sticky', top: '80px'
          }}>
            <div style={{
              fontSize: '12px', fontWeight: '700',
              color: '#111', marginBottom: '20px',
              letterSpacing: '0.06em'
            }}>
              FILTERS
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '10px', fontWeight: '600',
                color: '#999', letterSpacing: '0.1em',
                marginBottom: '12px', textTransform: 'uppercase'
              }}>
                Price Range
              </div>
              {priceRanges.map(range => (
                <div
                  key={range.value}
                  onClick={() => setPriceRange(range.value)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: '10px', padding: '7px 0', cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '16px', height: '16px',
                    borderRadius: '50%',
                    border: `1.5px solid ${priceRange === range.value ? '#111' : '#ddd'}`,
                    background: priceRange === range.value ? '#111' : '#fff',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s'
                  }}>
                    {priceRange === range.value && (
                      <div style={{
                        width: '6px', height: '6px',
                        borderRadius: '50%', background: '#fff'
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: priceRange === range.value ? '#111' : '#666'
                  }}>
                    {range.label}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <div style={{
                fontSize: '10px', fontWeight: '600',
                color: '#999', letterSpacing: '0.1em',
                marginBottom: '12px', textTransform: 'uppercase'
              }}>
                Sort By
              </div>
              {[
                { label: 'Newest', value: 'newest' },
                { label: 'Price: Low to High', value: 'price-low' },
                { label: 'Price: High to Low', value: 'price-high' },
                { label: 'Top Rated', value: 'rating' },
              ].map(sort => (
                <div
                  key={sort.value}
                  onClick={() => setSortBy(sort.value)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: '10px', padding: '7px 0', cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '16px', height: '16px',
                    borderRadius: '50%',
                    border: `1.5px solid ${sortBy === sort.value ? '#111' : '#ddd'}`,
                    background: sortBy === sort.value ? '#111' : '#fff',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s'
                  }}>
                    {sortBy === sort.value && (
                      <div style={{
                        width: '6px', height: '6px',
                        borderRadius: '50%', background: '#fff'
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: sortBy === sort.value ? '#111' : '#666'
                  }}>
                    {sort.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px', color: '#888' }}>
              {filteredProducts.length} products found
            </div>
          </div>

          {loading ? <Loader /> : catalogError ? (
            <div className='glory-catalog-alert'>
              <strong>Catalog connection issue</strong>
              <span>{catalogError}</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 0',
              color: '#888', fontSize: '14px'
            }}>
              No products found in this category yet.
            </div>
          ) : (
            <div className='glory-product-grid' style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px'
            }}>
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductsPage
