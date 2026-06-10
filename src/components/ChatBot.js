import { useState, useRef, useEffect } from 'react'
import { FiX, FiSend, FiUser } from 'react-icons/fi'
import { RiMessage3Line } from 'react-icons/ri'
import { FaUserTie, FaWhatsapp, FaInstagram } from 'react-icons/fa'
import { MdOutlineLocalHospital, MdOutlineMailOutline } from 'react-icons/md'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! 👋 I'm **Glory AI**, your personal beauty & skincare advisor.\n\nI can help you with:\n• 🌿 Skincare routines for your skin type\n• 💄 Product recommendations\n• 🧴 Ingredient advice\n• 🩺 When to see a real dermatologist\n\nWhat's your skin concern today?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('ai')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const quickReplies = [
    'Best serum for dark spots',
    'Routine for oily skin',
    'Products for hyperpigmentation',
    'How to treat acne',
  ]

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Placeholder response until API is connected
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Thanks for your question about **"${input}"**! 🌟\n\nOur AI dermatologist is coming soon! In the meantime, browse our **Skincare** collection for products that might help, or contact our support team for personalised advice.\n\nWould you like me to help with anything else?`
      }])
      setLoading(false)
    }, 1000)
  }

  const handleQuickReply = (text) => {
    setInput(text)
  }

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ')
  }

  return (
    <>
      {/* CHAT BUBBLE BUTTON */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '28px', right: '28px',
          width: '56px', height: '56px',
          background: '#fa9ad5', borderRadius: '16px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s, background 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen
            ? <FiX size={22} color='#fff' />
            : <RiMessage3Line size={24} color='#fff' />
         }
        {/* NOTIFICATION DOT */}
        {!isOpen && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '12px', height: '12px',
            background: '#ff0066', borderRadius: '50%',
            border: '2px solid #fff'
          }} />
        )}
      </div>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '96px', right: '28px',
          width: '360px', height: '520px',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          zIndex: 9999, overflow: 'hidden',
          border: '0.5px solid #eee',
          fontFamily: "'Inter', sans-serif",
          animation: 'slideUp 0.3s ease'
        }}>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* HEADER */}
          <div style={{
            background: '#111', padding: '16px 20px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: '#ff4e95', borderRadius: '50%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0
              }}>
                <MdOutlineLocalHospital size={18} color='#fff' />
              </div>
              <div>
                <div style={{
                  fontSize: '14px', fontWeight: '700', color: '#fff'
                }}>
                  Glory Support
                </div>
                <div style={{
                  fontSize: '11px', color: 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <div style={{
                    width: '6px', height: '6px',
                    background: '#2ecc71', borderRadius: '50%'
                  }} />
                  Online · Usually replies instantly
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center'
              }}
            >
              <FiX size={18} />
            </button>
          </div>

          {/* TABS */}
          <div style={{
            display: 'flex', borderBottom: '1px solid #f0f0f0'
          }}>
            {[
              { id: 'ai', label: '🤖 AI Dermatologist' },
              { id: 'support', label: '👩‍💼 Support' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '10px',
                  border: 'none', background: 'none',
                  fontSize: '11px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'inherit',
                  color: activeTab === tab.id ? '#111' : '#888',
                  borderBottom: activeTab === tab.id ? '2px solid #111' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <>
              {/* MESSAGES */}
              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '16px', display: 'flex',
                flexDirection: 'column', gap: '12px'
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '8px', alignItems: 'flex-end'
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: '28px', height: '28px',
                        background: '#fdf0f5', borderRadius: '50%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0
                      }}>
                        <MdOutlineLocalHospital size={15} color='#c97a9a' />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '75%',
                      background: msg.role === 'user' ? '#111' : '#f9f9f9',
                      color: msg.role === 'user' ? '#fff' : '#111',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      fontSize: '13px', lineHeight: '1.6'
                    }}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    {msg.role === 'user' && (
                      <div style={{
                        width: '28px', height: '28px',
                        background: '#111', borderRadius: '50%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0
                      }}>
                        <FiUser size={14} color='#fff' />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{
                      width: '28px', height: '28px',
                      background: '#fdf0f5', borderRadius: '50%',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MdOutlineLocalHospital size={15} color='#c97a9a' />
                    </div>
                    <div style={{
                      background: '#f9f9f9', padding: '12px 16px',
                      borderRadius: '16px 16px 16px 4px',
                      display: 'flex', gap: '4px', alignItems: 'center'
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: '6px', height: '6px',
                          background: '#ccc', borderRadius: '50%',
                          animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
                        }} />
                      ))}
                      <style>{`
                        @keyframes bounce {
                          0%, 100% { transform: translateY(0); }
                          50% { transform: translateY(-4px); }
                        }
                      `}</style>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK REPLIES */}
              {messages.length <= 1 && (
                <div style={{
                  padding: '0 12px 8px',
                  display: 'flex', flexWrap: 'wrap', gap: '6px'
                }}>
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      style={{
                        background: '#fdf0f5', border: '1px solid #f0d0de',
                        borderRadius: '999px', padding: '6px 12px',
                        fontSize: '11px', fontWeight: '500',
                        color: '#c97a9a', cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#c97a9a'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#fdf0f5'
                        e.currentTarget.style.color = '#c97a9a'
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* INPUT */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex', gap: '8px', alignItems: 'center'
              }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  placeholder='Ask about your skin...'
                  style={{
                    flex: 1, border: '1px solid #eee',
                    borderRadius: '999px', padding: '10px 16px',
                    fontSize: '13px', outline: 'none',
                    fontFamily: 'inherit', background: '#fafaf9'
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  style={{
                    width: '38px', height: '38px',
                    background: input.trim() ? '#111' : '#eee',
                    border: 'none', borderRadius: '50%',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s', flexShrink: 0
                  }}
                >
                  <FiSend size={15} color={input.trim() ? '#fff' : '#aaa'} />
                </button>
              </div>
            </>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <div style={{
              flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '20px 24px 16px', textAlign: 'center', gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}>
                <FaUserTie size={36} color="#111" />
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>
                Talk to a human
              </div>
              <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
                Our support team is available Monday to Friday, 9am - 6pm WAT.
              </div>

              {[
                { icon: <MdOutlineMailOutline size={20} color="#111" />, label: 'Email us', sub: 'support@glory.ng', href: 'mailto:support@glory.ng' },
                { icon: <FaWhatsapp size={20} color="#25D366" />, label: 'WhatsApp', sub: '+234 800 GLORY', href: '#' },
                { icon: <FaInstagram size={20} color="#E1306C" />, label: 'Instagram DM', sub: '@shopglory.ng', href: '#' },
              ].map((item, i) => (
                <a key={i} href={item.href} style={{
                  width: '100%', display: 'flex',
                  alignItems: 'center', gap: '12px',
                  padding: '12px 16px', border: '1px solid #eee',
                  borderRadius: '12px', textDecoration: 'none',
                  transition: 'background 0.2s', background: '#fff'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', textAlign: 'left' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', textAlign: 'left' }}>
                      {item.sub}
                    </div>
                  </div>
                </a>
              ))}

              <div style={{
                fontSize: '11px', color: '#aaa',
                marginTop: '4px'
              }}>
                Average response time: 2 hours
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ChatBot