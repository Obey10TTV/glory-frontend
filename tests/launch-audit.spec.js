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
      const listings = options.listings || [listing]
      if (url.searchParams.get('meta') === 'true') {
        return send({
          items: listings,
          pagination: { page: 1, pages: 1, total: listings.length },
          facets: { categories: ['Haircare'], brands: ['Launch Beauty'], productTypes: ['Conditioner'] },
        })
      }
      return send(listings)
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

test('UK latest arrivals wrap into full cards on desktop and phones', async ({ page }) => {
  const listings = Array.from({ length: 8 }, (_, index) => ({
    ...listing,
    _id: `arrival-${index}`,
    name: `New conditioner ${index + 1}`,
  }))
  await installMocks(page, { listings })
  const arrivals = page.getByRole('region', { name: 'The latest on the shelf.' })
  const cards = arrivals.locator('.glory-product-card')

  for (const [width, columns] of [[1280, 3], [375, 2]]) {
    await page.setViewportSize({ width, height: 780 })
    await page.goto('/gb')
    await expect(cards).toHaveCount(8)
    const boxes = await cards.evaluateAll((items) => items.map((item) => {
      const rect = item.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width }
    }))
    expect(boxes.every((box) => box.width > 120 && box.x + box.width <= width)).toBe(true)
    expect(boxes[columns].y).toBeGreaterThan(boxes[0].y)
    await expect(cards.first().locator('.glory-product-card-name')).toHaveCSS('font-size', '16px')
    await expect(cards.first().locator('.glory-product-image-frame')).toHaveCSS('overflow', 'hidden')
    await expect(cards.first().locator('.glory-product-media')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(cards.first().getByText('Product photo unavailable')).toBeVisible()
  }
})

test('regional heroes start with WebP images and play the film only when selected', async ({ page }) => {
  await installMocks(page)
  await page.setViewportSize({ width: 390, height: 830 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [region, asset] of [['gb', 'uk-ritual'], ['us', 'us-makeup'], ['ca', 'canada-ritual']]) {
    await page.goto(`/${region}`)
    const stage = page.locator('.glory-home-stage')
    const active = stage.locator('img.is-active')
    await expect.poll(() => active.evaluate(image => image.complete ? image.currentSrc : '')).toContain(`${asset}-hero-mobile.webp`)
    await expect(stage.locator('.glory-home-stage-actions .is-secondary')).toHaveCSS('background-color', 'rgb(113, 28, 68)')
    await expect(stage.locator('video')).toHaveCount(0)
  }

  const stage = page.locator('.glory-home-stage')
  await stage.getByRole('tab', { name: /Find a scent that feels like you/ }).click()
  await expect(stage.locator('img.is-active')).toHaveAttribute('src', '/images/home/fragrance-film-poster.webp')
  await expect(stage.locator('video')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const film = stage.locator('video.is-active')
  await expect.poll(() => film.evaluate(video => video.currentTime)).toBeGreaterThan(0)
  await stage.getByRole('button', { name: 'Pause hero motion' }).click()
  await expect(stage.locator('video')).toHaveCount(0)
})

test('anonymous visitor can follow primary CTAs and reaches OTP-gated seller signup', async ({ page }) => {
  await installMocks(page)
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Beauty, in all your glory.' })).toBeVisible()
  await page.getByRole('button', { name: 'Start selling' }).click()
  await expect(page).toHaveURL(/\/register\?type=seller$/)
  await expect(page.getByPlaceholder('e.g. Glow Lab Beauty')).toBeVisible()
  await expect(page.getByRole('button', { name: /Sell Start my store/ })).toHaveCSS('background-color', 'rgb(17, 17, 17)')

  await page.goto('/register')
  await expect(page.getByRole('link', { name: 'Privacy Policy', exact: true })).toHaveAttribute('href', '/privacy')
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

test('Skin Guide responds locally to a self-harm disclosure', async ({ page }) => {
  await page.addInitScript(profile => localStorage.setItem('gloryUser', JSON.stringify(profile)), buyer)
  await installMocks(page, { profile: buyer })
  await page.route('**/api/skin-guide/status', route => route.fulfill({ json: { available: true } }))
  const submittedQuestions = []
  page.on('request', request => {
    if (request.url().endsWith('/api/skin-guide/messages')) submittedQuestions.push(request)
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open Glory support' }).click()
  await page.getByRole('textbox', { name: 'Skin Guide question' }).fill('I want to hurt myself')
  await page.getByRole('button', { name: 'Send question' }).click()
  await expect(page.getByText(/call your local emergency services now/i).last()).toBeVisible()
  await expect(page.getByText('I want to hurt myself', { exact: true })).toHaveCount(0)
  expect(submittedQuestions).toHaveLength(0)
})

test('paid sellers can open the cancellation flow directly', async ({ page }) => {
  const verifiedSeller = makeSeller()
  await page.addInitScript(profile => localStorage.setItem('gloryUser', JSON.stringify(profile)), verifiedSeller)
  await installMocks(page, { profile: verifiedSeller })
  await page.route('**/api/marketplace/seller/status', route => route.fulfill({ json: {
    ...sellerStatus,
    membership: { ...sellerStatus.membership, planCode: 'studio', requestedPlanCode: 'studio' }
  } }))
  await page.route('**/api/stripe/seller/subscription/portal', route => route.fulfill({
    json: { url: '/seller?billing=mock' }
  }))
  await page.goto('/seller')
  const cancelButton = page.getByRole('button', { name: 'Cancel paid plan' })
  await expect(cancelButton).toBeVisible()
  const [request] = await Promise.all([
    page.waitForRequest(request => request.url().endsWith('/api/stripe/seller/subscription/portal')),
    cancelButton.click()
  ])
  expect(request.postDataJSON()).toEqual({ action: 'cancel' })
  await expect(page).toHaveURL(/\/seller\?billing=mock$/)
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

test('marketplace picker keeps circular country flags and works on desktop and mobile', async ({ page }) => {
  await installMocks(page)
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 820 })
    await page.goto('/gb')
    if (width > 1024) {
      await page.getByRole('button', { name: /Change marketplace. Current marketplace United Kingdom/ }).click()
    } else {
      await page.getByRole('button', { name: 'Open navigation menu' }).click()
      await page.getByRole('button', { name: /United Kingdom.*Change marketplace/ }).click()
    }
    const dialog = page.getByRole('dialog', { name: 'Choose your marketplace' })
    await expect(dialog).toBeVisible()
    const usa = dialog.getByRole('button', { name: /United States/ })
    const flag = usa.locator('img')
    await expect.poll(() => flag.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
    await expect(flag).toHaveCSS('border-radius', '50%')
    const flagBounds = await flag.boundingBox()
    expect(flagBounds.width).toBe(flagBounds.height)
    const dialogBounds = await dialog.boundingBox()
    expect(dialogBounds.x).toBeGreaterThanOrEqual(0)
    expect(dialogBounds.x + dialogBounds.width).toBeLessThanOrEqual(width)
    await dialog.getByRole('searchbox', { name: 'Search countries' }).fill('USD')
    await expect(dialog.getByRole('button', { name: /United Kingdom/ })).toHaveCount(0)
    await usa.click()
    await expect(page).toHaveURL(/\/us$/)
    await expect(dialog).toHaveCount(0)
  }
})

test('one-letter navbar search shows suggestions and keeps the query on the results page', async ({ page }) => {
  await installMocks(page)
  await page.route('**/api/products/suggestions?*', route => {
    const params = new URL(route.request().url()).searchParams
    expect(params.get('q')).toBe('a')
    return route.fulfill({ json: {
      items: params.get('market') === 'GB' ? [{ ...listing, name: 'Aloe Cleanser' }] : []
    } })
  })
  await page.setViewportSize({ width: 1440, height: 820 })
  await page.goto('/gb')
  const search = page.getByRole('textbox', { name: 'Search products', exact: true })
  await search.fill('a')
  await expect(page.getByRole('link', { name: /Aloe Cleanser/ })).toBeVisible()
  await search.press('Enter')
  await expect(page).toHaveURL(/\/products\?q=a$/)
  await page.setViewportSize({ width: 375, height: 820 })
  await page.goto('/us')
  await page.getByRole('button', { name: 'Open search' }).click()
  await search.fill('a')
  await expect(page.getByText('No matches in United States.')).toBeVisible()
})

test('public help, policy and seller pages load their editorial art without overflowing', async ({ page }) => {
  await installMocks(page)
  for (const [route, image] of [
    ['/faq', 'shopping-help'],
    ['/seller-faq', 'seller-studio'],
    ['/paid-promotion-terms', 'paid-visibility'],
    ['/privacy', 'trust-and-privacy']
  ]) {
    await page.setViewportSize({ width: route === '/faq' ? 375 : 1440, height: 820 })
    await page.goto(route)
    const picture = page.locator('.glory-info-hero-art')
    await expect(picture).toHaveAttribute('src', `/images/editorial/${image}.webp`)
    await expect.poll(() => picture.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true)
    const box = await picture.boundingBox()
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width)
  }

  await page.goto('/seller-pricing')
  for (const [selector, asset] of [
    ['.glory-pricing-hero .glory-pricing-shell', 'seller-studio'],
    ['.glory-pricing-visibility .glory-pricing-heading', 'paid-visibility']
  ]) {
    await expect.poll(() => page.locator(selector).evaluate(element => getComputedStyle(element, '::after').backgroundImage)).toContain(`${asset}.webp`)
    const response = await page.request.get(`/images/editorial/${asset}.webp`)
    expect(response.headers()['content-type']).toContain('image/webp')
  }
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

test('seller can report a missing payment and decline transaction confirmation', async ({ page }) => {
  const profile = makeSeller()
  await page.addInitScript(user => localStorage.setItem('gloryUser', JSON.stringify(user)), profile)
  await installMocks(page, { profile })
  await page.route('**/api/conversations', route => route.fulfill({ json: [{
    _id: 'payment-thread', listing, buyer, seller: profile, participantRole: 'seller',
    status: 'open', transactionStatus: 'buyer_confirmed', messages: []
  }] }))
  const confirmationRequests = []
  page.on('request', request => {
    if (request.url().endsWith('/transaction-confirmation')) confirmationRequests.push(request)
  })
  await page.route('**/api/reports/conversations/payment-thread/payment-fraud', route => {
    expect(route.request().postDataJSON()).toEqual({ detail: 'I checked my account and the payment disappeared.' })
    return route.fulfill({ status: 201, json: { reference: 'test-case' } })
  })
  await page.goto('/messages?thread=payment-thread')
  await expect(page.getByText('Check payment before handing over goods.')).toBeVisible()
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('checked your own bank')
    await dialog.dismiss()
  })
  await page.getByRole('button', { name: 'Confirm completed transaction' }).click()
  await page.getByText('Report suspected payment fraud', { exact: true }).click()
  await page.getByLabel('What happened?').fill('I checked my account and the payment disappeared.')
  await page.getByRole('button', { name: 'Send confidential report' }).click()
  await expect(page.getByText(/Reference test-case/)).toBeVisible()
  expect(confirmationRequests).toHaveLength(0)
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
