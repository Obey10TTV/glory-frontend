const CanadaFlag = ({ size = 24, title = 'Canada' }) => {
  const width = size
  const height = Math.round(size * 0.62)

  return (
    <svg
      className='glory-canada-flag'
      width={width}
      height={height}
      viewBox='0 0 64 40'
      role='img'
      aria-label={title}
      focusable='false'
    >
      <rect width='64' height='40' rx='6' fill='#fff' />
      <rect width='16' height='40' rx='6' fill='#d80621' />
      <rect x='48' width='16' height='40' rx='6' fill='#d80621' />
      <rect x='14' width='4' height='40' fill='#fff' />
      <rect x='46' width='4' height='40' fill='#fff' />
      <path
        fill='#d80621'
        d='M32 6.5 35.4 15l7.4-2.4-3.9 6.9 7.9 2.7-8.6 2.1 1.8 8-6.2-4.8v7.8h-3.6v-7.8L24 32.3l1.8-8-8.6-2.1 7.9-2.7-3.9-6.9 7.4 2.4L32 6.5z'
      />
    </svg>
  )
}

export default CanadaFlag
