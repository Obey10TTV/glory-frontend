import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FiGlobe, FiInstagram, FiLinkedin, FiShield, FiShoppingBag, FiTwitter } from 'react-icons/fi'

const values = [
  {
    Icon: FiShoppingBag,
    title: 'Made for Sellers',
    text: 'We designed Glory from the ground up for beauty entrepreneurs, not as an afterthought, but as the entire point.',
  },
  {
    Icon: FiShield,
    title: 'Safe & Secure',
    text: 'Every transaction on Glory is protected. Secure card payments through Stripe and crypto options mean sellers always get paid.',
  },
  {
    Icon: FiGlobe,
    title: 'Globally Inspired',
    text: 'Built in Canada, for everyone. CAD pricing, fast shipping, and a marketplace that celebrates every shade and tradition.',
  },
]

const stats = [
  { num: '500+', label: 'Products Listed' },
  { num: '12K+', label: 'Happy Customers' },
  { num: '4.8 stars', label: 'Average Rating' },
  { num: '100%', label: 'Authentic Products' },
]

const socialList = [
  { icon: <FiInstagram size={16} />, label: 'Glory community', href: '/community' },
  { icon: <FiTwitter size={16} />, label: 'Glory press', href: '/press' },
  { icon: <FiLinkedin size={16} />, label: 'Obioma Ajoku on LinkedIn', href: 'https://linkedin.com/in/obioma-ajoku' },
]

const AboutPage = () => {
  const navigate = useNavigate()

  return (
    <div className='glory-about-page'>
      <Navbar />

      <section className='glory-about-hero'>
        <div className='glory-about-hero-layer' />
        <div className='glory-about-hero-content'>
          <p className='glory-about-eyebrow'>Our Story</p>
          <h1 className='glory-about-hero-title'>
            Built for beauty,
            <span>made in Canada.</span>
          </h1>
          <p className='glory-about-hero-copy'>
            Glory was born out of frustration. Too many talented beauty entrepreneurs
            were selling in DMs, chasing payments manually, and building brands
            on borrowed platforms. We built something better.
          </p>
        </div>
      </section>

      <section className='glory-about-section glory-about-mission'>
        <div className='glory-about-narrow'>
          <p className='glory-about-eyebrow'>Our Mission</p>
          <h2 className='glory-about-heading'>
            Stop selling in DMs.
            <span>Start building a real business.</span>
          </h2>
          <p className='glory-about-body'>
            Every beauty entrepreneur deserves a professional storefront,
            seamless payments, and real analytics. Glory gives independent beauty
            businesses across Canada the same tools that big brands have without
            the complexity or cost.
          </p>
        </div>
      </section>

      <section className='glory-about-section glory-about-values'>
        <div className='glory-about-values-grid'>
          {values.map(({ Icon, title, text }) => (
            <article className='glory-about-card' key={title}>
              <div className='glory-about-card-icon'>
                <Icon size={24} aria-hidden='true' />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='glory-about-founder'>
        <div className='glory-about-founder-grid'>
          <div className='glory-about-founder-media'>
            <img
              src='https://res.cloudinary.com/dd8y3dijs/image/upload/v1777771736/glory-store/e0ej2dulr0zdnvper1oz.jpg'
              alt='Obioma Ajoku, Founder of Glory'
            />
          </div>

          <div className='glory-about-founder-copy'>
            <p className='glory-about-eyebrow'>The Founder</p>
            <h2>Obioma Ajoku</h2>
            <p className='glory-about-founder-role'>Founder & Product Designer</p>
            <p>
              Obioma is a Product Designer with an MSc in Usability Engineering from
              Bournemouth University and years of experience building digital products
              that people actually love to use.
            </p>
            <p>
              Glory is her vision of what beauty ecommerce should look like,
              premium, purposeful, and built with the seller in mind, for shoppers
              everywhere from Toronto to anywhere in the world.
            </p>
            <SocialLinks />
          </div>
        </div>
      </section>

      <section className='glory-about-section glory-about-stats'>
        <div className='glory-about-stats-grid'>
          {stats.map((stat) => (
            <article className='glory-about-stat' key={stat.label}>
              <strong>{stat.num}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className='glory-about-cta' aria-labelledby='about-cta-title'>
        <div className='glory-about-cta-layer' />
        <div className='glory-about-cta-content'>
          <h2 id='about-cta-title'>Ready to grow your beauty brand?</h2>
          <p>Join sellers across Canada already building their business on Glory.</p>
          <div className='glory-about-cta-actions'>
            <button
              onClick={() => navigate('/register')}
              className='glory-btn glory-about-cta-primary'
            >
              Start Selling Today
            </button>
            <button
              onClick={() => navigate('/products')}
              className='glory-about-cta-secondary'
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function SocialLinks() {
  return (
    <div className='glory-about-socials' aria-label='Founder links'>
      {socialList.map((social) => (
        <a
          key={social.label}
          href={social.href}
          className='glory-about-social-link'
          aria-label={social.label}
        >
          {social.icon}
        </a>
      ))}
    </div>
  )
}

export default AboutPage
