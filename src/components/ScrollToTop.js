import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType === 'POP') return

    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [hash, navigationType, pathname, search])

  return null
}

export default ScrollToTop
