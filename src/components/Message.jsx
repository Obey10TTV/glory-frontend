const palette = {
  error: {
    background: '#fff1f2',
    border: '#fecdd3',
    color: '#be123c'
  },
  success: {
    background: '#ecfdf5',
    border: '#bbf7d0',
    color: '#047857'
  },
  info: {
    background: '#eff6ff',
    border: '#bfdbfe',
    color: '#1d4ed8'
  }
}

const Message = ({ type = 'info', text, children }) => {
  const tone = palette[type] || palette.info
  const content = text || children

  if (!content) {
    return null
  }

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      style={{
        background: tone.background,
        border: `1px solid ${tone.border}`,
        borderRadius: '12px',
        color: tone.color,
        fontSize: '12px',
        fontWeight: '600',
        lineHeight: '1.55',
        marginBottom: '16px',
        padding: '12px 14px'
      }}
    >
      {content}
    </div>
  )
}

export default Message
