const path = require('node:path')
const { expect, test } = require('@playwright/test')

const seller = {
  _id: 'marketplace-seller',
  name: 'Ava Seller',
  email: 'seller@example.com',
  isSeller: true,
  isAdmin: false,
  isEmailVerified: true,
  twoFactorEnabled: true,
  sellerProfile: {
    brandName: 'Ava Beauty',
    storeName: 'Ava Beauty',
    businessEmail: 'seller@example.com',
    phone: '+44 7700 900000',
    city: 'London',
    province: 'Greater London',
    country: 'United Kingdom',
    verificationStatus: 'verified',
    activationStatus: 'paid',
  },
}

const customer = {
  _id: 'marketplace-customer',
  name: 'Buyer Example',
  email: 'buyer@example.com',
  isSeller: false,
  isAdmin: false,
  isEmailVerified: true,
  twoFactorEnabled: false,
}

const sellerAccessStatus = {
  activation: { required: true, feePence: 2000, currency: 'GBP', status: 'paid' },
  marketplaceMode: 'classified',
  directCheckoutEnabled: false,
}

const approvedListing = {
  _id: 'approved-listing',
  name: 'Barrier Repair Serum',
  brand: 'Ava Beauty',
  category: 'Skincare',
  productType: 'Serum',
  image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
  price: 24,
  countInStock: 8,
  approvalStatus: 'approved',
}

const homepagePromotionPlan = {
  code: 'homepage_featured',
  placement: 'homepage_featured',
  label: 'Homepage featured placement',
  description: 'A clearly labelled sponsored placement.',
  feePence: 999,
  currency: 'GBP',
  durationDays: 7,
}

const installApiMocks = async (page, profile) => {
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    let body = {}
    if (pathname.endsWith('/users/csrf')) body = { csrfToken: 'marketplace-test-token' }
    if (pathname.endsWith('/users/profile')) body = profile
    if (pathname.endsWith('/stripe/seller/status')) body = sellerAccessStatus
    if (pathname.endsWith('/stripe/status')) body = { enabled: true, currency: 'GBP', marketplaceMode: 'classified', directCheckoutEnabled: false }
    if (pathname.endsWith('/products/mine')) body = [approvedListing]
    if (pathname.endsWith('/products')) body = [approvedListing]
    if (pathname.endsWith('/promotions/plans')) body = { items: [homepagePromotionPlan] }
    if (pathname.endsWith('/promotions/mine') || pathname.endsWith('/conversations')) body = []
    if (pathname.endsWith('/promotions/homepage')) body = {
      items: [{ id: 'homepage-promotion', placement: 'homepage_featured', label: 'Sponsored', listing: approvedListing }],
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gloryCookieConsent', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
    }))
  })
})

test('seller sees platform access and private buyer enquiries, not payout setup', async ({ page }) => {
  await page.addInitScript((profile) => {
    localStorage.setItem('gloryUser', JSON.stringify(profile))
  }, seller)
  await installApiMocks(page, seller)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/seller', { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('Marketplace access', { exact: true })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Homepage featured', { exact: true })).toBeVisible()
  await expect(page.getByText('\u00A39.99', { exact: true })).toBeVisible()
  await expect(page.getByText('£20.00', { exact: true })).toBeVisible()
  await expect(page.getByText('Buyer enquiries', { exact: true })).toBeVisible()
  await expect(page.getByText('Secure payouts', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Buyer payment methods', { exact: true })).toHaveCount(0)
  await page.screenshot({
    path: path.join('test-results', 'seller-classified-marketplace-390.png'),
    fullPage: true,
  })
})

test('homepage clearly labels active paid placement as sponsored', async ({ page }) => {
  await installApiMocks(page, customer)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const sponsoredSection = page.locator('.glory-home-sponsored')
  await expect(sponsoredSection).toBeVisible({ timeout: 15000 })
  await expect(sponsoredSection.getByRole('heading', { name: 'Featured by beauty brands.' })).toBeVisible()
  await expect(sponsoredSection.locator('.glory-product-sponsored-badge')).toHaveText('Sponsored')
  await expect(sponsoredSection.getByText('Barrier Repair Serum', { exact: true })).toBeVisible()
})

test('legacy checkout route redirects buyers to listings', async ({ page }) => {
  await page.addInitScript((profile) => {
    localStorage.setItem('gloryUser', JSON.stringify(profile))
  }, customer)
  await installApiMocks(page, customer)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/checkout', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/products$/)
  await expect(page.getByRole('heading', { name: /Beauty/i }).first()).toBeVisible()
})

test('seller brands and controlled product types appear in the catalogue structure', async ({ page }) => {
  const conditionerListing = {
    ...approvedListing,
    _id: 'conditioner-listing',
    name: 'Daily Moisture Conditioner',
    category: 'Haircare',
    productType: 'Conditioner',
  }

  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    let body = {}
    if (pathname.endsWith('/users/csrf')) body = { csrfToken: 'marketplace-test-token' }
    if (pathname.endsWith('/products')) {
      body = {
        items: [conditionerListing],
        pagination: { page: 1, pages: 1, total: 1 },
        facets: { categories: ['Haircare'], brands: ['Ava Beauty'], productTypes: ['Conditioner'] },
      }
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/products?category=Haircare&productType=Conditioner', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Conditioner' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByLabel('Product type')).toHaveValue('Conditioner')
  await expect(page.getByText('Daily Moisture Conditioner', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Brand').locator('option[value="Ava Beauty"]')).toHaveCount(1)
})

test('haircare navigation routes conditioners to the structured catalogue filter', async ({ page }) => {
  await installApiMocks(page, customer)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await page.locator('.glory-navbar-desktop-links').getByRole('link', { name: 'HAIRCARE' }).hover()
  await expect(page.getByRole('link', { name: 'Conditioners' })).toHaveAttribute(
    'href',
    '/products?category=Haircare&productType=Conditioner'
  )
})

test('mobile navigation exposes the conditioner catalogue route', async ({ page }) => {
  await installApiMocks(page, customer)
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page.getByRole('button', { name: 'Show haircare product types' }).click()
  await expect(page.getByRole('link', { name: 'Conditioners' })).toHaveAttribute(
    'href',
    '/products?category=Haircare&productType=Conditioner'
  )
})
