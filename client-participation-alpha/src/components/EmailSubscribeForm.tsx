import React, { useEffect, useRef, useState } from 'react'
import { subscribeToNotifications } from '../api/notifications'
import type { Translations } from '../strings/types'

interface EmailSubscribeFormProps {
  s: Translations
  conversation_id: string
}

const subscribeAPI = async (email: string, conversation_id: string) => {
  return await subscribeToNotifications({
    email,
    conversation_id,
    type: 1
  })
}

export default function EmailSubscribeForm({ s, conversation_id }: EmailSubscribeFormProps) {
  const [email, setEmail] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<string>('')
  const [errorFeedback, setErrorFeedback] = useState<string>('')
  const [focusFeedback, setFocusFeedback] = useState<boolean>(false)
  const submitRef = useRef<HTMLButtonElement>(null)
  const feedbackRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (feedback && focusFeedback) feedbackRef.current?.focus()
  }, [feedback, focusFeedback])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || !event.currentTarget.reportValidity()) return

    setIsSubmitting(true)
    setFeedback('')
    setErrorFeedback('')

    try {
      await subscribeAPI(email, conversation_id)
      setFocusFeedback(document.activeElement === submitRef.current)
      setFeedback(s.notificationsAlreadySubscribed)
    } catch (error) {
      console.error('Subscription failed:', error)
      setErrorFeedback(s.notificationsSubscribeErrorGeneric)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (feedback) {
    return (
      <p
        ref={feedbackRef}
        role="status"
        tabIndex={-1}
        style={{ textAlign: 'center', color: '#1e6c34', fontWeight: 'bold' }}
      >
        {feedback}
      </p>
    )
  }

  return (
    <div className="email-subscribe-container">
      <h2>{s.notificationsGetNotified}</h2>
      <form className="email-subscribe-form" onSubmit={handleSubmit}>
        <label className="email-subscribe-label" htmlFor="email-subscribe-input">
          {s.notificationsEnterEmail}
        </label>
        <input
          id="email-subscribe-input"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrorFeedback('')
          }}
          readOnly={isSubmitting}
          required
          autoComplete="email"
          aria-describedby={errorFeedback ? 'email-subscribe-error' : undefined}
        />
        <button
          ref={submitRef}
          type="submit"
          className="submit-button"
          disabled={!email.trim()}
          aria-disabled={isSubmitting || undefined}
        >
          {isSubmitting ? s.submitting : s.notificationsSubscribeButton}
        </button>
      </form>
      {errorFeedback && (
        <p id="email-subscribe-error" className="subscribe-error" role="alert">
          {errorFeedback}
        </p>
      )}
    </div>
  )
}
