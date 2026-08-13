import { useEffect, useRef, useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { getAuthOptions } from '../api'

const GOOGLE_SCRIPT_ID = 'glory-google-identity'
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const buildClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

const loadGoogleIdentity = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) {
    resolve(window.google)
    return
  }

  const existing = document.getElementById(GOOGLE_SCRIPT_ID)
  if (existing) {
    existing.addEventListener('load', () => resolve(window.google), { once: true })
    existing.addEventListener('error', () => reject(new Error('Google sign-in could not load.')), { once: true })
    return
  }

  const script = document.createElement('script')
  script.id = GOOGLE_SCRIPT_ID
  script.src = GOOGLE_SCRIPT_URL
  script.async = true
  script.defer = true
  script.onload = () => resolve(window.google)
  script.onerror = () => reject(new Error('Google sign-in could not load.'))
  document.head.appendChild(script)
})

const GoogleSignInButton = ({
  onCredential,
  onError,
  disabled = false,
  text = 'continue_with'
}) => {
  const buttonRef = useRef(null)
  const credentialHandlerRef = useRef(onCredential)
  const errorHandlerRef = useRef(onError)
  const [ready, setReady] = useState(false)
  const [configuration, setConfiguration] = useState(() => (
    buildClientId
      ? { status: 'ready', clientId: buildClientId }
      : { status: 'loading', clientId: '' }
  ))

  credentialHandlerRef.current = onCredential
  errorHandlerRef.current = onError

  useEffect(() => {
    if (buildClientId) return undefined

    let active = true
    getAuthOptions()
      .then(({ data }) => {
        const clientId = String(data?.google?.clientId || '').trim()
        if (!active) return
        setConfiguration(clientId && data?.google?.enabled
          ? { status: 'ready', clientId }
          : { status: 'unavailable', clientId: '' })
      })
      .catch(() => {
        if (active) setConfiguration({ status: 'unavailable', clientId: '' })
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    const clientId = configuration.clientId
    if (configuration.status !== 'ready' || !clientId || !buttonRef.current) {
      return undefined
    }

    let active = true
    setReady(false)

    loadGoogleIdentity()
      .then((google) => {
        if (!active || !buttonRef.current || !google?.accounts?.id) return

        google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          callback: (response) => {
            if (response?.credential) {
              credentialHandlerRef.current?.(response.credential)
            } else {
              errorHandlerRef.current?.('Google did not return a verified credential.')
            }
          }
        })

        const width = Math.min(
          400,
          Math.max(200, Math.floor(buttonRef.current.getBoundingClientRect().width))
        )
        buttonRef.current.replaceChildren()
        google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'left',
          width
        })
        setReady(true)
      })
      .catch((error) => {
        if (active) {
          setConfiguration({ status: 'unavailable', clientId: '' })
          errorHandlerRef.current?.(error.message)
        }
      })

    return () => { active = false }
  }, [configuration, text])

  const label = text === 'signup_with' ? 'Sign up with Google' : 'Continue with Google'
  if (configuration.status === 'unavailable') {
    return (
      <button
        type='button'
        className='glory-google-auth-fallback'
        disabled={disabled}
        onClick={() => errorHandlerRef.current?.(
          'Google sign-in is temporarily unavailable. You can continue securely with email and a one-time verification code.'
        )}
      >
        <FcGoogle size={20} aria-hidden='true' />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div
      className={`glory-google-auth ${disabled ? 'is-disabled' : ''} ${ready ? 'is-ready' : ''}`}
      aria-busy={configuration.status === 'loading' || !ready}
      style={disabled ? { pointerEvents: 'none', opacity: 0.55 } : undefined}
    >
      <div ref={buttonRef} />
      {!ready && <span>{configuration.status === 'loading' ? 'Checking Google sign-in...' : 'Loading Google sign-in...'}</span>}
    </div>
  )
}

export default GoogleSignInButton
