import { useEffect, useRef, useState } from 'react'

const GOOGLE_SCRIPT_ID = 'glory-google-identity'
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

export const googleAuthConfigured = Boolean(
  String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
)

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

  credentialHandlerRef.current = onCredential
  errorHandlerRef.current = onError

  useEffect(() => {
    const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
    if (!clientId || !buttonRef.current) {
      return undefined
    }

    let active = true

    loadGoogleIdentity()
      .then((google) => {
        if (!active || !buttonRef.current || !google?.accounts?.id) {
          return
        }

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
          Math.max(240, Math.floor(buttonRef.current.getBoundingClientRect().width))
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
          errorHandlerRef.current?.(error.message)
        }
      })

    return () => {
      active = false
    }
  }, [text])

  if (!googleAuthConfigured) {
    return null
  }

  return (
    <div
      className={`glory-google-auth ${disabled ? 'is-disabled' : ''} ${ready ? 'is-ready' : ''}`}
      aria-busy={!ready}
    >
      <div ref={buttonRef} />
      {!ready && <span>Loading Google sign-in...</span>}
    </div>
  )
}

export default GoogleSignInButton
