import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  ACTIVE_MARKETS,
  DEFAULT_MARKET_CODE,
  MARKET_STORAGE_KEY,
  getMarket,
  getMarketFromPath
} from '../data/markets'

const MarketContext = createContext(null)

const readSavedMarket = () => {
  if (typeof window === 'undefined') return DEFAULT_MARKET_CODE
  const saved = window.localStorage.getItem(MARKET_STORAGE_KEY)
  return ACTIVE_MARKETS[saved] ? saved : DEFAULT_MARKET_CODE
}

export const MarketProvider = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const pathMarket = getMarketFromPath(location.pathname)
  const [marketCode, setMarketCode] = useState(() => pathMarket?.code || readSavedMarket())

  useEffect(() => {
    if (pathMarket && pathMarket.code !== marketCode) setMarketCode(pathMarket.code)
  }, [pathMarket, marketCode])

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEY, marketCode)
    document.documentElement.dataset.gloryMarket = marketCode.toLowerCase()
  }, [marketCode])

  const selectMarket = (nextCode, { navigateHome = true } = {}) => {
    const next = getMarket(nextCode)
    setMarketCode(next.code)
    if (navigateHome) navigate(`/${next.slug}`)
  }

  const value = useMemo(() => ({
    market: getMarket(marketCode),
    marketCode,
    markets: Object.values(ACTIVE_MARKETS),
    selectMarket
  }), [marketCode])

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
}

export const useMarket = () => {
  const context = useContext(MarketContext)
  if (!context) throw new Error('useMarket must be used inside MarketProvider')
  return context
}
