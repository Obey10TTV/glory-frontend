import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { FiArrowRight, FiCheck, FiSearch, FiX } from 'react-icons/fi'
import { COMING_SOON_MARKETS } from '../data/markets'
import { useMarket } from '../context/MarketContext'
import MarketFlag from './MarketFlag'

const MarketSelector = ({ open, onClose }) => {
  const navigate = useNavigate()
  const { market, markets, selectMarket } = useMarket()
  const [query, setQuery] = useState('')
  const dialogRef = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    setQuery('')
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    const initialFocus = window.setTimeout(() => dialogRef.current?.querySelector('button')?.focus(), 0)
    return () => {
      window.clearTimeout(initialFocus)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open])

  const normalizedQuery = query.trim().toLowerCase()
  const liveMarkets = markets.filter((item) => [item.name, item.shortName, item.code, item.currency]
    .some(value => value?.toLowerCase().includes(normalizedQuery)))
  const comingByRegion = useMemo(() => COMING_SOON_MARKETS
    .filter((item) => item.name.toLowerCase().includes(normalizedQuery))
    .reduce((groups, item) => {
      groups[item.region] = [...(groups[item.region] || []), item]
      return groups
    }, {}), [normalizedQuery])

  if (!open) return null

  const chooseLiveMarket = (code) => {
    onClose()
    selectMarket(code)
  }

  const chooseComingMarket = (slug) => {
    onClose()
    navigate(`/coming-soon/${slug}`)
  }

  return (
    <div className='glory-market-overlay' role='presentation' onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section
        ref={dialogRef}
        className='glory-market-dialog'
        role='dialog'
        aria-modal='true'
        aria-labelledby='glory-market-title'
        aria-describedby='glory-market-description'
      >
        <header className='glory-market-dialog-header'>
          <div>
            <h2 id='glory-market-title'>Choose your marketplace</h2>
            <p id='glory-market-description'>Browse local beauty listings and prices in your currency.</p>
          </div>
          <button type='button' className='glory-market-close' onClick={onClose} aria-label='Close country selector'>
            <FiX size={22} aria-hidden='true' />
          </button>
        </header>

        <label className='glory-market-search'>
          <FiSearch size={18} aria-hidden='true' />
          <span className='sr-only'>Search countries</span>
          <input type='search' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search countries' />
        </label>

        <div className='glory-market-dialog-body'>
          {liveMarkets.length > 0 && <section className='glory-market-live' aria-labelledby='glory-live-markets'>
            <div className='glory-market-section-title'>
              <h3 id='glory-live-markets'>Available now</h3>
            </div>
            <div className='glory-market-live-grid'>
              {liveMarkets.map((item) => (
                <button
                  type='button'
                  key={item.code}
                  className={item.code === market.code ? 'is-current' : ''}
                  onClick={() => chooseLiveMarket(item.code)}
                  aria-current={item.code === market.code ? 'true' : undefined}
                >
                  <MarketFlag market={item} size={36} />
                  <span className='glory-market-option-copy'><strong>{item.name}</strong><small>{item.currency} · {item.currencyName}</small></span>
                  <span className='glory-market-option-icon' aria-hidden='true'>
                    {item.code === market.code ? <FiCheck size={17} /> : <FiArrowRight size={17} />}
                  </span>
                </button>
              ))}
            </div>
          </section>}

          {Object.keys(comingByRegion).length > 0 && <section className='glory-market-coming' aria-labelledby='glory-coming-markets'>
            <div className='glory-market-section-title'>
              <h3 id='glory-coming-markets'>Coming soon</h3>
            </div>
            <div className='glory-market-coming-groups'>
              {Object.entries(comingByRegion).map(([region, items]) => (
                <div key={region}>
                  <h4>{region}</h4>
                  {items.map((item) => (
                    <button type='button' key={item.code} onClick={() => chooseComingMarket(item.slug)}>
                      <MarketFlag market={item} size={25} />
                      <span>{item.name}</span>
                      <FiArrowRight size={15} aria-hidden='true' />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>}
          {liveMarkets.length === 0 && Object.keys(comingByRegion).length === 0 && (
            <p className='glory-market-empty' role='status'>No Glory marketplace matches that search yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default MarketSelector
