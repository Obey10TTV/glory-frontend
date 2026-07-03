import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { registerUser } from '../api'
import Message from '../components/Message'
import { FiEye, FiEyeOff, FiPackage, FiShoppingBag } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'

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
  const [useEmail, setUseEmail] = useState(false)

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await registerUser({ name, email, password, isSeller })
      login(data)
      navigate(data.isSeller ? '/seller' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
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
        padding: '48px 40px', width: '100%', maxWidth: '440px',
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
          color: '#555', marginBottom: '32px'
        }}>
          Create your account
        </div>

        {error && <Message type='error' text={error} />}

        {!useEmail ? (
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
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <FcGoogle size={18} />
              Sign up with Google
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
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <FaApple size={18} />
              Sign up with Apple
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

            {/* USE EMAIL */}
            <button
              onClick={() => setUseEmail(true)}
              className='glory-btn'
              style={{ width: '100%', padding: '13px', fontSize: '13px' }}
            >
              Sign up with Email
            </button>
          </div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ACCOUNT TYPE */}
            <div style={{
              background: '#fafaf9', borderRadius: '12px',
              padding: '16px', border: '0.5px solid #eee'
            }}>
              <div style={{
                fontSize: '12px', fontWeight: '600',
                color: '#444', marginBottom: '12px'
              }}>
                I want to
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div
                  onClick={() => setIsSeller(false)}
                  style={{
                    flex: 1, padding: '12px',
                    borderRadius: '10px', textAlign: 'center',
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: !isSeller ? '#111' : '#eee',
                    background: !isSeller ? '#111' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <FiShoppingBag size={20} style={{ marginBottom: '4px', color: !isSeller ? '#fff' : '#111' }} />
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    color: !isSeller ? '#fff' : '#111'
                  }}>Shop</div>
                  <div style={{
                    fontSize: '10px',
                    color: !isSeller ? 'rgba(255,255,255,0.7)' : '#999'
                  }}>Buy products</div>
                </div>
                <div
                  onClick={() => setIsSeller(true)}
                  style={{
                    flex: 1, padding: '12px',
                    borderRadius: '10px', textAlign: 'center',
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: isSeller ? '#111' : '#eee',
                    background: isSeller ? '#111' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <FiPackage size={20} style={{ marginBottom: '4px', color: isSeller ? '#fff' : '#111' }} />
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    color: isSeller ? '#fff' : '#111'
                  }}>Sell</div>
                  <div style={{
                    fontSize: '10px',
                    color: isSeller ? 'rgba(255,255,255,0.7)' : '#999'
                  }}>Start my store</div>
                </div>
              </div>
            </div>

            {/* NAME */}
            <div>
              <label style={labelStyle}>Full name</label>
              <input
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Your full name'
                style={inputStyle}
              />
            </div>

            {/* EMAIL */}
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

            {/* PASSWORD */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Create a password'
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label style={labelStyle}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder='Confirm your password'
                  style={{ ...inputStyle, paddingRight: '48px' }}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute', right: '14px',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#999',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='glory-btn'
              style={{
                width: '100%', padding: '13px',
                fontSize: '13px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <button
              onClick={() => setUseEmail(false)}
              style={{
                background: 'none', border: 'none',
                fontSize: '12px', color: '#888',
                cursor: 'pointer', textAlign: 'center',
                fontFamily: 'inherit'
              }}
            >
              ← Back to sign up options
            </button>

            {isSeller && (
              <div style={{
                background: '#fdf0f5', borderRadius: '12px',
                padding: '14px 16px', textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '12px', color: '#c97a9a',
                  fontWeight: '600', marginBottom: '3px'
                }}>
                  You're signing up as a seller.
                </div>
                <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.6' }}>
                  Stop selling in DMs. Get your own storefront on Glory.
                </div>
              </div>
            )}
          </div>
        )}

        {/* DIVIDER */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', margin: '24px 0 16px'
        }}>
          <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
          <span style={{ fontSize: '12px', color: '#aaa' }}>already have an account?</span>
          <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px' }}>
          <Link to='/login' style={{
            color: '#111', fontWeight: '600',
            textDecoration: 'underline'
          }}>
            Sign in
          </Link>
        </div>

      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '12px',
  fontWeight: '600', color: '#444',
  marginBottom: '6px'
}

const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '0.5px solid #ddd', borderRadius: '10px',
  fontSize: '13px', color: '#111',
  outline: 'none', background: '#fafaf9',
  boxSizing: 'border-box', fontFamily: 'inherit'
}

export default RegisterPage
