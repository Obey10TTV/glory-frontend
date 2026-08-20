const MarketFlag = ({ market, size = 24, className = '' }) => (
  <img
    className={`glory-market-flag ${className}`.trim()}
    src={`/images/flags/${String(market.code || '').toLowerCase()}.svg`}
    alt={`${market.name} flag`}
    width={Math.round(size * 1.45)}
    height={Math.round(size * 0.9)}
    style={{ width: `${Math.round(size * 1.45)}px`, height: `${Math.round(size * 0.9)}px` }}
  />
)

export default MarketFlag
