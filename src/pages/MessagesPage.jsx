import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { FiAlertTriangle, FiArrowLeft, FiCheck, FiMessageCircle, FiSend, FiShield, FiStar, FiX } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { addReview, closeConversation, confirmConversationTransaction, getConversations, sendConversationMessage } from '../api'
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
  const [confirming, setConfirming] = useState(false)
  const [reviewSending, setReviewSending] = useState(false)
  const [message, setMessage] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState('')
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

  const confirmTransaction = async () => {
    if (!activeConversation) return
    setConfirming(true)
    try {
      const { data } = await confirmConversationTransaction(activeConversation._id)
      setConversations(current => current.map(item => item._id === data._id ? data : item))
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not confirm this transaction.')
    } finally {
      setConfirming(false)
    }
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (!activeConversation?.listing?._id || !reviewRating || reviewComment.trim().length < 10) return
    setReviewSending(true)
    try {
      const { data } = await addReview(activeConversation.listing._id, {
        conversationId: activeConversation._id,
        rating: reviewRating,
        comment: reviewComment.trim()
      })
      setReviewFeedback(data.message)
      setReviewComment('')
      const refreshed = await getConversations()
      setConversations(refreshed.data)
      setError('')
    } catch (requestError) {
      setReviewFeedback(requestError.response?.data?.message || 'We could not submit this review.')
    } finally {
      setReviewSending(false)
    }
  }

  const otherParticipant = activeConversation?.participantRole === 'seller'
    ? activeConversation?.buyer
    : activeConversation?.seller
  const currentParticipantConfirmed = activeConversation?.participantRole === 'seller'
    ? Boolean(activeConversation?.sellerConfirmedAt)
    : Boolean(activeConversation?.buyerConfirmedAt)
  const transactionConfirmed = activeConversation?.transactionStatus === 'confirmed'

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

              <section className={`glory-transaction-confirmation is-${activeConversation?.transactionStatus || 'not_confirmed'}`} aria-labelledby='transaction-confirmation-title'>
                <div>
                  <FiCheck size={18} aria-hidden='true' />
                  <span>
                    <strong id='transaction-confirmation-title'>Transaction confirmation</strong>
                    <small>
                      {transactionConfirmed
                        ? 'Buyer and seller both confirmed that this transaction took place.'
                        : currentParticipantConfirmed
                          ? 'Your confirmation is recorded. Waiting for the other person.'
                          : 'Confirm only after the agreed exchange has genuinely taken place.'}
                    </small>
                  </span>
                </div>
                {!currentParticipantConfirmed && (
                  <button type='button' onClick={confirmTransaction} disabled={confirming || activeConversation?.status === 'blocked'}>
                    {confirming ? 'Confirming...' : 'Confirm completed transaction'}
                  </button>
                )}
              </section>

              {activeConversation?.participantRole === 'buyer' && transactionConfirmed && (
                <section className='glory-conversation-review' aria-labelledby='conversation-review-title'>
                  {activeConversation.review ? (
                    <div className='glory-review-submitted'>
                      <FiShield size={18} aria-hidden='true' />
                      <span><strong>Review {activeConversation.review.status}</strong><small>Glory applies the same moderation checks to positive and negative feedback.</small></span>
                    </div>
                  ) : (
                    <form onSubmit={submitReview}>
                      <div><strong id='conversation-review-title'>Review this interaction</strong><small>Your review will be labelled Verified interaction after neutral moderation.</small></div>
                      <fieldset>
                        <legend>Rating</legend>
                        <div className='glory-conversation-review-stars'>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type='button' onClick={() => setReviewRating(star)} aria-label={`${star} star${star === 1 ? '' : 's'}`} aria-pressed={reviewRating === star}>
                              <FiStar fill={star <= reviewRating ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <label htmlFor='conversation-review-comment'>Your experience</label>
                      <textarea id='conversation-review-comment' value={reviewComment} onChange={event => setReviewComment(event.target.value)} minLength={10} maxLength={1000} rows={3} placeholder='Describe what genuinely happened, whether positive or negative.' required />
                      {reviewFeedback && <p role='status'>{reviewFeedback}</p>}
                      <button type='submit' disabled={reviewSending || !reviewRating || reviewComment.trim().length < 10}>{reviewSending ? 'Submitting...' : 'Submit for moderation'}</button>
                    </form>
                  )}
                </section>
              )}

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
