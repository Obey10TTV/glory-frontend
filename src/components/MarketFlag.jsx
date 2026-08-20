const MarketFlag = ({ market, size = 24 }) => (
  <span
    className='glory-market-flag'
    role='img'
    aria-label={`${market.name} flag`}
    style={{ fontSize: `${size}px`, width: `${Math.round(size * 1.3)}px`, height: `${Math.round(size * 1.3)}px` }}
  >
    {market.flag}
  </span>
)

export default MarketFlag
