import { FiImage } from 'react-icons/fi'

const ProductPhotoPlaceholder = () => (
  <div className='glory-product-photo-placeholder'>
    <FiImage size={24} aria-hidden='true' />
    <span>Product photo unavailable</span>
  </div>
)

export default ProductPhotoPlaceholder
