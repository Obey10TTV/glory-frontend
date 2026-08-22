export const PRODUCT_IMAGE_BACKGROUNDS = {
  white: '#ffffff',
  black: '#171514',
  berry: '#7f2447'
}

const isProcessedImageAvailable = (product) => {
  const processing = product?.imageProcessing
  return Boolean(
    processing?.useProcessedImage !== false
    && processing?.processedImageUrl
    && processing?.processingStatus !== 'failed'
    && processing?.processingStatus !== 'not_requested'
  )
}

export const getProductImageUrl = (product, size = 'card') => {
  const processing = product?.imageProcessing
  if (!isProcessedImageAvailable(product)) return product?.image || ''

  if (size === 'thumbnail') return processing.thumbnailImageUrl || processing.processedImageUrl
  if (size === 'detail') return processing.processedImageUrl || processing.highResolutionImageUrl
  if (size === 'highResolution') return processing.highResolutionImageUrl || processing.processedImageUrl
  return processing.cardImageUrl || processing.processedImageUrl
}

export const getProductOriginalImageUrl = (product) => (
  product?.imageProcessing?.originalImageUrl || product?.image || ''
)

export const getProductImageBackground = (product) => (
  PRODUCT_IMAGE_BACKGROUNDS[product?.imageProcessing?.presentationBackground] || PRODUCT_IMAGE_BACKGROUNDS.white
)
