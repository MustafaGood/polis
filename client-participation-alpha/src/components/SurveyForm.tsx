import React, { useEffect, useRef, useState } from 'react'
import { submitComment } from '../api/comments'
import { getConversationToken } from '../lib/auth'
import type { Translations } from '../strings/types'

interface SurveyFormProps {
  s: Translations
  conversation_id: string
  requiresInviteCode?: boolean
}

const submitPerspectiveAPI = async (text: string, conversation_id: string) => {
  const decodedToken = getConversationToken(conversation_id)
  const pid = decodedToken?.pid

  try {
    const resp = await submitComment({
      txt: text.replace(/\n/g, ' '),
      conversation_id,
      pid: pid || -1,
      vote: -1
    })

    // Dispatch event to notify visualization to update
    window.dispatchEvent(
      new CustomEvent('polis-comment-submitted', {
        detail: { conversation_id }
      })
    )
    console.log('dispatched polis-comment-submitted event')

    // The net module automatically handles JWT extraction and storage
    return resp
  } catch (error) {
    console.error('Comment submission failed:', error)
    // Re-throw for caller to handle if needed
    throw error
  }
}

export default function SurveyForm({
  s,
  conversation_id,
  requiresInviteCode = false
}: SurveyFormProps) {
  const [text, setText] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [invalidText, setInvalidText] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const [isAuthed, setIsAuthed] = useState<boolean>(!!getConversationToken(conversation_id)?.token)
  const maxLength = 400

  useEffect(() => {
    const onInviteOrLogin = () => setIsAuthed(!!getConversationToken(conversation_id)?.token)
    window.addEventListener('invite-code-submitted', onInviteOrLogin)
    window.addEventListener('login-code-submitted', onInviteOrLogin)
    return () => {
      window.removeEventListener('invite-code-submitted', onInviteOrLogin)
      window.removeEventListener('login-code-submitted', onInviteOrLogin)
    }
  }, [conversation_id])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || !text.trim()) return

    setIsSubmitting(true)
    setFeedback('')
    setError('')
    setInvalidText(false)
    const submittedText = text

    try {
      await submitPerspectiveAPI(submittedText, conversation_id)
      if (document.activeElement === submitRef.current) textareaRef.current?.focus()
      setText('')
      setFeedback(s.commentSent)
    } catch (err: unknown) {
      console.error('Comment submission failed:', err)

      // Parse error message
      let errorText = ''
      if (typeof err === 'object' && err !== null) {
        if ('responseText' in err && typeof err.responseText === 'string') {
          errorText = err.responseText
        } else if ('message' in err && typeof err.message === 'string') {
          errorText = err.message
        }
      }
      let errorMessage = s.commentSendFailed

      if (errorText.includes('polis_err_conversation_is_closed')) {
        errorMessage = s.commentErrorConversationClosed
      } else if (
        errorText.includes('polis_err_post_comment_duplicate') ||
        errorText.includes('polis_err_comment_duplicate')
      ) {
        errorMessage = s.commentErrorDuplicate
        setInvalidText(true)
      } else if (errorText.includes('polis_err_xid_required')) {
        errorMessage = s.xidRequired
      } else if (errorText.includes('polis_err_xid_not_allowed')) {
        errorMessage = s.xidRequired
      } else if (errorText.includes('polis_err_eid_required')) {
        errorMessage = s.eidRequired
      }

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (requiresInviteCode && !isAuthed) {
    return null
  }

  return (
    <div>
      {feedback && (
        <p
          role="status"
          style={{
            textAlign: 'center',
            color: '#1e6c34',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}
        >
          {feedback}
        </p>
      )}
      {error && (
        <p
          id="survey-form-error"
          role="alert"
          style={{
            textAlign: 'center',
            color: '#dc3545',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}
        >
          {error}
        </p>
      )}
      <div className="guidelines">
        <p dangerouslySetInnerHTML={{ __html: s.writeCommentHelpText }} />
        <h2>{s.helpWriteListIntro}</h2>
        <ul>
          <li>{s.helpWriteListStandalone}</li>
          <li>{s.helpWriteListRaisNew}</li>
          <li>{s.helpWriteListShort}</li>
        </ul>
        <p dangerouslySetInnerHTML={{ __html: s.tipCommentsRandom }}></p>
      </div>
      <form className="submit-form" onSubmit={handleSubmit}>
        <label className="submit-form-label" htmlFor="comment-textarea">
          {s.writePrompt}
        </label>
        <div className="submit-form-controls">
          <div className="textarea-wrapper">
            <textarea
              id="comment-textarea"
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setError('')
                setInvalidText(false)
                setFeedback('')
              }}
              maxLength={maxLength}
              required
              readOnly={isSubmitting}
              aria-invalid={invalidText}
              aria-describedby={
                error ? 'comment-char-counter survey-form-error' : 'comment-char-counter'
              }
            />
            <div id="comment-char-counter" className="char-counter">
              {text.length} / {maxLength}
            </div>
          </div>
          <button
            ref={submitRef}
            type="submit"
            className="submit-button"
            disabled={!text.trim()}
            aria-disabled={isSubmitting || undefined}
          >
            {isSubmitting ? s.submitting : s.submitComment}
          </button>
        </div>
      </form>
    </div>
  )
}
