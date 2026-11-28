import { useEffect, useRef, useState } from 'react'
import { FiArrowUpRight, FiSend, FiX } from 'react-icons/fi'
import { RiMessage3Line } from 'react-icons/ri'
import { FaWhatsapp } from 'react-icons/fa'
import { MdOutlineLocalHospital, MdOutlineMailOutline } from 'react-icons/md'
import {
  getSkinGuideStatus,
  startSkinGuideClinicianChat
} from '../api'

const initialMessage = {
  role: 'assistant',
  content: 'Glory Skin Guide is preparing its skincare question service. You can find urgent-help guidance or check whether clinician chat is available.'
}

const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback

const urgentHelp = 'If you or someone else may be in immediate danger or has already been hurt, call your local emergency services now. If you can, tell someone you trust and ask them to stay with you.'
const crisisLanguage = /\b(?:suicid(?:e|al)|self[\s-]*harm|(?:kill|hurt|harm)\s+(?:myself|yourself|themselves)|(?:end|take)\s+(?:my|your|their)\s+(?:own\s+)?life|(?:want|wish)\s+to\s+die|don['’]?t\s+want\s+to\s+(?:live|be\s+alive))\b/i

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([initialMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('guide')
  const [guideStatus, setGuideStatus] = useState(null)
  const [statusError, setStatusError] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!isOpen || guideStatus) return undefined
    let active = true
    getSkinGuideStatus()
      .then(({ data }) => {
        if (active) setGuideStatus(data)
      })
      .catch((error) => {
        if (active) setStatusError(getErrorMessage(error, 'Skin Guide is unavailable right now.'))
      })
    return () => { active = false }
  }, [isOpen, guideStatus])

  const quickReplies = [
    'How can I build a simple routine?',
    'What should I look for in a moisturiser?',
    'How do I patch test a new product?'
  ]

  const addAssistantMessage = (content) => {
    setMessages((previous) => [...previous, { role: 'assistant', content }])
  }

  const handleSend = () => {
    const message = input.trim()
    if (!message || loading) return

    setInput('')
    if (crisisLanguage.test(message)) {
      addAssistantMessage(`I'm glad you reached out. ${urgentHelp} Glory support cannot provide emergency care.`)
      return
    }
    addAssistantMessage('Skin Guide is not accepting questions yet. Browse skincare or use Talk to a person if clinician chat is available.')
  }

  const handleClinicianChat = async () => {
    setLoading(true)
    try {
      const { data } = await startSkinGuideClinicianChat()
      window.open(data.url, '_blank', 'noopener,noreferrer')
      setGuideStatus((current) => current ? {
        ...current,
        usage: { ...current.usage, handoffsRemaining: data.remaining }
      } : current)
    } catch (error) {
      setStatusError(getErrorMessage(error, 'Clinician chat is unavailable right now.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type='button'
        className='glory-chat-button'
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close Glory support' : 'Open Glory support'}
        aria-expanded={isOpen}
        style={{
          position: 'fixed', bottom: '28px', right: '28px', width: '56px', height: '56px',
          background: '#9b183f', border: '1px solid rgba(255,255,255,0.55)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 9999,
          boxShadow: '0 8px 24px rgba(35, 20, 27, 0.24)', transition: 'transform 0.2s, background 0.2s'
        }}
        onMouseEnter={(event) => { event.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={(event) => { event.currentTarget.style.transform = 'translateY(0)' }}
      >
        {isOpen ? <FiX size={22} color='#fff' /> : <RiMessage3Line size={24} color='#fff' />}
      </button>

      {isOpen && (
        <section
          aria-label='Glory support and Skin Guide'
          className='glory-chat-window'
          style={{
            position: 'fixed', bottom: '96px', right: '28px', width: 'min(360px, calc(100vw - 32px))',
            height: 'min(520px, calc(100dvh - 116px))', background: '#fff', borderRadius: '12px',
            boxShadow: '0 12px 42px rgba(25, 19, 22, 0.2)', display: 'flex', flexDirection: 'column',
            zIndex: 9999, overflow: 'hidden', border: '1px solid #e7e0e2', fontFamily: "'Inter', sans-serif"
          }}
        >
          <header style={{ background: '#171314', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <span style={{ width: '36px', height: '36px', background: '#9b183f', borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <MdOutlineLocalHospital size={18} color='#fff' />
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#fff' }}>Glory care</strong>
                <small style={{ display: 'block', marginTop: '2px', color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Private skincare support</small>
              </span>
            </div>
            <button type='button' onClick={() => setIsOpen(false)} aria-label='Close support' style={{ background: 'none', border: 0, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <FiX size={19} />
            </button>
          </header>

          <nav aria-label='Support options' style={{ display: 'flex', borderBottom: '1px solid #ece7e8' }}>
            {[
              { id: 'guide', label: 'Skin Guide' },
              { id: 'support', label: 'Talk to a person' }
            ].map((tab) => (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1, minWidth: 0, padding: '11px 8px', border: 0, background: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: activeTab === tab.id ? '#171314' : '#71696c', borderBottom: activeTab === tab.id ? '2px solid #9b183f' : '2px solid transparent' }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '10px 16px', background: '#fbf4f6', borderBottom: '1px solid #f0e1e6', color: '#5d434b', fontSize: '12px', lineHeight: 1.45 }}>
            <details>
              <summary>Urgent help</summary>
              {urgentHelp}
              <p>For a severe skin reaction or another urgent medical concern, seek urgent medical care.</p>
            </details>
          </div>

          {activeTab === 'guide' && (
            <>
              <div aria-live='polite' style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
                    {message.role === 'assistant' && <span style={{ width: '28px', height: '28px', background: '#f7e9ee', borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0 }}><MdOutlineLocalHospital size={15} color='#9b183f' /></span>}
                    <p style={{ margin: 0, maxWidth: '78%', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', background: message.role === 'user' ? '#171314' : '#f7f5f5', color: message.role === 'user' ? '#fff' : '#252021', padding: '10px 13px', borderRadius: message.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: '13px', lineHeight: 1.55 }}>
                      {message.content}
                    </p>
                  </div>
                ))}
                {loading && <p style={{ margin: 0, color: '#71696c', fontSize: '12px' }}>Preparing a secure response...</p>}
                <div ref={messagesEndRef} />
              </div>

              {messages.length === 1 && (
                <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {quickReplies.map((reply) => <button key={reply} type='button' onClick={() => setInput(reply)} style={{ background: '#fbf4f6', border: '1px solid #ead2da', borderRadius: '999px', padding: '6px 10px', fontSize: '11px', color: '#7a1534', cursor: 'pointer' }}>{reply}</button>)}
                </div>
              )}

              <form onSubmit={(event) => { event.preventDefault(); handleSend() }} style={{ padding: '12px 14px', borderTop: '1px solid #ece7e8', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={600} placeholder='Ask about skincare...' aria-label='Skin Guide question' style={{ minWidth: 0, flex: 1, border: '1px solid #ded6d8', borderRadius: '999px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: '#fafafa' }} />
                <button type='submit' disabled={!input.trim() || loading} aria-label='Send question' style={{ width: '38px', height: '38px', flexShrink: 0, background: input.trim() && !loading ? '#171314' : '#ded6d8', border: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default' }}>
                  <FiSend size={15} color='#fff' />
                </button>
              </form>
            </>
          )}

          {activeTab === 'support' && (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '22px 20px', gap: '13px' }}>
              <FaWhatsapp size={34} color='#25D366' aria-hidden='true' />
              <strong style={{ fontSize: '17px', color: '#171314' }}>Talk to a skincare professional</strong>
              <p style={{ margin: 0, color: '#625b5d', fontSize: '13px', lineHeight: 1.6 }}>For personal guidance, request a private WhatsApp conversation with the Glory skincare professional. Do not share emergency information in chat.</p>
              <button type='button' disabled={!guideStatus?.clinicianAvailable || loading} onClick={handleClinicianChat} style={{ minHeight: '46px', padding: '0 14px', border: 0, borderRadius: '5px', background: guideStatus?.clinicianAvailable ? '#25D366' : '#d9d4d5', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '9px', fontWeight: 750, cursor: guideStatus?.clinicianAvailable && !loading ? 'pointer' : 'not-allowed' }}>
                Chat on WhatsApp <FiArrowUpRight size={17} />
              </button>
              <a href='/support' style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#171314', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}><MdOutlineMailOutline size={18} /> Marketplace support</a>
              {(statusError || !guideStatus?.clinicianAvailable) && <p style={{ margin: 0, color: '#7a1534', fontSize: '11px', lineHeight: 1.45 }}>{statusError || 'Clinician chat will appear here once it has been configured.'}</p>}
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default ChatBot
