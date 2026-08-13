export const categoryProductTypes = Object.freeze({
  Skincare: [
    'Cleanser', 'Toner', 'Serum', 'Moisturiser', 'Face Mask',
    'SPF', 'Exfoliant', 'Eye Care', 'Lip Care', 'Other Skincare'
  ],
  Haircare: [
    'Shampoo', 'Conditioner', 'Leave-in Conditioner', 'Hair Oil',
    'Hair Mask', 'Scalp Treatment', 'Growth Serum', 'Styling Product',
    'Heat Protectant', 'Hair Colour', 'Other Haircare'
  ],
  Makeup: [
    'Foundation', 'Concealer', 'Powder', 'Blush', 'Bronzer',
    'Highlighter', 'Eyeshadow', 'Eyeliner', 'Mascara', 'Lipstick',
    'Lip Gloss', 'Setting Spray', 'Other Makeup'
  ],
  Nails: [
    'Nail Polish', 'Gel Polish', 'Nail Treatment', 'Press-on Nails',
    'Nail Extension', 'Nail Care Tool', 'Other Nails'
  ],
  Lashes: [
    'Strip Lashes', 'Individual Lashes', 'Lash Extension',
    'Lash Adhesive', 'Lash Care', 'Other Lashes'
  ],
  'Body Care': [
    'Body Wash', 'Body Lotion', 'Body Butter', 'Body Scrub',
    'Deodorant', 'Hand Care', 'Other Body Care'
  ],
  'Body Liquid': [
    'Body Oil', 'Body Mist', 'Bath Oil', 'Shower Oil', 'Other Body Liquid'
  ],
  Fragrance: [
    'Eau de Parfum', 'Eau de Toilette', 'Perfume Oil',
    'Fragrance Mist', 'Gift Set', 'Other Fragrance'
  ],
  'Scented Candles': [
    'Jar Candle', 'Pillar Candle', 'Wax Melt', 'Candle Gift Set',
    'Other Home Fragrance'
  ],
  'Tools & Accessories': [
    'Brush', 'Applicator', 'Beauty Device', 'Storage', 'Hair Tool', 'Other Tool'
  ]
})

export const productTypesForCategory = (category) => categoryProductTypes[category] || []
