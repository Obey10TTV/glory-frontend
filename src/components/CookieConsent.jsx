import { useState } from 'react'
import { FiShield, FiSliders, FiX } from 'react-icons/fi'

const STORAGE_KEY = 'gloryCookieConsent'

const readSavedConsent = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    return null
  }
}

const saveConsent = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch (error) {
    // The banner can disappear even if private browsing blocks localStorage.
  }
}

const CookieConsent = () => {
  const [saved, setSaved] = useState(readSavedConsent)
  const [expanded, setExpanded] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  if (saved) return null

  const accept = (value) => {
    const payload = JSON.stringify({
      preference: value,
      analytics: value === 'all' ? true : analyticsEnabled && value === 'custom',
      savedAt: new Date().toISOString(),
    })
    saveConsent(payload)
    setSaved(payload)
  }

  return (
    <div className='glory-cookie-card' role='dialog' aria-live='polite' aria-label='Cookie preferences'>
      <button
        className='glory-cookie-close'
        type='button'
        aria-label='Close cookie preferences'
        onClick={() => accept('essential')}
      >
        <FiX size={16} />
      </button>

      <div className='glory-cookie-icon' aria-hidden='true'>
        <FiShield size={18} />
      </div>

      <div className='glory-cookie-copy'>
        <strong>Your privacy on Glory</strong>
        <p>
          We use essential storage for cart, login and security. You can allow optional analytics to help us improve the store experience.
        </p>
      </div>

      {expanded && (
        <div className='glory-cookie-settings'>
          <label>
            <span>
              <b>Essential</b>
              <small>Required for secure checkout, account sessions and cart.</small>
            </span>
            <input type='checkbox' checked readOnly />
          </label>
          <label>
            <span>
              <b>Analytics</b>
              <small>Helps us understand shopping journeys without selling personal data.</small>
            </span>
            <input
              type='checkbox'
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
          </label>
        </div>
      )}

      <div className='glory-cookie-actions'>
        <button type='button' className='glory-cookie-secondary' onClick={() => setExpanded(!expanded)}>
          <FiSliders size={15} />
          {expanded ? 'Hide' : 'Settings'}
        </button>
        <button type='button' className='glory-cookie-secondary' onClick={() => accept('essential')}>
          Essential only
        </button>
        <button type='button' className='glory-cookie-primary' onClick={() => accept(expanded ? 'custom' : 'all')}>
          {expanded ? 'Save' : 'Accept all'}
        </button>
      </div>
    </div>
  )
}

export default CookieConsent
