const MarketFlag = ({ market, size = 24, className = '' }) => (
  <img
    className={`glory-market-flag ${className}`.trim()}
    src={`/images/flags/${String(market.code || '').toLowerCase()}.svg`}
    data-market={market.code}
    alt=''
    width={size}
    height={size}
  />
)

export default MarketFlag
