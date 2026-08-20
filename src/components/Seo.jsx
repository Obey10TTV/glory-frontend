import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useMarket } from '../context/MarketContext'

const defaults = {
  title: 'Glory | Global Beauty Marketplace',
  description: 'Discover beauty products from reviewed independent sellers across Glory marketplaces.'
}

const pages = {
  '/': defaults,
  '/products': { title: 'Shop Beauty | Glory', description: 'Shop skincare, makeup, haircare, fragrance, nails and beauty essentials from reviewed independent sellers.' },
  '/about': { title: 'About Glory | Local Beauty Without Borders', description: 'Meet Glory, a global classified marketplace for independent beauty sellers and shoppers.' },
  '/sell-on-glory': { title: 'Sell Beauty Products on Glory', description: 'Create beauty listings on Glory with seller verification, evidence review and private buyer conversations.' },
  '/wishlist': { title: 'Your Wishlist | Glory', description: 'Return to the beauty products you saved on Glory.' },
  '/login': { title: 'Sign In | Glory', description: 'Securely sign in to your Glory buyer or seller account.' },
  '/register': { title: 'Create a Glory Account', description: 'Join Glory to shop reviewed beauty listings or start a verified seller profile.' },
  '/privacy': { title: 'Privacy Policy | Glory', description: 'Learn how Glory handles marketplace, account, seller and safety-report information.' },
  '/terms': { title: 'Terms & Conditions | Glory', description: 'Review the terms that apply when shopping or selling through Glory.' },
  '/cookies': { title: 'Cookie Policy | Glory', description: 'Review essential, analytics and marketing cookie choices on Glory.' },
  '/returns': { title: 'Seller Disputes | Glory', description: 'Understand how to resolve a concern with an independent seller and report a listing to Glory.' }
}

const setMeta = (selector, attribute, value) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    const [key, rawValue] = attribute.split('=')
    element.setAttribute(key, rawValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', value)
}

const applySeo = ({ title, description, image, canonical, type = 'website', robots = 'index,follow' }) => {
  document.title = title
  setMeta('meta[name="description"]', 'name=description', description)
  setMeta('meta[name="robots"]', 'name=robots', robots)
  setMeta('meta[property="og:title"]', 'property=og:title', title)
  setMeta('meta[property="og:description"]', 'property=og:description', description)
  setMeta('meta[property="og:type"]', 'property=og:type', type)
  setMeta('meta[property="og:url"]', 'property=og:url', canonical)
  setMeta('meta[name="twitter:card"]', 'name=twitter:card', image ? 'summary_large_image' : 'summary')
  if (image) {
    setMeta('meta[property="og:image"]', 'property=og:image', image)
  } else {
    document.head.querySelector('meta[property="og:image"]')?.remove()
  }
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = canonical
}

const SeoManager = () => {
  const location = useLocation()
  const { market } = useMarket()
  useEffect(() => {
    const marketHome = ['/', '/ng', '/gb', '/us', '/ca'].includes(location.pathname)
    const basePath = marketHome ? '/' : (location.pathname.startsWith('/brands/') ? '/products' : location.pathname)
    const basePage = pages[basePath] || (location.pathname.startsWith('/products/')
      ? { title: 'Beauty Product | Glory', description: defaults.description }
      : defaults)
    const page = marketHome
      ? {
          title: `Glory ${market.name} | Independent Beauty Marketplace`,
          description: `Discover beauty products and independent sellers in ${market.name}, with prices in ${market.currency}.`
        }
      : basePage
    const privatePage = ['/account', '/admin', '/seller', '/checkout', '/payment/verify'].some(path => location.pathname.startsWith(path))
    applySeo({
      ...page,
      canonical: `${window.location.origin}${location.pathname}`,
      robots: privatePage ? 'noindex,nofollow' : 'index,follow'
    })
  }, [location.pathname, market])
  return null
}

export const ProductSeo = ({ product }) => {
  useEffect(() => {
    if (!product) return undefined
    const canonical = `${window.location.origin}/products/${product._id}`
    applySeo({
      title: `${product.name} by ${product.brand} | Glory`,
      description: String(product.description || defaults.description).slice(0, 155),
      image: product.image,
      canonical,
      type: 'product'
    })
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.gloryProduct = product._id
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: [product.image, ...(product.images || [])].filter(Boolean),
      description: product.description,
      sku: product.sku || undefined,
      brand: { '@type': 'Brand', name: product.brand },
      aggregateRating: product.numReviews > 0 ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.numReviews } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: product.currency || 'GBP',
        price: product.price,
        availability: product.countInStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: canonical
      }
    })
    document.head.appendChild(script)
    return () => script.remove()
  }, [product])
  return null
}

export default SeoManager
