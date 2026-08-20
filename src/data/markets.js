export const ACTIVE_MARKETS = {
  NG: {
    code: 'NG',
    slug: 'ng',
    name: 'Nigeria',
    shortName: 'Nigeria',
    locale: 'en-NG',
    currency: 'NGN',
    currencyName: 'Nigerian naira',
    flag: '🇳🇬',
    billingProvider: 'paystack',
    announcement: "NIGERIA'S BEAUTY MARKETPLACE",
    deliveryCopy: 'Delivery arranged with each independent seller',
    hero: {
      id: 'nigeria-beauty-business',
      eyebrow: 'Beauty business, built in Nigeria',
      title: 'Made here. Discovered everywhere.',
      copy: 'Find independent beauty brands, trusted sellers and products made for every shade, texture and ritual.',
      mediaType: 'video',
      media: 'https://videos.pexels.com/video-files/8154464/8154464-sd_960_506_25fps.mp4',
      imagePosition: 'center',
      primaryLabel: 'Shop Nigeria',
      secondaryLabel: 'Open your store',
      tone: 'light'
    }
  },
  GB: {
    code: 'GB',
    slug: 'gb',
    name: 'United Kingdom',
    shortName: 'UK',
    locale: 'en-GB',
    currency: 'GBP',
    currencyName: 'British pounds',
    flag: '🇬🇧',
    billingProvider: 'stripe',
    announcement: "THE UK'S BEAUTY MARKETPLACE",
    deliveryCopy: 'Worldwide delivery where sellers offer it',
    hero: {
      id: 'united-kingdom-beauty',
      eyebrow: 'Glory beauty, United Kingdom',
      title: 'Beauty, in all your glory.',
      copy: 'Discover considered beauty across every shade, texture and ritual from independent sellers and growing brands.',
      mediaType: 'image',
      media: '/images/home/glory-editorial-hero.jpg',
      imagePosition: 'center',
      primaryLabel: 'Shop the UK edit',
      secondaryLabel: 'Start selling',
      tone: 'light'
    }
  },
  US: {
    code: 'US',
    slug: 'us',
    name: 'United States',
    shortName: 'USA',
    locale: 'en-US',
    currency: 'USD',
    currencyName: 'US dollars',
    flag: '🇺🇸',
    billingProvider: 'stripe',
    announcement: "AMERICA'S INDEPENDENT BEAUTY EDIT",
    deliveryCopy: 'Domestic and international delivery where offered',
    hero: {
      id: 'united-states-beauty',
      eyebrow: 'Independent beauty, United States',
      title: 'Your next beauty find starts here.',
      copy: 'Explore expressive colour, thoughtful skincare and emerging brands from verified independent sellers.',
      mediaType: 'image',
      media: '/images/home/makeup-edit.jpg',
      imagePosition: 'center',
      primaryLabel: 'Shop the US edit',
      secondaryLabel: 'Build your storefront',
      tone: 'dark'
    }
  },
  CA: {
    code: 'CA',
    slug: 'ca',
    name: 'Canada',
    shortName: 'Canada',
    locale: 'en-CA',
    currency: 'CAD',
    currencyName: 'Canadian dollars',
    flag: '🇨🇦',
    billingProvider: 'stripe',
    announcement: "CANADA'S INDEPENDENT BEAUTY MARKETPLACE",
    deliveryCopy: 'Canada-wide and international delivery where offered',
    hero: {
      id: 'canada-beauty',
      eyebrow: 'Independent beauty, Canada',
      title: 'Rituals for every season.',
      copy: 'Meet independent sellers and discover skincare, haircare and colour selected for real routines.',
      mediaType: 'image',
      media: '/images/home/skincare-edit.jpg',
      imagePosition: 'center',
      primaryLabel: 'Shop Canada',
      secondaryLabel: 'Sell on Glory',
      tone: 'dark'
    }
  }
}

export const COMING_SOON_MARKETS = [
  { code: 'GH', slug: 'ghana', name: 'Ghana', region: 'Africa', flag: '🇬🇭' },
  { code: 'KE', slug: 'kenya', name: 'Kenya', region: 'Africa', flag: '🇰🇪' },
  { code: 'ZA', slug: 'south-africa', name: 'South Africa', region: 'Africa', flag: '🇿🇦' },
  { code: 'AE', slug: 'united-arab-emirates', name: 'United Arab Emirates', region: 'Middle East', flag: '🇦🇪' },
  { code: 'FR', slug: 'france', name: 'France', region: 'Europe', flag: '🇫🇷' },
  { code: 'DE', slug: 'germany', name: 'Germany', region: 'Europe', flag: '🇩🇪' },
  { code: 'AU', slug: 'australia', name: 'Australia', region: 'Asia Pacific', flag: '🇦🇺' },
  { code: 'IN', slug: 'india', name: 'India', region: 'Asia Pacific', flag: '🇮🇳' }
]

export const DEFAULT_MARKET_CODE = 'NG'
export const MARKET_STORAGE_KEY = 'gloryMarketCode'

export const getMarket = (code) => ACTIVE_MARKETS[String(code || '').toUpperCase()] || ACTIVE_MARKETS[DEFAULT_MARKET_CODE]

export const getMarketFromPath = (pathname) => {
  const slug = String(pathname || '').split('/').filter(Boolean)[0]
  return Object.values(ACTIVE_MARKETS).find((market) => market.slug === slug) || null
}

export const getComingSoonMarket = (slug) => COMING_SOON_MARKETS.find((market) => market.slug === slug) || null
