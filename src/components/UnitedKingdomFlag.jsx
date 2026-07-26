const UnitedKingdomFlag = ({ size = 24, title = 'United Kingdom' }) => {
  const width = size
  const height = Math.round(size * 0.6)

  return (
    <svg
      className='glory-uk-flag'
      width={width}
      height={height}
      viewBox='0 0 60 36'
      role='img'
      aria-label={title}
      focusable='false'
    >
      <rect width='60' height='36' fill='#012169' />
      <path d='M0 0 60 36M60 0 0 36' stroke='#fff' strokeWidth='8' />
      <path d='M0 0 60 36M60 0 0 36' stroke='#c8102e' strokeWidth='4' />
      <path d='M30 0v36M0 18h60' stroke='#fff' strokeWidth='10' />
      <path d='M30 0v36M0 18h60' stroke='#c8102e' strokeWidth='6' />
    </svg>
  )
}

export default UnitedKingdomFlag
