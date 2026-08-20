import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useUser } from '../context/UserContext'
import {
  authenticateWithGoogle,
  linkGoogleAccount,
  loginUser,
  resendVerificationOtp,
  verifyEmailOtp,
  verifyLoginTwoFactor
} from '../api'
import Message from '../components/Message'
import { FiEye, FiEyeOff, FiRefreshCw, FiShield } from 'react-icons/fi'
import GoogleSignInButton from '../components/GoogleSignInButton'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [useEmail, setUseEmail] = useState(false)
  const [pendingAuth, setPendingAuth] = useState(null)
  const [pendingGoogleLink, setPendingGoogleLink] = useState(null)
  const [googleCredential, setGoogleCredential] = useState('')
  const [linkPassword, setLinkPassword] = useState('')
  const [showLinkPassword, setShowLinkPassword] = useState(false)
  const [otp, setOtp] = useState('')

  const finishLogin = (data) => {
    login(data)
    navigate('/')
  }

  const handleAuthResponse = (data, source = 'email') => {
    if (data.requiresTwoFactor) {
      setPendingAuth({ type: '2fa', email: data.email, source })
      setPendingGoogleLink(null)
      setUseEmail(true)
      setSuccess(data.message || 'Enter the verification code sent to your email.')
      return
    }

    if (data.requiresEmailVerification) {
      setPendingAuth({ type: 'email', email: data.email, source: 'email' })
      setSuccess(data.message || 'Verify your email before signing in.')
      return
    }

    finishLogin(data)
  }

  const handleGoogleCredential = async (credential) => {
    setGoogleCredential(credential)
    setLoading(true)
    setError('')
    setSuccess('')
    setOtp('')

    try {
      const { data } = await authenticateWithGoogle({ credential })
      handleAuthResponse(data, 'google')
    } catch (err) {
      const data = err.response?.data
      if (data?.requiresGoogleLink) {
        setPendingGoogleLink({ credential, email: data.email })
        setUseEmail(true)
        setSuccess(data.message)
      } else {
        setError(data?.message || 'Google sign-in could not be completed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLink = async (event) => {
    event.preventDefault()
    if (!pendingGoogleLink?.credential || !linkPassword) {
      setError('Enter the password for your existing Glory account.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data } = await linkGoogleAccount({
        credential: pendingGoogleLink.credential,
        password: linkPassword
      })
      handleAuthResponse(data, 'google')
    } catch (err) {
      setError(err.response?.data?.message || 'Google account linking could not be completed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setOtp('')

    try {
      const { data } = await loginUser({ email, password })
      handleAuthResponse(data, 'email')
    } catch (err) {
      const data = err.response?.data
      if (data?.requiresEmailVerification) {
        setPendingAuth({ type: 'email', email: data.email, source: 'email' })
        setSuccess(data.message || 'Verify your email before signing in.')
      } else {
        setError(data?.message || 'Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!pendingAuth?.email) {
      setError('Please sign in again so we know which account to verify.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = { email: pendingAuth.email, otp }
      const { data } = pendingAuth.type === '2fa'
        ? await verifyLoginTwoFactor(payload)
        : await verifyEmailOtp(payload)

      finishLogin(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!pendingAuth?.email) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (pendingAuth.type === '2fa' && pendingAuth.source === 'google' && !googleCredential) {
        throw new Error('Start Google sign-in again to request a new code.')
      }

      const { data } = pendingAuth.type === '2fa' && pendingAuth.source === 'google'
        ? await authenticateWithGoogle({ credential: googleCredential })
        : pendingAuth.type === '2fa'
          ? await loginUser({ email: pendingAuth.email, password })
          : await resendVerificationOtp({ email: pendingAuth.email })

      handleAuthResponse(data, pendingAuth.source)
      setSuccess(data.message || 'A new code has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not send a new code')
    } finally {
      setLoading(false)
    }
  }

  const verificationCodeValid = /^\d{6}$/.test(otp)
    || (pendingAuth?.type === '2fa' && /^[A-F0-9]{6}-[A-F0-9]{6}$/.test(otp))

  return (
    <div className='glory-auth-page glory-login-page' style={pageStyle}>
      <div className='glory-auth-card' style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <Link to='/' style={logoStyle}>
            GLORY.
          </Link>
        </div>
        <div style={subtitleStyle}>
          {pendingAuth
            ? 'Security check'
            : pendingGoogleLink
              ? 'Link your existing account'
              : 'Welcome back'}
        </div>

        {error && <Message type='error' text={error} />}
        {success && <Message type='success' text={success} />}

        {!useEmail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <GoogleSignInButton
              disabled={loading}
              onCredential={handleGoogleCredential}
              onError={setError}
            />
            <Divider text='or use email' />

            <button
              onClick={() => setUseEmail(true)}
              className='glory-btn'
              style={{ width: '100%', padding: '13px', fontSize: '13px' }}
            >
              Continue with Email
            </button>
          </div>
        ) : pendingAuth ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={securityPanelStyle}>
              <FiShield size={24} style={{ color: '#111' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>
                  {pendingAuth.type === '2fa' ? 'Two-factor authentication' : 'Email verification required'}
                </div>
                <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.6', marginTop: '4px' }}>
                  Enter the 6-digit code sent to {pendingAuth.email}
                  {pendingAuth.type === '2fa' ? ' or use one recovery code.' : '.'}
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Verification code</label>
              <input
                type='text'
                inputMode={pendingAuth.type === '2fa' ? 'text' : 'numeric'}
                autoComplete='one-time-code'
                maxLength={pendingAuth.type === '2fa' ? 13 : 6}
                value={otp}
                onChange={e => setOtp(
                  pendingAuth.type === '2fa'
                    ? e.target.value.toUpperCase().replace(/[^A-F0-9-]/g, '').slice(0, 13)
                    : e.target.value.replace(/\D/g, '').slice(0, 6)
                )}
                placeholder={pendingAuth.type === '2fa' ? '000000 or XXXXXX-XXXXXX' : '000000'}
                style={{ ...inputStyle, letterSpacing: '0.18em', textAlign: 'center', fontSize: '16px' }}
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || !verificationCodeValid}
              className='glory-btn'
              style={{ width: '100%', padding: '13px', fontSize: '13px', opacity: loading || !verificationCodeValid ? 0.7 : 1 }}
            >
              {loading ? 'Checking...' : 'Verify Code'}
            </button>

            <button
              onClick={handleResendCode}
              disabled={loading}
              style={textButtonStyle}
            >
              <FiRefreshCw size={14} />
              Send a new code
            </button>

            <button
              onClick={() => {
                const returnToOptions = pendingAuth.source === 'google'
                setPendingAuth(null)
                setOtp('')
                setSuccess('')
                if (returnToOptions) {
                  setUseEmail(false)
                }
              }}
              style={plainButtonStyle}
            >
              Back to sign in
            </button>
          </div>
        ) : pendingGoogleLink ? (
          <form onSubmit={handleGoogleLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={securityPanelStyle}>
              <FiShield size={24} style={{ color: '#111' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>
                  Protecting your existing account
                </div>
                <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.6', marginTop: '4px' }}>
                  Google verified {pendingGoogleLink.email}. Enter your current Glory password once before we link it.
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Current Glory password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLinkPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  value={linkPassword}
                  onChange={event => setLinkPassword(event.target.value)}
                  placeholder='Enter your existing password'
                  style={{ ...inputStyle, paddingRight: '48px' }}
                />
                <button
                  type='button'
                  onClick={() => setShowLinkPassword(!showLinkPassword)}
                  style={eyeButtonStyle}
                  aria-label={showLinkPassword ? 'Hide password' : 'Show password'}
                >
                  {showLinkPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading || !linkPassword}
              className='glory-btn'
              style={{ width: '100%', padding: '13px', fontSize: '13px', opacity: loading || !linkPassword ? 0.7 : 1 }}
            >
              {loading ? 'Linking securely...' : 'Link Google and Continue'}
            </button>

            <button
              type='button'
              onClick={() => {
                setPendingGoogleLink(null)
                setLinkPassword('')
                setSuccess('')
                setUseEmail(false)
              }}
              style={plainButtonStyle}
            >
              Use a different sign-in method
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type='email'
                autoComplete='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='you@example.com'
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Enter your password'
                  style={{ ...inputStyle, paddingRight: '48px' }}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButtonStyle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <span style={{ fontSize: '12px', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>
                Forgot password?
              </span>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='glory-btn'
              style={{ width: '100%', padding: '13px', fontSize: '13px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type='button'
              onClick={() => setUseEmail(false)}
              style={plainButtonStyle}
            >
              Back to login options
            </button>
          </form>
        )}

        <Divider text='new to Glory?' extraStyle={{ margin: '24px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '13px', color: '#666' }}>
          <Link to='/register' style={{ color: '#111', fontWeight: '600', textDecoration: 'underline' }}>
            Create an account
          </Link>
        </div>

        <div style={sellerCtaStyle}>
          <div style={{ fontSize: '12px', color: '#c97a9a', fontWeight: '600', marginBottom: '3px' }}>
            Want to sell on Glory?
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            Start with email verification, then complete your seller profile.
          </div>
        </div>
      </div>
    </div>
  )
}

const Divider = ({ text, extraStyle = {} }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0', ...extraStyle }}>
    <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
    <span style={{ fontSize: '12px', color: '#aaa' }}>{text}</span>
    <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
  </div>
)

const pageStyle = {
  minHeight: '100dvh',
  backgroundColor: '#f7e7df',
  backgroundImage: "linear-gradient(90deg, rgba(255,248,244,0.2), rgba(255,248,244,0.54)), url('/images/auth/signup-beauty.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px'
}

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.92)',
  borderRadius: '12px',
  padding: '48px 40px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 22px 56px rgba(79, 45, 31, 0.16)',
  border: '1px solid rgba(255, 255, 255, 0.76)',
  backdropFilter: 'blur(14px)'
}

const logoStyle = {
  fontFamily: 'serif',
  fontWeight: '800',
  fontSize: '28px',
  color: '#111',
  textDecoration: 'none',
  letterSpacing: '0.1em'
}

const subtitleStyle = {
  textAlign: 'center',
  fontSize: '15px',
  color: '#555',
  marginBottom: '32px',
  fontWeight: '400'
}

const securityPanelStyle = {
  background: '#fafaf9',
  borderRadius: '14px',
  padding: '16px',
  border: '0.5px solid #eee',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px'
}

const sellerCtaStyle = {
  marginTop: '20px',
  background: '#fdf0f5',
  borderRadius: '12px',
  padding: '14px 16px',
  textAlign: 'center'
}

const textButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '12px',
  color: '#555',
  cursor: 'pointer',
  textAlign: 'center',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minHeight: '44px'
}

const plainButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '12px',
  color: '#888',
  cursor: 'pointer',
  textAlign: 'center',
  fontFamily: 'inherit',
  minHeight: '44px'
}

const eyeButtonStyle = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#999',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px'
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#444',
  marginBottom: '6px',
  letterSpacing: '0.03em'
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '0.5px solid #ddd',
  borderRadius: '10px',
  fontSize: '16px',
  color: '#111',
  outline: 'none',
  background: '#fafaf9',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  minHeight: '44px'
}

export default LoginPage
