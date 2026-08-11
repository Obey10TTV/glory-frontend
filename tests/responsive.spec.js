const { expect, test } = require('@playwright/test')

const publicRoutes = [
  '/',
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
  '/careers',
  '/press',
  '/affiliates',
  '/blog',
  '/community',
  '/sell-on-glory',
  '/seller-resources',
  '/seller-agreement',
  '/seller-pricing',
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
    country: 'United Kingdom',
    verificationStatus: 'verified',
    activationStatus: 'paid',
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

const mockApiResponse = (pathname, profile) => {
  if (pathname.endsWith('/users/profile')) return profile
  if (pathname.endsWith('/users/csrf')) return { csrfToken: 'responsive-test-token' }
  if (pathname.endsWith('/stripe/seller/status')) {
    return {
      activation: { required: true, feePence: 2000, currency: 'GBP', status: 'paid' },
      payouts: {
        status: 'active',
        detailsSubmitted: true,
        chargesEnabled: true,
        payoutsEnabled: true,
      },
      acceptedPaymentMethods: ['card'],
      paymentMethods: [{
        code: 'card',
        label: 'Credit or debit card',
        description: 'Visa, Mastercard and supported cards through Stripe.',
        enabled: true,
      }],
    }
  }
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
  if (pathname === '/api/products' || pathname.includes('/reviews')) return []
  if (pathname.endsWith('/admin/stats')) return {}
  if (pathname.endsWith('/admin/audit')) return { items: [] }
  if (
    pathname.endsWith('/users/sessions')
    || pathname.endsWith('/orders/myorders')
    || pathname.endsWith('/orders/seller')
    || pathname.endsWith('/products/mine')
    || pathname.endsWith('/admin/users')
    || pathname.endsWith('/admin/orders')
    || pathname.endsWith('/admin/products')
    || pathname.endsWith('/reports/admin')
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
    const pathname = new URL(requestRoute.request().url()).pathname
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
      body: JSON.stringify(mockApiResponse(pathname, {})),
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

for (const protectedRoute of protectedRoutes) {
  test(`${protectedRoute.route} remains fluid when authenticated`, async ({ page }) => {
    await page.addInitScript((profile) => {
      localStorage.setItem('gloryUser', JSON.stringify(profile))
    }, protectedRoute.profile)

    await page.route('**/api/**', async (requestRoute) => {
      const pathname = new URL(requestRoute.request().url()).pathname
      await requestRoute.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponse(pathname, protectedRoute.profile)),
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
