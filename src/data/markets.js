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
      mediaType: 'image',
      media: '/images/home/nigeria-beauty-hero.png',
      imagePosition: 'center',
      primaryLabel: 'Shop Nigeria',
      secondaryLabel: 'Open your store',
      tone: 'light',
      slides: [
        {
          id: 'nigeria-haircare-edit',
          eyebrow: 'Texture, celebrated',
          title: 'Your wash day, your way.',
          copy: 'Explore oils, treatments and styling essentials from Nigerian beauty businesses that understand textured hair.',
          mediaType: 'image',
          media: '/images/home/nigeria-haircare-hero.png',
          imagePosition: 'center',
          primaryLabel: 'Shop haircare',
          primaryPath: '/products?category=Haircare',
          secondaryLabel: 'Meet sellers',
          secondaryPath: '/sell-on-glory',
          tone: 'light'
        },
        {
          id: 'nigeria-beauty-creator',
          eyebrow: 'Independent and growing',
          title: 'Beauty business belongs here.',
          copy: 'Discover new products from founders building thoughtful beauty brands across Nigeria.',
          mediaType: 'image',
          media: '/images/home/nigeria-creator-hero.png',
          imagePosition: 'center',
          primaryLabel: 'Discover beauty',
          primaryPath: '/products',
          secondaryLabel: 'Start selling',
          secondaryPath: '/sell-on-glory',
          tone: 'light'
        }
      ]
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
      media: '/images/home/uk-ritual-hero.png',
      imagePosition: 'center',
      primaryLabel: 'Shop the UK edit',
      secondaryLabel: 'Start selling',
      tone: 'light',
      slides: [
        {
          id: 'uk-haircare-edit',
          eyebrow: 'Care in every texture',
          title: 'Made for your real routine.',
          copy: 'Build a better haircare shelf with treatments and tools from considered independent sellers.',
          mediaType: 'image',
          media: '/images/home/uk-haircare-hero.png',
          imagePosition: 'center',
          primaryLabel: 'Shop haircare',
          primaryPath: '/products?category=Haircare',
          secondaryLabel: 'Explore the UK edit',
          secondaryPath: '/products',
          tone: 'dark'
        },
        {
          id: 'uk-colour-edit',
          eyebrow: 'Colour, considered',
          title: 'A little more you.',
          copy: 'Find complexion, colour and detail-led beauty from the UK brands worth knowing.',
          mediaType: 'image',
          media: '/images/home/uk-makeup-hero.png',
          imagePosition: 'center',
          primaryLabel: 'Shop makeup',
          primaryPath: '/products?category=Makeup',
          secondaryLabel: 'Meet sellers',
          secondaryPath: '/sell-on-glory',
          tone: 'dark'
        }
      ]
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
      media: '/images/home/us-makeup-hero.png',
      imagePosition: 'center',
      primaryLabel: 'Shop the US edit',
      secondaryLabel: 'Build your storefront',
      tone: 'light',
      slides: [
        {
          id: 'us-texture-edit',
          eyebrow: 'Care that meets you there',
          title: 'Texture is the main event.',
          copy: 'Explore wash-day essentials, scalp care and styling favourites from independent US sellers.',
          mediaType: 'image',
          media: '/images/home/us-haircare-hero.png',
          imagePosition: 'center',
          primaryLabel: 'Shop haircare',
          primaryPath: '/products?category=Haircare',
          secondaryLabel: 'Explore all beauty',
          secondaryPath: '/products',
          tone: 'light'
        },
        {
          id: 'us-beauty-studio',
          eyebrow: 'The next beauty standard',
          title: 'Your point of view, in colour.',
          copy: 'Fresh makeup, thoughtful skincare and independent labels selected for your everyday.',
          mediaType: 'image',
          media: '/images/home/us-studio-hero.png',
          imagePosition: 'center',
          primaryLabel: 'Shop makeup',
          primaryPath: '/products?category=Makeup',
          secondaryLabel: 'Start selling',
          secondaryPath: '/sell-on-glory',
          tone: 'light'
        }
      ]
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
      media: '/images/home/canada-ritual-hero.png',
      imagePosition: 'center',
      primaryLabel: 'Shop Canada',
      secondaryLabel: 'Sell on Glory',
      tone: 'light',
      slides: [
        {
          id: 'canada-haircare-edit',
          eyebrow: 'Care for every climate',
          title: 'Healthy hair starts with care.',
          copy: 'Discover hair oils, treatments and routine staples from independent Canadian beauty sellers.',
          mediaType: 'image',
          media: '/images/home/canada-haircare-hero.png',
          imagePosition: 'center',
          primaryLabel: 'Shop haircare',
          primaryPath: '/products?category=Haircare',
          secondaryLabel: 'Explore Canada',
          secondaryPath: '/products',
          tone: 'dark'
        },
        {
          id: 'canada-winter-ritual',
          eyebrow: 'Rituals for the season',
          title: 'Slow down. Layer up.',
          copy: 'Meet the moisturisers, oils and small comforts made for a little extra care.',
          mediaType: 'image',
          media: '/images/home/canada-winter-hero.png',
          imagePosition: 'center',
          primaryLabel: 'Shop skincare',
          primaryPath: '/products?category=Skincare',
          secondaryLabel: 'Discover beauty',
          secondaryPath: '/products',
          tone: 'light'
        }
      ]
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
