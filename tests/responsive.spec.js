const { expect, test } = require('@playwright/test')

const publicRoutes = [
  '/',
  '/ng',
  '/gb',
  '/us',
  '/ca',
  '/coming-soon/ghana',
  '/products',
  '/cart',
  '/wishlist',
  '/login',
  '/register',
  '/about',
  '/contact',
  '/track-order',
  '/returns',
  '/shipping',
  '/faq',
  '/support',
  '/marketplace-safety',
  '/reviews-policy',
  '/careers',
  '/press',
  '/affiliates',
  '/blog',
  '/community',
  '/sell-on-glory',
  '/seller-resources',
  '/seller-agreement',
  '/seller-pricing',
  '/paid-promotion-terms',
  '/seller-faq',
  '/success-stories',
  '/privacy',
  '/terms',
  '/cookies',
  '/security',
  '/accessibility',
]

const widths = [
  320,
  340,
  375,
  390,
  414,
  420,
  480,
  560,
  640,
  680,
  720,
  820,
  900,
  1024,
  1120,
  1280,
  1440,
]

const webkitWidths = [320, 375, 414, 480, 768, 1024, 1440]
const protectedWidths = [320, 375, 414, 768, 1024, 1440]

const customerProfile = {
  _id: 'responsive-customer',
  name: 'Responsive Customer',
  email: 'customer@example.com',
  isSeller: false,
  isAdmin: false,
  emailVerified: true,
  twoFactorEnabled: false,
}

const sellerProfile = {
  ...customerProfile,
  _id: 'responsive-seller',
  name: 'Responsive Seller',
  email: 'seller@example.com',
  isSeller: true,
  isEmailVerified: true,
  twoFactorEnabled: true,
  sellerProfile: {
    storeName: 'Responsive Beauty',
    brandName: 'Responsive Beauty',
    marketCode: 'GB',
    country: 'United Kingdom',
    verificationStatus: 'verified',
    activationStatus: 'paid',
    identityVerification: { provider: 'stripe_identity', status: 'verified' },
    membershipPlanCode: 'starter',
    membershipStatus: 'active',
    payoutStatus: 'active',
    acceptedPaymentMethods: ['card'],
  },
}

const adminProfile = {
  ...sellerProfile,
  _id: 'responsive-admin',
  name: 'Responsive Admin',
  email: 'admin@example.com',
  isAdmin: true,
}

const protectedRoutes = [
  { route: '/account', profile: customerProfile },
  { route: '/messages', profile: customerProfile },
  { route: '/seller', profile: sellerProfile },
  { route: '/admin', profile: adminProfile },
]

const responsiveListing = {
  _id: 'responsive-listing',
  name: 'Daily Barrier Serum',
  brand: 'Responsive Beauty',
  category: 'Skincare',
  image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
  price: 24,
  currency: 'GBP',
  marketCode: 'GB',
  acceptedPaymentMethods: ['card', 'bank_transfer'],
  countInStock: 8,
  approvalStatus: 'approved',
}

const homepagePromotionPlan = {
  code: 'homepage_spotlight_7',
  placement: 'homepage_featured',
  label: 'Homepage Spotlight',
  description: 'A clearly labelled sponsored placement.',
  feePence: 8900,
  feeMinor: 8900,
  currency: 'GBP',
  marketCode: 'GB',
  billingProvider: 'stripe',
  durationDays: 7,
}

const regionalDetails = {
  NG: { marketName: 'Nigeria', currency: 'NGN', locale: 'en-NG', billingProvider: 'paystack', starterLimit: 10 },
  GB: { marketName: 'United Kingdom', currency: 'GBP', locale: 'en-GB', billingProvider: 'stripe', starterLimit: 5 },
  US: { marketName: 'United States', currency: 'USD', locale: 'en-US', billingProvider: 'stripe', starterLimit: 5 },
  CA: { marketName: 'Canada', currency: 'CAD', locale: 'en-CA', billingProvider: 'stripe', starterLimit: 5 },
}

const regionalMarketplaceResponse = (marketCode = 'NG') => {
  const market = regionalDetails[marketCode] || regionalDetails.NG
  const paidPrices = marketCode === 'NG' ? [750000, 2200000, 6000000] : [5900, 14900, 39900]
  const sellerPlans = [
    { code: 'starter', label: 'Starter', description: 'Start a verified catalogue.', feeMinor: 0, currency: market.currency, marketCode, billingProvider: market.billingProvider, interval: null, activeListingLimit: market.starterLimit, promotionDiscountBps: 0, features: [`Up to ${market.starterLimit} active listings`] },
    { code: 'studio', label: 'Studio', description: 'For growing beauty businesses.', feeMinor: paidPrices[0], currency: market.currency, marketCode, billingProvider: market.billingProvider, interval: 'month', activeListingLimit: 50, promotionDiscountBps: 1000, features: ['Up to 50 active listings'] },
    { code: 'scale', label: 'Scale', description: 'For established catalogues.', feeMinor: paidPrices[1], currency: market.currency, marketCode, billingProvider: market.billingProvider, interval: 'month', activeListingLimit: 200, promotionDiscountBps: 2000, features: ['Up to 200 active listings'] },
    { code: 'partner', label: 'Brand Partner', description: 'For high-volume brands.', feeMinor: paidPrices[2], currency: market.currency, marketCode, billingProvider: market.billingProvider, interval: 'month', activeListingLimit: 750, promotionDiscountBps: 2500, features: ['Up to 750 active listings'] },
  ]
  const promotionPlans = [
    { ...homepagePromotionPlan, currency: market.currency, marketCode, billingProvider: market.billingProvider, feeMinor: marketCode === 'NG' ? 500000 : 8900, recommended: true, requiresCreative: false },
    { code: 'homepage_video_7', placement: 'homepage_video', label: 'Homepage Video', description: 'A reviewed video campaign.', feeMinor: marketCode === 'NG' ? 2500000 : 19900, currency: market.currency, marketCode, billingProvider: market.billingProvider, durationDays: 7, requiresCreative: true },
  ]

  return {
    marketCode,
    marketName: market.marketName,
    locale: market.locale,
    currency: market.currency,
    billingProvider: market.billingProvider,
    billingEnabled: true,
    marketplaceMode: 'classified',
    directCheckoutEnabled: false,
    sellerActivationRequired: false,
    sellerPlans,
    promotionPlans,
    paymentMethods: [{ code: 'card', label: 'Card', enabled: true }],
    sellerAcceptedPaymentMethods: [{ code: 'card', label: 'Card or payment link' }, { code: 'bank_transfer', label: 'Bank transfer' }],
  }
}

const heightForWidth = (width) => {
  if (width <= 340) return 568
  if (width <= 390) return 667
  if (width <= 480) return 736
  if (width <= 820) return 1024
  return 900
}

const findLayoutIssues = () => {
  const viewportWidth = document.documentElement.clientWidth
  const root = document.getElementById('root')
  const rootWidth = root?.getBoundingClientRect().width || 0

  const hasHorizontalScroller = (element) => {
    let current = element.parentElement
    while (current && current !== document.body) {
      const style = getComputedStyle(current)
      if (['auto', 'scroll'].includes(style.overflowX)) return true
      current = current.parentElement
    }
    return false
  }

  const offenders = [...document.body.querySelectorAll('*')]
    .filter((element) => {
      if (['SCRIPT', 'STYLE', 'LINK', 'META', 'PATH'].includes(element.tagName)) return false

      const style = getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden') return false

      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      if (rect.right <= 0 || rect.left >= viewportWidth) return false
      if (hasHorizontalScroller(element)) return false

      return rect.left < -2 || rect.right > viewportWidth + 2
    })
    .slice(0, 8)
    .map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        element: element.tagName.toLowerCase(),
        className: typeof element.className === 'string' ? element.className.slice(0, 100) : '',
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      }
    })

  return {
    viewportWidth,
    rootWidth,
    documentWidth: document.documentElement.scrollWidth,
    offenders,
  }
}

const getCompactHomeLayout = () => {
  const columnCount = (selector) => {
    const element = document.querySelector(selector)
    if (!element) return 0

    return getComputedStyle(element).gridTemplateColumns
      .split(' ')
      .filter(Boolean)
      .length
  }

  return {
    departmentColumns: columnCount('.glory-home-departments.is-gallery .glory-home-department-rail'),
    storyColumns: columnCount('.glory-home-stories .glory-home-story-grid'),
    sellerColumns: columnCount('.glory-home-seller-inner-v3'),
    trustColumns: columnCount('.glory-home-trust-grid-v3'),
    footerColumns: columnCount('.glory-footer-links'),
    departmentCardWidth: Math.round(document.querySelector('.glory-home-departments.is-gallery .glory-home-department')?.getBoundingClientRect().width || 0),
  }
}

const mockApiResponse = (requestUrl, profile) => {
  const url = new URL(requestUrl)
  const { pathname, searchParams } = url
  const marketCode = searchParams.get('market') || profile?.sellerProfile?.marketCode || 'NG'
  const marketplace = regionalMarketplaceResponse(marketCode)

  if (pathname.endsWith('/users/profile')) return profile
  if (pathname.endsWith('/users/csrf')) return { csrfToken: 'responsive-test-token' }
  if (pathname.endsWith('/marketplace/config')) return marketplace
  if (pathname.endsWith('/marketplace/seller/status')) {
    return {
      ...marketplace,
      activation: { required: false, feePence: 0, currency: marketplace.currency, status: 'paid' },
      membership: { planCode: 'starter', status: 'active', activeListingLimit: 5, promotionDiscountBps: 0 },
      payouts: { status: 'active', detailsSubmitted: true, chargesEnabled: true, payoutsEnabled: true },
      acceptedPaymentMethods: ['card'],
    }
  }
  if (pathname.endsWith('/stripe/seller/identity/status')) return { provider: 'stripe_identity', status: 'verified' }
  if (pathname.endsWith('/stripe/status')) {
    return {
      enabled: true,
      currency: 'GBP',
      paymentMethods: [{ code: 'card', enabled: true }],
    }
  }
  if (pathname.endsWith('/orders/checkout-options')) {
    return {
      currency: 'GBP',
      itemsPrice: 25,
      shippingPrice: 4.95,
      totalPrice: 29.95,
      compatibleMethods: ['card'],
      sellerCount: 2,
    }
  }
  if (pathname.includes('/stripe/verify/')) return { message: 'Payment verification test state' }
  if (pathname === '/api/products') {
    const listing = { ...responsiveListing, marketCode, currency: marketplace.currency }
    return searchParams.toString()
      ? {
          items: [listing],
          pagination: { page: 1, pages: 1, total: 1 },
          facets: { categories: ['Skincare'], brands: ['Responsive Beauty'], productTypes: ['Serum'] },
        }
      : [listing]
  }
  if (pathname.endsWith('/products/mine')) return [responsiveListing]
  if (pathname.endsWith('/promotions/plans')) return { marketCode, items: marketplace.promotionPlans }
  if (pathname.endsWith('/promotions/homepage')) {
    return {
      items: [{
        id: 'responsive-homepage-promotion',
        placement: 'homepage_featured',
        label: 'Sponsored',
        listing: responsiveListing,
      }]
    }
  }
  if (pathname.endsWith('/promotions/mine') || pathname.includes('/reviews')) return []
  if (pathname.endsWith('/admin/stats')) return {}
  if (pathname.endsWith('/admin/audit')) return { items: [] }
  if (
    pathname.endsWith('/users/sessions')
    || pathname.endsWith('/orders/myorders')
    || pathname.endsWith('/orders/seller')
    || pathname.endsWith('/admin/users')
    || pathname.endsWith('/admin/orders')
    || pathname.endsWith('/admin/products')
    || pathname.endsWith('/admin/promotions')
    || pathname.endsWith('/reports/admin')
    || pathname.endsWith('/reviews/admin')
    || pathname.endsWith('/conversations')
  ) return []
  return {}
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gloryCookieConsent', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
    }))
  })

  // Keep layout checks deterministic while the hosted API is unavailable or slow.
  await page.route('**/api/**', async (requestRoute) => {
    const requestUrl = requestRoute.request().url()
    const pathname = new URL(requestUrl).pathname
    if (pathname.endsWith('/users/profile')) {
      await requestRoute.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Authentication required' }),
      })
      return
    }

    await requestRoute.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockApiResponse(requestUrl, {})),
    })
  })
})

test.describe.configure({ mode: 'parallel' })

for (const route of publicRoutes) {
  const routeLabel = route === '/' ? 'home page' : route

  test(`${routeLabel} remains fluid through every breakpoint`, async ({ browserName, page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(250)

    const widthsToCheck = browserName === 'webkit' ? webkitWidths : widths

    for (const width of widthsToCheck) {
      await page.setViewportSize({ width, height: heightForWidth(width) })
      await page.evaluate(() => new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      }))

      const result = await page.evaluate(findLayoutIssues)
      expect(
        result.rootWidth,
        `${route} root width at ${width}px`,
      ).toBeGreaterThanOrEqual(result.viewportWidth - 1)
      expect(
        result.documentWidth,
        `${route} document overflow at ${width}px`,
      ).toBeLessThanOrEqual(result.viewportWidth + 1)
      expect(
        result.offenders,
        `${route} clipped elements at ${width}px`,
      ).toEqual([])
    }
  })
}

test('home page keeps content readable on compact iPhones', async ({ page }) => {
  await page.goto('/ng', { waitUntil: 'domcontentloaded' })
  await page.locator('.glory-home-departments.is-gallery').waitFor()

  for (const width of [320, 375, 414]) {
    await page.setViewportSize({ width, height: heightForWidth(width) })
    await page.waitForTimeout(150)

    const layout = await page.evaluate(getCompactHomeLayout)
    expect(layout.departmentColumns, `department columns at ${width}px`).toBe(width <= 359 ? 1 : 2)
    expect(layout.departmentCardWidth, `department card width at ${width}px`).toBeGreaterThan(120)
    expect(layout.storyColumns, `editorial story columns at ${width}px`).toBe(1)
    expect(layout.sellerColumns, `seller section columns at ${width}px`).toBe(1)
    expect(layout.trustColumns, `trust columns at ${width}px`).toBe(1)
    expect(layout.footerColumns, `footer columns at ${width}px`).toBeLessThanOrEqual(2)
  }
})

for (const protectedRoute of protectedRoutes) {
  test(`${protectedRoute.route} remains fluid when authenticated`, async ({ page }) => {
    await page.addInitScript((profile) => {
      localStorage.setItem('gloryUser', JSON.stringify(profile))
    }, protectedRoute.profile)

    await page.route('**/api/**', async (requestRoute) => {
      const requestUrl = requestRoute.request().url()
      await requestRoute.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponse(requestUrl, protectedRoute.profile)),
      })
    })

    await page.goto(protectedRoute.route, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(350)

    for (const width of protectedWidths) {
      await page.setViewportSize({ width, height: heightForWidth(width) })
      await page.evaluate(() => new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      }))

      const result = await page.evaluate(findLayoutIssues)
      expect(
        result.rootWidth,
        `${protectedRoute.route} root width at ${width}px`,
      ).toBeGreaterThanOrEqual(result.viewportWidth - 1)
      expect(
        result.documentWidth,
        `${protectedRoute.route} document overflow at ${width}px`,
      ).toBeLessThanOrEqual(result.viewportWidth + 1)
      expect(
        result.offenders,
        `${protectedRoute.route} clipped elements at ${width}px`,
      ).toEqual([])
    }
  })
}
