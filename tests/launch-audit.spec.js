const { expect, test } = require('@playwright/test')

const listing = {
  _id: 'launch-listing',
  name: 'Daily Moisture Conditioner',
  brand: 'Launch Beauty',
  category: 'Haircare',
  productType: 'Conditioner',
  image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
  images: [],
  price: 24,
  description: 'A carefully described conditioner from an independent Glory seller.',
  ingredients: 'Water, conditioning agents and fragrance.',
  howToUse: 'Apply after shampooing and rinse thoroughly.',
  keyBenefits: ['Softens hair', 'Supports detangling'],
  countInStock: 8,
  approvalStatus: 'approved',
  acceptedPaymentMethods: ['card'],
  seller: {
    _id: 'launch-seller',
    name: 'Sasha Seller',
    sellerProfile: {
      storeName: 'Launch Beauty',
      verificationStatus: 'verified',
      returnPolicy: 'returns_accepted',
      responseTimeCommitment: 'within_24_hours',
    },
  },
  listingEvidence: { status: 'reviewed', brandAuthorisationStatus: 'authorised' },
  createdAt: '2026-08-12T12:00:00.000Z',
}

const buyer = {
  _id: 'launch-buyer',
  name: 'Bianca Buyer',
  email: 'buyer@example.com',
  isEmailVerified: true,
  isSeller: false,
  isAdmin: false,
  twoFactorEnabled: false,
}

const sellerPlans = [
  { code: 'starter', label: 'Starter', description: 'Start a verified catalogue.', feePence: 0, currency: 'GBP', interval: null, activeListingLimit: 5, promotionDiscountBps: 0, features: ['Up to 5 active listings', 'Verified-interaction reviews'] },
  { code: 'studio', label: 'Studio', description: 'For growing beauty businesses.', feePence: 5900, currency: 'GBP', interval: 'month', activeListingLimit: 50, promotionDiscountBps: 1000, features: ['Up to 50 active listings', '10% off paid visibility'] },
  { code: 'scale', label: 'Scale', description: 'For established catalogues.', feePence: 14900, currency: 'GBP', interval: 'month', activeListingLimit: 200, promotionDiscountBps: 2000, features: ['Up to 200 active listings', '20% off paid visibility'] },
  { code: 'partner', label: 'Brand Partner', description: 'For high-volume brands.', feePence: 39900, currency: 'GBP', interval: 'month', activeListingLimit: 750, promotionDiscountBps: 2500, features: ['Up to 750 active listings', '25% off paid visibility'] },
]

const makeSeller = ({ verified = true } = {}) => ({
  ...buyer,
  _id: 'launch-seller',
  name: 'Sasha Seller',
  email: 'seller@example.com',
  isSeller: true,
  twoFactorEnabled: verified,
  sellerProfile: {
    brandName: 'Launch Beauty',
    storeName: 'Launch Beauty',
    businessEmail: 'seller@example.com',
    phone: '+44 7700 900000',
    city: 'London',
    province: 'Greater London',
    country: 'United Kingdom',
    businessType: 'independent_seller',
    taxStatus: 'not_registered',
    verificationStatus: verified ? 'verified' : 'incomplete',
    activationStatus: 'waived',
    membershipPlanCode: 'starter',
    membershipStatus: 'active',
    identityVerification: {
      provider: verified ? 'stripe_identity' : 'none',
      status: verified ? 'verified' : 'not_started',
    },
    documents: [],
  },
})

const promotionPlan = {
  code: 'homepage_spotlight_7',
  placement: 'homepage_featured',
  label: 'Homepage Spotlight',
  description: 'A clearly labelled sponsored placement.',
  feePence: 8900,
  currency: 'GBP',
  durationDays: 7,
  recommended: true,
}

const sellerStatus = {
  activation: { required: false, feePence: 4900, currency: 'GBP', status: 'waived' },
  membership: { planCode: 'starter', status: 'active', activeListingLimit: 5, promotionDiscountBps: 0 },
  sellerPlans,
  marketplaceMode: 'classified',
  directCheckoutEnabled: false,
}

const installMocks = async (page, options = {}) => {
  let reviewSubmitted = false
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const pathname = url.pathname
    const method = request.method()
    const profile = options.profile || null

    const send = (body, status = 200) => route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })

    if (pathname.endsWith('/users/csrf')) return send({ csrfToken: 'launch-audit-csrf' })
    if (pathname.endsWith('/users/profile')) {
      return options.expired || !profile
        ? send({ message: 'Session has expired' }, 401)
        : send(profile)
    }
    if (pathname.endsWith('/users/refresh')) return send({ message: 'Session has expired' }, 401)
    if (pathname.endsWith('/users/auth-options')) return send({ google: { enabled: false, clientId: '' } })
    if (pathname.endsWith('/users/register') && method === 'POST') {
      return send({
        requiresEmailVerification: true,
        email: 'new.seller@example.com',
        isSeller: true,
        message: 'We sent a verification code to your email.',
      }, 201)
    }
    if (pathname.endsWith('/users/verify-email') && method === 'POST') return send(makeSeller())

    if (pathname === '/api/products' && options.productFailure) {
      return send({ message: 'Catalogue unavailable' }, 503)
    }
    if (pathname === '/api/products') {
      if (url.searchParams.get('meta') === 'true') {
        return send({
          items: [listing],
          pagination: { page: 1, pages: 1, total: 1 },
          facets: { categories: ['Haircare'], brands: ['Launch Beauty'], productTypes: ['Conditioner'] },
        })
      }
      return send([listing])
    }
    if (pathname === `/api/products/${listing._id}`) return send(listing)
    if (pathname.endsWith('/products/mine')) return send(profile?.sellerProfile?.verificationStatus === 'verified' ? [listing] : [])

    if (pathname.endsWith('/stripe/status')) return send({ enabled: true, currency: 'GBP', marketplaceMode: 'classified', directCheckoutEnabled: false })
    if (pathname.endsWith('/stripe/seller/status')) return send(sellerStatus)
    if (pathname.endsWith('/stripe/seller/identity/status')) return send(profile?.sellerProfile?.identityVerification || { provider: 'none', status: 'not_started' })
    if (pathname.includes('/stripe/seller/subscription/verify/')) {
      return options.paymentFailure
        ? send({ message: 'Payment confirmation could not be verified.' }, 409)
        : send({ paymentStatus: 'paid', membershipStatus: 'active', planCode: 'studio' })
    }

    if (pathname.endsWith('/promotions/plans')) return send({ items: [promotionPlan] })
    if (pathname.endsWith('/promotions/homepage')) return options.productFailure ? send({ message: 'Unavailable' }, 503) : send({ items: [] })
    if (pathname.endsWith('/promotions/mine')) return send([])

    if (pathname.endsWith('/conversations')) {
      return send(profile?._id === buyer._id ? [{
        _id: 'confirmed-thread',
        listing,
        buyer,
        seller: listing.seller,
        participantRole: 'buyer',
        status: 'open',
        transactionStatus: 'confirmed',
        buyerConfirmedAt: '2026-08-12T13:00:00.000Z',
        sellerConfirmedAt: '2026-08-12T13:05:00.000Z',
        completedAt: '2026-08-12T13:05:00.000Z',
        review: reviewSubmitted ? { _id: 'pending-review', status: 'pending' } : undefined,
        messages: [
          { _id: 'buyer-message', sender: buyer, body: 'Is this conditioner still available?', sentAt: '2026-08-12T12:30:00.000Z' },
          { _id: 'seller-message', sender: listing.seller, body: 'Yes, it is available.', sentAt: '2026-08-12T12:35:00.000Z' },
        ],
        lastMessageAt: '2026-08-12T12:35:00.000Z',
      }] : [])
    }
    if (pathname === `/api/reviews/${listing._id}` && method === 'POST') {
      reviewSubmitted = true
      return send({ message: 'Your review is in moderation. Positive and negative reviews receive the same checks.' }, 201)
    }
    if (pathname === `/api/reviews/${listing._id}`) return send([])

    if (pathname.endsWith('/admin/stats')) return send({ totalUsers: 3, totalProducts: 1 })
    if (pathname.endsWith('/admin/users') || pathname.endsWith('/admin/orders') || pathname.endsWith('/admin/products')) return send([])
    if (pathname.endsWith('/admin/audit')) return send({ items: [] })
    if (pathname.endsWith('/reports/admin')) return send([{
      _id: 'critical-report',
      reason: 'unsafe_product',
      detail: 'The label appears to show a recalled batch.',
      priority: 'critical',
      slaState: 'on_track',
      triageDueAt: '2026-08-13T13:00:00.000Z',
      status: 'received',
      listing,
      seller: listing.seller,
      reporter: buyer,
      createdAt: '2026-08-13T12:00:00.000Z',
    }])
    if (pathname.endsWith('/reviews/admin')) return send([{
      _id: 'moderation-review',
      reviewerName: 'Bianca Buyer',
      rating: 2,
      comment: 'The packaging did not match the listing photos.',
      status: 'pending',
      verifiedInteraction: true,
      riskSignals: ['new_account'],
      reportCount: 1,
      listing,
      reviewer: buyer,
      seller: listing.seller,
      createdAt: '2026-08-13T12:00:00.000Z',
    }])
    if (pathname.endsWith('/users/sessions') || pathname.endsWith('/orders/myorders') || pathname.endsWith('/orders/seller')) return send([])

    return send({})
  })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gloryCookieConsent', JSON.stringify({ essential: true, analytics: false, marketing: false }))
  })
})

test('anonymous visitor can follow primary CTAs and reaches OTP-gated seller signup', async ({ page }) => {
  await installMocks(page)
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Beauty, in all your glory.' })).toBeVisible()
  await page.getByRole('button', { name: 'Start selling' }).click()
  await expect(page).toHaveURL(/\/sell-on-glory$/)
  await expect(page.getByRole('heading', { name: 'Turn your beauty brand into a real store.' })).toBeVisible()

  await page.goto('/register')
  await expect(page.getByRole('button', { name: 'Sign up with Google' })).toBeVisible()
  await page.getByRole('button', { name: /Sell Start my store/ }).click()
  await page.getByPlaceholder('e.g. Glow Lab Beauty').fill('New Seller Studio')
  await page.getByPlaceholder('Your full name').fill('New Seller')
  await page.getByPlaceholder('you@example.com').fill('new.seller@example.com')
  await page.getByPlaceholder('Create a strong password').fill('StrongPass1!')
  await page.getByPlaceholder('Confirm your password').fill('StrongPass1!')
  await page.getByRole('button', { name: 'Create Account' }).click()

  await expect(page.getByText('Email OTP required')).toBeVisible()
  await expect(page.getByPlaceholder('000000')).toBeVisible()
})

test('catalogue filters, search and product deep links stay functional', async ({ page }) => {
  await installMocks(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/products?category=Haircare&productType=Conditioner')

  await expect(page.getByRole('heading', { name: 'Conditioner' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByLabel('Product type')).toHaveValue('Conditioner')
  await expect(page.getByLabel('Brand').locator('option[value="Launch Beauty"]')).toHaveCount(1)
  await page.getByLabel('Search products and brands').fill('Daily Moisture')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/q=Daily\+Moisture/)
  await page.getByText('Daily Moisture Conditioner', { exact: true }).first().click()
  await expect(page).toHaveURL(/\/products\/launch-listing$/)
  await expect(page.getByRole('heading', { name: 'Daily Moisture Conditioner' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Report listing/i })).toBeVisible()
})

test('buyer can review only from a mutually confirmed interaction', async ({ page }) => {
  await page.addInitScript(profile => localStorage.setItem('gloryUser', JSON.stringify(profile)), buyer)
  await installMocks(page, { profile: buyer })
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/messages?thread=confirmed-thread')

  await expect(page.getByText('Buyer and seller both confirmed that this transaction took place.')).toBeVisible()
  await expect(page.getByText('Review this interaction')).toBeVisible()
  await page.getByRole('button', { name: '2 stars' }).click()
  await page.getByPlaceholder('Describe what genuinely happened, whether positive or negative.').fill('The product was genuine, but the packaging arrived damaged.')
  await page.getByRole('button', { name: 'Submit for moderation' }).click()
  await expect(page.getByText('Review pending')).toBeVisible()
})

test('unverified seller is gated while verified seller sees plans and cancelled checkout state', async ({ page }) => {
  const unverifiedSeller = makeSeller({ verified: false })
  await page.addInitScript(profile => localStorage.setItem('gloryUser', JSON.stringify(profile)), unverifiedSeller)
  await installMocks(page, { profile: unverifiedSeller })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/seller')

  await expect(page.getByText('Finish seller security before listing products.')).toBeVisible()
  await expect(page.getByRole('button', { name: /Add Listing/ })).toBeDisabled()
  await expect(page.getByText('Hosted government photo-ID check')).toBeVisible()

  const verifiedSeller = makeSeller()
  await page.evaluate(profile => localStorage.setItem('gloryUser', JSON.stringify(profile)), verifiedSeller)
  await page.unroute('**/api/**')
  await installMocks(page, { profile: verifiedSeller })
  await page.goto('/seller?membership=cancelled')
  await expect(page.getByText('Checkout was cancelled. Nothing was charged and your current seller access has not changed.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Scale' })).toBeVisible()
  await expect(page.getByText('£149.00', { exact: true })).toBeVisible()
})

test('administrator sees safety SLA and neutral review detection queues', async ({ page }) => {
  const admin = { ...makeSeller(), _id: 'launch-admin', name: 'Glory Admin', email: 'admin@example.com', isAdmin: true }
  await page.addInitScript(profile => localStorage.setItem('gloryUser', JSON.stringify(profile)), admin)
  await installMocks(page, { profile: admin })
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto('/admin')

  await page.getByRole('tab', { name: 'reports' }).click()
  await expect(page.getByText('critical', { exact: true })).toBeVisible()
  await expect(page.getByText(/on track/i)).toBeVisible()
  await page.getByRole('tab', { name: 'reviews' }).click()
  await expect(page.getByText('The packaging did not match the listing photos.')).toBeVisible()
  await expect(page.getByText('new account')).toBeVisible()
  await expect(page.getByText('verified interaction')).toBeVisible()
})

test('catalogue failure and expired session have clear recovery behaviour', async ({ page }) => {
  await installMocks(page, { productFailure: true })
  await page.goto('/')
  await expect(page.getByText('The live edit is taking a short pause.').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' }).first()).toBeVisible()

  await page.unroute('**/api/**')
  await page.evaluate(profile => localStorage.setItem('gloryUser', JSON.stringify(profile)), buyer)
  await installMocks(page, { profile: buyer, expired: true })
  await page.goto('/messages')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText('Welcome back', { exact: true })).toBeVisible()
})

test('keyboard users can reach the main navigation and form controls', async ({ browserName, page }) => {
  await installMocks(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/register')
  if (browserName === 'webkit') {
    await page.locator('.glory-skip-link').focus()
  } else {
    await page.keyboard.press('Tab')
  }
  await expect(page.locator('.glory-skip-link')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#glory-main')).toBeFocused()
  await page.getByPlaceholder('Your full name').focus()
  await page.keyboard.type('Keyboard User')
  await expect(page.getByPlaceholder('Your full name')).toHaveValue('Keyboard User')
})
