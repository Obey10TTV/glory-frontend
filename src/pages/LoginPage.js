import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { loginUser } from '../api'
import Message from '../components/Message'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useEmail, setUseEmail] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await loginUser({ email, password })
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fafaf9',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '48px 40px', width: '100%', maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: '0.5px solid #eee'
      }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <Link to='/' style={{
            fontFamily: 'serif', fontWeight: '800',
            fontSize: '28px', color: '#111',
            textDecoration: 'none', letterSpacing: '0.1em'
          }}>
            GLORY.
          </Link>
        </div>
        <div style={{
          textAlign: 'center', fontSize: '15px',
          color: '#555', marginBottom: '32px', fontWeight: '400'
        }}>
          Welcome back
        </div>

        {error && <Message type='error' text={error} />}

        {!useEmail ? (
          <>
            {/* SOCIAL BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* GOOGLE */}
              <button
                style={{
                  width: '100%', padding: '13px',
                  border: '1px solid #ddd', borderRadius: '999px',
                  background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '10px',
                  fontSize: '13px', fontWeight: '600',
                  color: '#111', fontFamily: 'inherit',
                  transition: 'border-color 0.2s, background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <FcGoogle size={18} />
                Continue with Google
              </button>

              {/* APPLE */}
              <button
                style={{
                  width: '100%', padding: '13px',
                  border: '1px solid #ddd', borderRadius: '999px',
                  background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '10px',
                  fontSize: '13px', fontWeight: '600',
                  color: '#111', fontFamily: 'inherit',
                  transition: 'border-color 0.2s, background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <FaApple size={18} />
                Continue with Apple
              </button>

              {/* DIVIDER */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '12px', margin: '4px 0'
              }}>
                <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
                <span style={{ fontSize: '12px', color: '#aaa' }}>or</span>
                <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
              </div>

              {/* USE EMAIL BUTTON */}
              <button
                onClick={() => setUseEmail(true)}
                className='glory-btn'
                style={{
                  width: '100%', padding: '13px',
                  fontSize: '13px'
                }}
              >
                Continue with Email
              </button>
            </div>
          </>
        ) : (
          <>
            {/* EMAIL FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type='email'
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
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder='Enter your password'
                    style={{ ...inputStyle, paddingRight: '48px' }}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '14px',
                      top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#999',
                      display: 'flex', alignItems: 'center'
                    }}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* FORGOT PASSWORD */}
              <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                <span style={{
                  fontSize: '12px', color: '#888',
                  cursor: 'pointer', textDecoration: 'underline'
                }}>
                  Forgot password?
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className='glory-btn'
                style={{
                  width: '100%', padding: '13px',
                  fontSize: '13px', opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                onClick={() => setUseEmail(false)}
                style={{
                  background: 'none', border: 'none',
                  fontSize: '12px', color: '#888',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                ← Back to login options
              </button>
            </div>
          </>
        )}

        {/* DIVIDER */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', margin: '24px 0'
        }}>
          <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
          <span style={{ fontSize: '12px', color: '#aaa' }}>new to Glory?</span>
          <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
        </div>

        {/* REGISTER LINK */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: '#666' }}>
          <Link to='/register' style={{
            color: '#111', fontWeight: '600',
            textDecoration: 'underline'
          }}>
            Create an account
          </Link>
        </div>

        {/* SELLER CTA */}
        <div style={{
          marginTop: '20px', background: '#fdf0f5',
          borderRadius: '12px', padding: '14px 16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '12px', color: '#c97a9a',
            fontWeight: '600', marginBottom: '3px'
          }}>
            Want to sell on Glory?
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            Stop selling in DMs. Start your store today.
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '12px',
  fontWeight: '600', color: '#444',
  marginBottom: '6px', letterSpacing: '0.03em'
}

const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '0.5px solid #ddd', borderRadius: '10px',
  fontSize: '13px', color: '#111',
  outline: 'none', background: '#fafaf9',
  boxSizing: 'border-box', fontFamily: 'inherit'
}

export default LoginPage