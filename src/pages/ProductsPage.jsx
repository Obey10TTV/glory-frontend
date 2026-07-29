import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiX,
} from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { getProducts } from '../api'

const priceRanges = [
  { label: 'All prices', value: 'all' },
  { label: 'Under £25', value: '0-25' },
  { label: '£25 - £50', value: '25-50' },
  { label: '£50 - £100', value: '50-100' },
  { label: 'Above £100', value: '100-100000' },
]

const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
  { label: 'Top rated', value: 'rating' },
]

const ProductsPage = () => {
  const navigate = useNavigate()
  const { brand: brandRoute } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [facets, setFacets] = useState({ categories: [], brands: [] })
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') || '')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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
          limit: 24,
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

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileFiltersOpen])

  const submitSearch = (event) => {
    event.preventDefault()
    updateParam('q', searchDraft.trim())
  }

  const clearFilters = () => {
    setSearchDraft('')
    setMobileFiltersOpen(false)
    if (brandRoute) {
      navigate('/products')
      return
    }
    setSearchParams(new URLSearchParams())
  }

  const activeFilterCount = [
    category,
    query,
    brand,
    priceRange !== 'all' ? priceRange : '',
  ].filter(Boolean).length

  const pageTitle = brand || category || 'All beauty'

  return (
    <div className='glory-page glory-catalog-page glory-catalog-v2'>
      <Navbar />

      <header className='glory-catalog-hero'>
        <div className='glory-catalog-shell glory-catalog-hero-inner'>
          <div>
            <span className='glory-catalog-label'>Glory marketplace</span>
            <h1>{pageTitle}</h1>
            <p>
              {loading
                ? 'Loading the latest edit...'
                : `${pagination.total} product${pagination.total === 1 ? '' : 's'} from reviewed sellers.`}
            </p>
          </div>
          <form className='glory-catalog-search-v2' onSubmit={submitSearch} role='search'>
            <FiSearch size={19} aria-hidden='true' />
            <input
              value={searchDraft}
              onChange={event => setSearchDraft(event.target.value)}
              placeholder='Search products and brands'
              aria-label='Search products and brands'
            />
            {searchDraft && (
              <button
                className='glory-catalog-search-clear'
                type='button'
                onClick={() => setSearchDraft('')}
                aria-label='Clear search'
              >
                <FiX size={17} />
              </button>
            )}
            <button className='glory-catalog-search-submit' type='submit'>Search</button>
          </form>
        </div>
      </header>

      <nav className='glory-category-rail' aria-label='Product categories'>
        <div className='glory-catalog-shell'>
          <button className={!category ? 'active' : ''} onClick={() => updateParam('category', '')}>All beauty</button>
          {facets.categories.map(item => (
            <button key={item} className={category === item ? 'active' : ''} onClick={() => updateParam('category', item)}>
              {item}
            </button>
          ))}
        </div>
      </nav>

      <main className='glory-catalog-shell glory-catalog-body'>
        <div className='glory-catalog-mobile-tools'>
          <button type='button' onClick={() => setMobileFiltersOpen(true)}>
            <FiSliders size={17} />
            Filters
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
          <label>
            <span className='sr-only'>Sort products</span>
            <select value={sort} onChange={event => updateParam('sort', event.target.value)}>
              {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {mobileFiltersOpen && (
          <button
            type='button'
            className='glory-catalog-filter-scrim'
            onClick={() => setMobileFiltersOpen(false)}
            aria-label='Close filters'
          />
        )}

        <aside className={`glory-catalog-filter-panel ${mobileFiltersOpen ? 'is-open' : ''}`}>
          <div className='glory-catalog-filter-heading'>
            <div>
              <span>Refine</span>
              <strong>Filters</strong>
            </div>
            <button type='button' onClick={() => setMobileFiltersOpen(false)} aria-label='Close filters'>
              <FiX size={20} />
            </button>
          </div>

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

          <button type='button' className='glory-catalog-reset' onClick={clearFilters} disabled={activeFilterCount === 0}>
            <FiRefreshCw size={15} />
            Clear filters
          </button>
        </aside>

        <section className='glory-catalog-results-v2' aria-busy={loading}>
          <div className='glory-catalog-results-bar'>
            <span>
              {loading ? 'Preparing products' : `Showing ${products.length} of ${pagination.total}`}
            </span>
            {activeFilterCount > 0 && (
              <button type='button' onClick={clearFilters}>Clear all</button>
            )}
          </div>

          {loading ? <Loader /> : catalogError ? (
            <div className='glory-catalog-alert glory-catalog-alert-v2'>
              <FiRefreshCw size={23} aria-hidden='true' />
              <strong>Catalogue connection issue</strong>
              <span>{catalogError}</span>
            </div>
          ) : products.length === 0 ? (
            <div className='glory-catalog-empty-v2'>
              <strong>No matches in this edit.</strong>
              <span>Try removing a filter or searching for another product.</span>
              <button type='button' onClick={clearFilters}>Reset catalogue</button>
            </div>
          ) : (
            <div className='glory-product-grid glory-catalog-product-grid'>
              {products.map(product => <ProductCard key={product._id} product={product} />)}
            </div>
          )}

          {pagination.pages > 1 && (
            <nav className='glory-pagination-v2' aria-label='Catalogue pages'>
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
                aria-label='Previous page'
              >
                <FiChevronLeft size={17} />
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => updateParam('page', String(page + 1))}
                aria-label='Next page'
              >
                <FiChevronRight size={17} />
              </button>
            </nav>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ProductsPage
