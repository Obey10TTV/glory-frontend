import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { getProducts } from '../api'

const priceRanges = [
  { label: 'All prices', value: 'all' },
  { label: 'Under $25', value: '0-25' },
  { label: '$25 - $50', value: '25-50' },
  { label: '$50 - $100', value: '50-100' },
  { label: 'Above $100', value: '100-100000' }
]

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
  { label: 'Top rated', value: 'rating' }
]

const ProductsPage = () => {
  const { brand: brandRoute } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [facets, setFacets] = useState({ categories: [], brands: [] })
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') || '')

  const category = searchParams.get('category') || ''
  const query = searchParams.get('q') || ''
  const brand = brandRoute ? decodeURIComponent(brandRoute) : (searchParams.get('brand') || '')
  const priceRange = searchParams.get('price') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  useEffect(() => {
    let active = true
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const [minPrice, maxPrice] = priceRange === 'all' ? [] : priceRange.split('-')
        const { data } = await getProducts({
          meta: 'true',
          q: query || undefined,
          category: category || undefined,
          brand: brand || undefined,
          minPrice,
          maxPrice,
          sort,
          page,
          limit: 24
        })
        if (!active) return
        setProducts(data.items || [])
        setFacets(data.facets || { categories: [], brands: [] })
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
        setCatalogError('')
      } catch (error) {
        if (active) setCatalogError('We could not load the live product catalogue. Please try again shortly.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchProducts()
    return () => { active = false }
  }, [brand, category, page, priceRange, query, sort])

  const submitSearch = (event) => {
    event.preventDefault()
    updateParam('q', searchDraft.trim())
  }

  const pageTitle = brand || category || 'All beauty'

  return (
    <div className='glory-page glory-catalog-page'>
      <Navbar />
      <header className='glory-catalog-header'>
        <div>
          <span>Shop Glory</span>
          <h1>{pageTitle}</h1>
          <p>{pagination.total} product{pagination.total === 1 ? '' : 's'} from reviewed sellers.</p>
        </div>
        <form className='glory-catalog-search' onSubmit={submitSearch} role='search'>
          <FiSearch size={18} />
          <input
            value={searchDraft}
            onChange={event => setSearchDraft(event.target.value)}
            placeholder='Search products and brands'
            aria-label='Search products and brands'
          />
          <button type='submit'>Search</button>
        </form>
      </header>

      <nav className='glory-category-tabs' aria-label='Product categories'>
        <button className={!category ? 'active' : ''} onClick={() => updateParam('category', '')}>All</button>
        {facets.categories.map(item => (
          <button key={item} className={category === item ? 'active' : ''} onClick={() => updateParam('category', item)}>
            {item}
          </button>
        ))}
      </nav>

      <main className='glory-catalog-layout'>
        <aside className='glory-catalog-filters'>
          <label>
            <span>Price</span>
            <select value={priceRange} onChange={event => updateParam('price', event.target.value)}>
              {priceRanges.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {!brandRoute && (
            <label>
              <span>Brand</span>
              <select value={brand} onChange={event => updateParam('brand', event.target.value)}>
                <option value=''>All brands</option>
                {facets.brands.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          )}
          <label>
            <span>Sort</span>
            <select value={sort} onChange={event => updateParam('sort', event.target.value)}>
              {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </aside>

        <section className='glory-catalog-results' aria-busy={loading}>
          {loading ? <Loader /> : catalogError ? (
            <div className='glory-catalog-alert'><strong>Catalogue connection issue</strong><span>{catalogError}</span></div>
          ) : products.length === 0 ? (
            <div className='glory-catalog-empty'>No products match these filters yet.</div>
          ) : (
            <div className='glory-product-grid'>
              {products.map(product => <ProductCard key={product._id} product={product} />)}
            </div>
          )}

          {pagination.pages > 1 && (
            <nav className='glory-pagination' aria-label='Catalogue pages'>
              <button disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}>Previous</button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => updateParam('page', String(page + 1))}>Next</button>
            </nav>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default ProductsPage
