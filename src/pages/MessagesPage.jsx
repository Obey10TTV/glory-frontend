import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { FiAlertTriangle, FiArrowLeft, FiMessageCircle, FiSend, FiShield, FiX } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { closeConversation, getConversations, sendConversationMessage } from '../api'
import { useUser } from '../context/UserContext'

const formatTimestamp = (value) => {
  if (!value) return ''
  const date = new Date(value)
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const MessagesPage = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedId = searchParams.get('thread') || ''
  const activeConversation = useMemo(
    () => conversations.find(item => item._id === selectedId) || conversations[0] || null,
    [conversations, selectedId]
  )

  const loadConversations = async () => {
    setLoading(true)
    try {
      const { data } = await getConversations()
      setConversations(data)
      if (!selectedId && data[0]?._id) {
        setSearchParams({ thread: data[0]._id }, { replace: true })
      }
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not load your conversations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  // The initial load should not run again when the selected thread changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectConversation = (id) => setSearchParams({ thread: id })

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!activeConversation || !message.trim()) return
    setSending(true)
    try {
      const { data } = await sendConversationMessage(activeConversation._id, { message: message.trim() })
      setConversations(current => current.map(item => item._id === data._id ? data : item))
      setMessage('')
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not send that message.')
    } finally {
      setSending(false)
    }
  }

  const closeThread = async () => {
    if (!activeConversation) return
    setClosing(true)
    try {
      const { data } = await closeConversation(activeConversation._id)
      setConversations(current => current.map(item => item._id === data._id ? data : item))
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not close this conversation.')
    } finally {
      setClosing(false)
    }
  }

  const otherParticipant = activeConversation?.participantRole === 'seller'
    ? activeConversation?.buyer
    : activeConversation?.seller

  return (
    <div className='glory-page glory-messages-page'>
      <Navbar />
      <main className='glory-messages-shell'>
        <header className='glory-messages-heading'>
          <button type='button' onClick={() => navigate(-1)} aria-label='Go back'>
            <FiArrowLeft size={18} />
          </button>
          <div>
            <span>Glory messages</span>
            <h1>Keep the conversation on Glory.</h1>
          </div>
        </header>

        <div className='glory-marketplace-safety-note' role='note'>
          <FiShield size={19} aria-hidden='true' />
          <p><strong>Stay safe.</strong> Glory hosts this conversation and listing only. Do not send card details, passwords or one-time codes. Inspect items and agree payment safely with the seller.</p>
        </div>

        {error && (
          <div className='glory-messages-error' role='alert'>
            <FiAlertTriangle size={18} aria-hidden='true' />
            <span>{error}</span>
          </div>
        )}

        {loading ? <Loader /> : conversations.length === 0 ? (
          <section className='glory-messages-empty'>
            <FiMessageCircle size={34} aria-hidden='true' />
            <h2>No conversations yet.</h2>
            <p>When you contact a seller from a listing, the conversation will appear here.</p>
            <button type='button' onClick={() => navigate('/products')}>Explore listings</button>
          </section>
        ) : (
          <section className='glory-messages-layout' aria-label='Marketplace conversations'>
            <aside className='glory-conversation-list' aria-label='Conversations'>
              {conversations.map((conversation) => {
                const other = conversation.participantRole === 'seller' ? conversation.buyer : conversation.seller
                const latest = conversation.messages?.[conversation.messages.length - 1]
                return (
                  <button
                    type='button'
                    key={conversation._id}
                    className={activeConversation?._id === conversation._id ? 'is-active' : ''}
                    onClick={() => selectConversation(conversation._id)}
                  >
                    <span className='glory-conversation-list-avatar'>{String(other?.name || 'G').slice(0, 1).toUpperCase()}</span>
                    <span className='glory-conversation-list-copy'>
                      <strong>{other?.sellerProfile?.storeName || other?.name || 'Glory member'}</strong>
                      <small>{conversation.listing?.name || 'Listing unavailable'}</small>
                      <em>{latest?.body || 'Start the conversation'}</em>
                    </span>
                    <time>{formatTimestamp(conversation.lastMessageAt)}</time>
                  </button>
                )
              })}
            </aside>

            <article className='glory-conversation-panel'>
              <header>
                <div>
                  <span>{activeConversation?.listing?.category || 'Glory listing'}</span>
                  <h2>{otherParticipant?.sellerProfile?.storeName || otherParticipant?.name || 'Conversation'}</h2>
                  <p>{activeConversation?.listing?.name}</p>
                </div>
                {activeConversation?.status === 'open' ? (
                  <button type='button' className='glory-conversation-close' onClick={closeThread} disabled={closing}>
                    <FiX size={15} />
                    {closing ? 'Closing' : 'Close'}
                  </button>
                ) : <span className='glory-conversation-closed'>Closed</span>}
              </header>

              <div className='glory-conversation-messages' aria-live='polite'>
                {activeConversation?.messages?.map((item) => {
                  const isMine = String(item.sender?._id || item.sender) === String(user?._id)
                  return (
                    <div key={item._id || `${item.sentAt}-${item.body}`} className={isMine ? 'is-mine' : ''}>
                      <p>{item.body}</p>
                      <time>{formatTimestamp(item.sentAt)}</time>
                    </div>
                  )
                })}
              </div>

              {activeConversation?.status === 'open' ? (
                <form onSubmit={sendMessage} className='glory-conversation-compose'>
                  <label className='sr-only' htmlFor='glory-message-body'>Write a message</label>
                  <textarea
                    id='glory-message-body'
                    value={message}
                    onChange={event => setMessage(event.target.value)}
                    placeholder='Write a clear question about this listing...'
                    maxLength={1200}
                    rows={2}
                  />
                  <button type='submit' disabled={sending || !message.trim()} aria-label='Send message'>
                    <FiSend size={18} />
                  </button>
                </form>
              ) : (
                <p className='glory-conversation-closed-copy'>This conversation is closed. Start a new enquiry from the listing if you still need help.</p>
              )}
            </article>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default MessagesPage
