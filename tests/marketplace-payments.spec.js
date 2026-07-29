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
    payoutStatus: 'active',
    acceptedPaymentMethods: ['card'],
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

const paymentStatus = {
  activation: { required: true, feePence: 2000, currency: 'GBP', status: 'paid' },
  payouts: {
    status: 'active',
    detailsSubmitted: true,
    chargesEnabled: true,
    payoutsEnabled: true,
  },
  acceptedPaymentMethods: ['card'],
  paymentMethods: [
    {
      code: 'card',
      label: 'Credit or debit card',
      description: 'Visa, Mastercard and other supported cards through Stripe.',
      enabled: true,
    },
    {
      code: 'bank_transfer',
      label: 'Bank payment',
      description: 'Unavailable until provider reconciliation and refund handling are configured.',
      enabled: false,
    },
    {
      code: 'crypto',
      label: 'Crypto payment',
      description: 'Unavailable until a compliant payment provider and refund process are configured.',
      enabled: false,
    },
  ],
}

const installApiMocks = async (page, profile) => {
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    let body = {}
    if (pathname.endsWith('/users/csrf')) body = { csrfToken: 'marketplace-test-token' }
    if (pathname.endsWith('/users/profile')) body = profile
    if (pathname.endsWith('/stripe/seller/status')) body = paymentStatus
    if (pathname.endsWith('/stripe/status')) body = { enabled: true, currency: 'GBP' }
    if (pathname.endsWith('/orders/checkout-options')) {
      body = {
        currency: 'GBP',
        itemsPrice: 49,
        shippingPrice: 4.95,
        totalPrice: 53.95,
        compatibleMethods: ['card'],
        sellerCount: 2,
      }
    }
    if (
      pathname.endsWith('/products/mine')
      || pathname.endsWith('/orders/seller')
      || pathname.endsWith('/orders/myorders')
    ) body = []
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

test('seller sees activation, payout and approved buyer payment states', async ({ page }) => {
  await page.addInitScript((profile) => {
    localStorage.setItem('gloryUser', JSON.stringify(profile))
  }, seller)
  await installApiMocks(page, seller)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/seller', { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('Payments & Payouts', { exact: true })).toBeVisible()
  await expect(page.getByText('£20.00', { exact: true })).toBeVisible()
  await expect(page.getByText('Payouts active', { exact: true })).toBeVisible()
  await expect(page.getByText('Bank payment', { exact: true })).toBeVisible()
  await expect(page.getByText('Crypto payment', { exact: true })).toBeVisible()
  await page.screenshot({
    path: path.join('test-results', 'seller-payments-390.png'),
    fullPage: true,
  })
})

test('multi-seller checkout presents one compatible buyer payment', async ({ page }) => {
  await page.addInitScript(({ profile, cart }) => {
    localStorage.setItem('gloryUser', JSON.stringify(profile))
    localStorage.setItem('gloryCart', JSON.stringify(cart))
  }, {
    profile: customer,
    cart: [
      {
        _id: '111111111111111111111111',
        name: 'Glow Serum',
        image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg',
        price: 24,
        quantity: 1,
      },
      {
        _id: '222222222222222222222222',
        name: 'Silk Hair Oil',
        image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
        price: 25,
        quantity: 1,
      },
    ],
  })
  await installApiMocks(page, customer)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/checkout', { waitUntil: 'domcontentloaded' })

  const country = page.getByPlaceholder('United Kingdom', { exact: true })
  await country.fill('United Kingdom')
  await expect(page.getByText('£53.95', { exact: true })).toBeVisible()
  await expect(page.getByText('Glory could not verify payment options for this basket.')).toHaveCount(0)
  await page.screenshot({
    path: path.join('test-results', 'multi-seller-checkout-390.png'),
    fullPage: true,
  })
})
