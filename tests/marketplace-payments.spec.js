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

const installApiMocks = async (page, profile) => {
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    let body = {}
    if (pathname.endsWith('/users/csrf')) body = { csrfToken: 'marketplace-test-token' }
    if (pathname.endsWith('/users/profile')) body = profile
    if (pathname.endsWith('/stripe/seller/status')) body = sellerAccessStatus
    if (pathname.endsWith('/stripe/status')) body = { enabled: true, currency: 'GBP', marketplaceMode: 'classified', directCheckoutEnabled: false }
    if (pathname.endsWith('/products/mine') || pathname.endsWith('/conversations')) body = []
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

  await expect(page.getByText('Marketplace access', { exact: true })).toBeVisible()
  await expect(page.getByText('£20.00', { exact: true })).toBeVisible()
  await expect(page.getByText('Buyer enquiries', { exact: true })).toBeVisible()
  await expect(page.getByText('Secure payouts', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Buyer payment methods', { exact: true })).toHaveCount(0)
  await page.screenshot({
    path: path.join('test-results', 'seller-classified-marketplace-390.png'),
    fullPage: true,
  })
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
