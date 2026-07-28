import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import {
  authenticateWithGoogle,
  linkGoogleAccount,
  registerUser,
  resendVerificationOtp,
  verifyEmailOtp,
  verifyLoginTwoFactor
} from '../api'
import Message from '../components/Message'
import { FiEye, FiEyeOff, FiMail, FiPackage, FiRefreshCw, FiShield, FiShoppingBag } from 'react-icons/fi'
import GoogleSignInButton from '../components/GoogleSignInButton'

const passwordIsStrong = (value) => (
  value.length >= 10
  && /[a-z]/.test(value)
  && /[A-Z]/.test(value)
  && /\d/.test(value)
  && /[^A-Za-z0-9]/.test(value)
)

const RegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSeller, setIsSeller] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingVerification, setPendingVerification] = useState(null)
  const [pendingGoogleLink, setPendingGoogleLink] = useState(null)
  const [googleCredential, setGoogleCredential] = useState('')
  const [linkPassword, setLinkPassword] = useState('')
  const [showLinkPassword, setShowLinkPassword] = useState(false)
  const [otp, setOtp] = useState('')

  const finishLogin = (data) => {
    login(data)
    navigate(data.isSeller ? '/seller' : '/')
  }

  const handleAuthResponse = (data) => {
    if (data.requiresTwoFactor) {
      setPendingVerification({ type: '2fa', email: data.email })
      setPendingGoogleLink(null)
      setSuccess(data.message || 'Enter the verification code sent to your email.')
      return
    }

    finishLogin(data)
  }

  const handleGoogleCredential = async (credential) => {
    setGoogleCredential(credential)
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data } = await authenticateWithGoogle({ credential, isSeller })
      handleAuthResponse(data)
    } catch (err) {
      const data = err.response?.data
      if (data?.requiresGoogleLink) {
        setPendingGoogleLink({ credential, email: data.email })
        setSuccess(data.message)
      } else {
        setError(data?.message || 'Google sign-up could not be completed.')
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
      handleAuthResponse(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Google account linking could not be completed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event?.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!passwordIsStrong(password)) {
      setError('Use at least 10 characters with uppercase, lowercase, a number and a special character')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data } = await registerUser({ name, email, password, isSeller })

      if (data.requiresEmailVerification) {
        setPendingVerification({ type: 'email', email: data.email, isSeller: data.isSeller })
        setSuccess(data.message || 'We sent a verification code to your email.')
        return
      }

      finishLogin(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!pendingVerification?.email) {
      setError('Start signup again so we know which email to verify.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = pendingVerification.type === '2fa'
        ? await verifyLoginTwoFactor({ email: pendingVerification.email, otp })
        : await verifyEmailOtp({ email: pendingVerification.email, otp })
      finishLogin(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!pendingVerification?.email) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (pendingVerification.type === '2fa') {
        if (!googleCredential) {
          throw new Error('Start Google sign-in again to request a new code.')
        }
        const { data } = await authenticateWithGoogle({ credential: googleCredential, isSeller })
        handleAuthResponse(data)
      } else {
        const { data } = await resendVerificationOtp({ email: pendingVerification.email })
        setSuccess(data.message || 'A new verification code has been sent.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not send a new code')
    } finally {
      setLoading(false)
    }
  }

  const verificationCodeValid = /^\d{6}$/.test(otp)
    || (pendingVerification?.type === '2fa' && /^[A-F0-9]{6}-[A-F0-9]{6}$/.test(otp))

  return (
    <div className='glory-auth-page' style={pageStyle}>
      <div className='glory-auth-card glory-register-card' style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <Link to='/' style={logoStyle}>
            GLORY.
          </Link>
        </div>
        <div style={subtitleStyle}>
          {pendingVerification
            ? 'Security check'
            : pendingGoogleLink
              ? 'Link your existing account'
              : 'Create your account'}
        </div>

        {error && <Message type='error' text={error} />}
        {success && <Message type='success' text={success} />}

        {pendingVerification ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={verificationPanelStyle}>
              <FiShield size={24} style={{ color: '#111' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>
                  {pendingVerification.type === '2fa' ? 'Two-factor authentication' : 'Email OTP required'}
                </div>
                <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.6', marginTop: '4px' }}>
                  Enter the 6-digit code sent to {pendingVerification.email}
                  {pendingVerification.type === '2fa'
                    ? ' or use one recovery code.'
                    : '. Your account opens only after this check.'}
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Verification code</label>
              <input
                type='text'
                inputMode={pendingVerification.type === '2fa' ? 'text' : 'numeric'}
                autoComplete='one-time-code'
                maxLength={pendingVerification.type === '2fa' ? 13 : 6}
                value={otp}
                onChange={event => setOtp(
                  pendingVerification.type === '2fa'
                    ? event.target.value.toUpperCase().replace(/[^A-F0-9-]/g, '').slice(0, 13)
                    : event.target.value.replace(/\D/g, '').slice(0, 6)
                )}
                placeholder={pendingVerification.type === '2fa' ? '000000 or XXXXXX-XXXXXX' : '000000'}
                style={{ ...inputStyle, letterSpacing: '0.18em', textAlign: 'center', fontSize: '16px' }}
              />
            </div>

            <button
              onClick={handleVerifyEmail}
              disabled={loading || !verificationCodeValid}
              className='glory-btn'
              style={{ width: '100%', padding: '13px', fontSize: '13px', opacity: loading || !verificationCodeValid ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Verify and Continue'}
            </button>

            <button
              onClick={handleResendVerification}
              disabled={loading}
              style={textButtonStyle}
            >
              <FiRefreshCw size={14} />
              Send a new code
            </button>
          </div>
        ) : pendingGoogleLink ? (
          <form onSubmit={handleGoogleLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={verificationPanelStyle}>
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

            <PasswordField
              label='Current Glory password'
              value={linkPassword}
              onChange={setLinkPassword}
              show={showLinkPassword}
              setShow={setShowLinkPassword}
              placeholder='Enter your existing password'
              autoComplete='current-password'
            />

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
              }}
              style={plainButtonStyle}
            >
              Use a different sign-up method
            </button>
          </form>
        ) : (
          <div className='glory-register-flow'>
            <div style={accountTypeStyle}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '12px' }}>
                I want to
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <AccountTypeButton
                  active={!isSeller}
                  icon={<FiShoppingBag size={20} />}
                  title='Shop'
                  text='Buy products'
                  onClick={() => setIsSeller(false)}
                />
                <AccountTypeButton
                  active={isSeller}
                  icon={<FiPackage size={20} />}
                  title='Sell'
                  text='Start my store'
                  onClick={() => setIsSeller(true)}
                />
              </div>
            </div>

            <GoogleSignInButton
              text='signup_with'
              disabled={loading}
              onCredential={handleGoogleCredential}
              onError={setError}
            />

            <Divider text='or sign up with email' />

            <form className='glory-register-form' onSubmit={handleSubmit}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type='text'
                  autoComplete='name'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder='Your full name'
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type='email'
                  autoComplete='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='you@example.com'
                  style={inputStyle}
                  required
                />
              </div>

              <PasswordField
                label='Password'
                value={password}
                onChange={setPassword}
                show={showPassword}
                setShow={setShowPassword}
                placeholder='Create a strong password'
                autoComplete='new-password'
              />
              <div className='glory-register-password-hint'>
                Use 10+ characters with uppercase, lowercase, a number and a special character.
              </div>

              <PasswordField
                label='Confirm password'
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                placeholder='Confirm your password'
                autoComplete='new-password'
              />

              <div className='glory-register-otp-note'>
                <FiMail size={15} aria-hidden='true' />
                <span>We will email you a one-time code before the account becomes active.</span>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='glory-btn glory-register-submit'
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {isSeller && (
              <div style={sellerNoteStyle}>
                <div style={{ fontSize: '12px', color: '#c97a9a', fontWeight: '600', marginBottom: '3px' }}>
                  You're signing up as a seller.
                </div>
                <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.6' }}>
                  After email verification, complete your seller profile and product review steps.
                </div>
              </div>
            )}
          </div>
        )}

        <Divider text='already have an account?' extraStyle={{ margin: '24px 0 16px' }} />

        <div style={{ textAlign: 'center', fontSize: '13px' }}>
          <Link to='/login' style={{ color: '#111', fontWeight: '600', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

const AccountTypeButton = ({ active, icon, title, text, onClick }) => (
  <button
    type='button'
    onClick={onClick}
    className='glory-register-account-type'
    style={{
      flex: 1,
      padding: '12px',
      borderRadius: '10px',
      textAlign: 'center',
      cursor: 'pointer',
      border: '1.5px solid',
      borderColor: active ? '#111' : '#eee',
      background: active ? '#111' : '#fff',
      transition: 'all 0.2s',
      fontFamily: 'inherit'
    }}
  >
    <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: active ? '#fff' : '#111' }}>
      {icon}
    </span>
    <div style={{ fontSize: '12px', fontWeight: '600', color: active ? '#fff' : '#111' }}>{title}</div>
    <div style={{ fontSize: '10px', color: active ? 'rgba(255,255,255,0.7)' : '#999' }}>{text}</div>
  </button>
)

const PasswordField = ({ label, value, onChange, show, setShow, placeholder, autoComplete }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: '48px' }}
      />
      <button
        type='button'
        onClick={() => setShow(!show)}
        style={eyeButtonStyle}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  </div>
)

const Divider = ({ text, extraStyle = {} }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0', ...extraStyle }}>
    <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
    <span style={{ fontSize: '12px', color: '#aaa' }}>{text}</span>
    <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
  </div>
)

const pageStyle = {
  minHeight: '100vh',
  background: '#fafaf9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px'
}

const cardStyle = {
  background: '#fff',
  borderRadius: '20px',
  padding: '48px 40px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  border: '0.5px solid #eee'
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
  marginBottom: '32px'
}

const accountTypeStyle = {
  background: '#fafaf9',
  borderRadius: '12px',
  padding: '16px',
  border: '0.5px solid #eee'
}

const verificationPanelStyle = {
  background: '#fafaf9',
  borderRadius: '14px',
  padding: '16px',
  border: '0.5px solid #eee',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px'
}

const sellerNoteStyle = {
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
  marginBottom: '6px'
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

export default RegisterPage
