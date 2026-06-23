import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi'

const AboutPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fafaf9', minHeight: '100vh' }}>
      <Navbar />

      {/* HERO */}
      <div style={{
        background: '#111', padding: '100px 40px',
        textAlign: 'center', position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(201,122,154,0.15), transparent 60%), radial-gradient(circle at 70% 50%, rgba(201,122,154,0.1), transparent 60%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '11px', fontWeight: '600',
            color: '#c97a9a', letterSpacing: '0.2em',
            textTransform: 'uppercase', marginBottom: '20px'
          }}>
            Our Story
          </div>
          <h1 style={{
            fontSize: '52px', fontWeight: '800',
            color: '#fff', lineHeight: '1.1',
            marginBottom: '20px', letterSpacing: '-1px'
          }}>
            Built for beauty,<br />
            <span style={{ color: '#c97a9a' }}>made in Canada.</span>
          </h1>
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.6)',
            maxWidth: '560px', margin: '0 auto',
            lineHeight: '1.8'
          }}>
            Glory was born out of frustration. Too many talented beauty entrepreneurs
            were selling in DMs, chasing payments manually, and building brands
            on borrowed platforms. We built something better.
          </p>
        </div>
      </div>

      {/* MISSION */}
      <div style={{
        padding: '80px 40px', maxWidth: '900px',
        margin: '0 auto', textAlign: 'center'
      }}>
        <div style={{
          fontSize: '11px', fontWeight: '600',
          color: '#c97a9a', letterSpacing: '0.2em',
          textTransform: 'uppercase', marginBottom: '16px'
        }}>
          Our Mission
        </div>
        <h2 style={{
          fontSize: '36px', fontWeight: '800',
          color: '#111', lineHeight: '1.2',
          marginBottom: '20px'
        }}>
          Stop selling in DMs.<br />Start building a real business.
        </h2>
        <p style={{
          fontSize: '15px', color: '#666',
          lineHeight: '1.85', maxWidth: '680px', margin: '0 auto'
        }}>
          Every beauty entrepreneur deserves a professional storefront,
          seamless payments, and real analytics. Glory gives independent beauty
          businesses across Canada the same tools that big brands have without
          the complexity or cost.
        </p>
      </div>

      {/* VALUES */}
      <div style={{
        padding: '0 40px 80px',
        maxWidth: '1100px', margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}>
          {[
            {
              icon: '💄',
              title: 'Made for Sellers',
              text: 'We designed Glory from the ground up for beauty entrepreneurs, not as an afterthought, but as the entire point.'
            },
            {
              icon: '🔒',
              title: 'Safe & Secure',
              text: 'Every transaction on Glory is protected. Secure card payments through Stripe and crypto options mean sellers always get paid.'
            },
            {
              icon: '🌍',
              title: 'Globally Inspired',
              text: 'Built in Canada, for everyone. CAD pricing, fast shipping, and a marketplace that celebrates every shade and tradition.'
            },
          ].map((val, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '20px',
              padding: '36px', border: '0.5px solid #eee'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{val.icon}</div>
              <div style={{
                fontSize: '18px', fontWeight: '700',
                color: '#111', marginBottom: '12px'
              }}>
                {val.title}
              </div>
              <div style={{
                fontSize: '14px', color: '#666', lineHeight: '1.75'
              }}>
                {val.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOUNDER */}
      <div style={{
        background: '#fff', padding: '80px 40px',
        borderTop: '0.5px solid #eee', borderBottom: '0.5px solid #eee'
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '60px', alignItems: 'center'
        }}>
          <div>
            <div style={{
              width: '100%', aspectRatio: '1',
              borderRadius: '24px', overflow: 'hidden',
              background: '#fdf0f5'
            }}>
              <img
                src='https://res.cloudinary.com/dd8y3dijs/image/upload/v1777771736/glory-store/e0ej2dulr0zdnvper1oz.jpg'
                alt='Obioma Ajoku, Founder of Glory'
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block'
                }}
              />
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '11px', fontWeight: '600',
              color: '#c97a9a', letterSpacing: '0.2em',
              textTransform: 'uppercase', marginBottom: '16px'
            }}>
              The Founder
            </div>
            <h2 style={{
              fontSize: '32px', fontWeight: '800',
              color: '#111', marginBottom: '8px'
            }}>
              Obioma Ajoku
            </h2>
            <div style={{
              fontSize: '13px', color: '#c97a9a',
              fontWeight: '600', marginBottom: '20px'
            }}>
              Founder & Product Designer
            </div>
            <p style={{
              fontSize: '14px', color: '#666',
              lineHeight: '1.85', marginBottom: '16px'
            }}>
              Obioma is a Product Designer with an MSc in Usability Engineering from
              Bournemouth University and years of experience building digital products
              that people actually love to use.
            </p>
            <p style={{
              fontSize: '14px', color: '#666',
              lineHeight: '1.85', marginBottom: '28px'
            }}>
              Glory is her vision of what beauty ecommerce should look like,
              premium, purposeful, and built with the seller in mind, for shoppers
              everywhere from Toronto to anywhere in the world.
            </p>
            <SocialLinks />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ padding: '80px 40px' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px', textAlign: 'center'
        }}>
          {[
            { num: '500+', label: 'Products Listed' },
            { num: '12K+', label: 'Happy Customers' },
            { num: '4.8 stars', label: 'Average Rating' },
            { num: '100%', label: 'Authentic Products' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '16px',
              padding: '32px 20px', border: '0.5px solid #eee'
            }}>
              <div style={{
                fontSize: '36px', fontWeight: '800',
                color: '#111', marginBottom: '8px'
              }}>
                {stat.num}
              </div>
              <div style={{ fontSize: '13px', color: '#888' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        margin: '0 40px 80px',
        background: '#111', borderRadius: '24px',
        padding: '60px', textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(201,122,154,0.15), transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '36px', fontWeight: '800',
            color: '#fff', marginBottom: '16px'
          }}>
            Ready to grow your beauty brand?
          </h2>
          <p style={{
            fontSize: '15px', color: 'rgba(255,255,255,0.6)',
            marginBottom: '32px'
          }}>
            Join sellers across Canada already building their business on Glory.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/register')}
              className='glory-btn'
              style={{
                padding: '15px 36px', fontSize: '15px',
                background: '#fff', color: '#111',
                border: '1.5px solid #fff'
              }}
            >
              Start Selling Today
            </button>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '15px 36px', fontSize: '15px',
                fontWeight: '600', background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: '999px', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s'
              }}
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

const socialList = [
  { icon: <FiInstagram size={16} />, href: '#' },
  { icon: <FiTwitter size={16} />, href: '#' },
  { icon: <FiLinkedin size={16} />, href: 'https://linkedin.com/in/obioma-ajoku' },
]

function SocialLinks() {
  const linkStyle = {
    width: '40px', height: '40px',
    borderRadius: '50%', background: '#fafaf9',
    border: '0.5px solid #eee',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#555',
    textDecoration: 'none', transition: 'all 0.2s'
  }
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {socialList.map((social, i) => {
        const tag = React.createElement(
          'a',
          {
            key: i,
            href: social.href,
            style: linkStyle,
            onMouseEnter: e => {
              e.currentTarget.style.background = '#111'
              e.currentTarget.style.color = '#fff'
            },
            onMouseLeave: e => {
              e.currentTarget.style.background = '#fafaf9'
              e.currentTarget.style.color = '#555'
            }
          },
          social.icon
        )
        return tag
      })}
    </div>
  )
}

export default AboutPage