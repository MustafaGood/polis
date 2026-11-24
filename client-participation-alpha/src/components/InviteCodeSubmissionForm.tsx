import { useRef, useState } from 'react'
import { acceptInvite, treeviteLogin } from '../api/treevite'
import type { Translations } from '../strings/types'

interface InviteCodeSubmissionFormProps {
  s: Translations
  conversation_id: string
}

function hasApiError(error: unknown, codes: string[]): boolean {
  if (typeof error !== 'object' || error === null || !('responseText' in error)) return false
  const { responseText } = error
  return typeof responseText === 'string' && codes.some((code) => responseText.includes(code))
}

export default function InviteCodeSubmissionForm({
  s,
  conversation_id
}: InviteCodeSubmissionFormProps) {
  const [inviteCode, setInviteCode] = useState<string>('')
  const [loginCode, setLoginCode] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [errorSource, setErrorSource] = useState<'invite' | 'login' | null>(null)
  const [invalidCode, setInvalidCode] = useState<boolean>(false)
  const [submittingInvite, setSubmittingInvite] = useState<boolean>(false)
  const [submittingLogin, setSubmittingLogin] = useState<boolean>(false)
  const inviteInputRef = useRef<HTMLInputElement>(null)
  const inviteSubmitRef = useRef<HTMLButtonElement>(null)
  const loginInputRef = useRef<HTMLInputElement>(null)
  const loginSubmitRef = useRef<HTMLButtonElement>(null)

  const handleAcceptInvite = async () => {
    if (!inviteCode.trim() || submittingInvite || submittingLogin) return
    setSubmittingInvite(true)
    setMessage('')
    setError('')
    setErrorSource(null)
    setInvalidCode(false)
    try {
      const response = await acceptInvite({
        conversation_id,
        invite_code: inviteCode.trim()
      })

      // Store JWT handled centrally in net.ts via handleJwtFromResponse
      // Notify listeners that auth state changed
      dispatchEvent(
        new CustomEvent('invite-code-submitted', {
          bubbles: true,
          detail: { hasLoginCode: Boolean(response?.login_code) }
        })
      )

      if (response && 'login_code' in response && response.login_code) {
        setMessage(
          s.invite_code_accepted_message.replace('{{login_code}}', String(response.login_code))
        )
        // Emit a global event so a modal can display the code and block until dismissed
        dispatchEvent(
          new CustomEvent('treevite-login-code-issued', {
            detail: { login_code: response.login_code },
            bubbles: true
          })
        )
      } else {
        setMessage(s.invite_code_accepted_message_no_code)
      }
      if (document.activeElement === inviteSubmitRef.current) inviteInputRef.current?.focus()
      setInviteCode('')
    } catch (err) {
      console.error('Invite submission failed:', err)
      const invalid = hasApiError(err, [
        'polis_err_treevite_invalid_or_used_invite',
        'polis_err_treevite_invite_race_condition'
      ])
      setError(invalid ? s.invite_code_invalid : `${s.error}. ${s.oidcTryAgain}`)
      setErrorSource('invite')
      setInvalidCode(invalid)
    } finally {
      setSubmittingInvite(false)
    }
  }

  const handleLoginWithCode = async () => {
    if (!loginCode.trim() || submittingInvite || submittingLogin) return
    setSubmittingLogin(true)
    setMessage('')
    setError('')
    setErrorSource(null)
    setInvalidCode(false)
    try {
      await treeviteLogin({
        conversation_id,
        login_code: loginCode.trim()
      })
      // JWT handled in net.ts
      dispatchEvent(new CustomEvent('login-code-submitted', { bubbles: true }))
      setMessage(s.login_success)
      if (document.activeElement === loginSubmitRef.current) loginInputRef.current?.focus()
      setLoginCode('')
    } catch (err) {
      console.error('Login code submission failed:', err)
      const invalid = hasApiError(err, ['polis_err_treevite_login_code_invalid'])
      setError(invalid ? s.login_code_invalid : `${s.error}. ${s.oidcTryAgain}`)
      setErrorSource('login')
      setInvalidCode(invalid)
    } finally {
      setSubmittingLogin(false)
    }
  }

  return (
    <>
      <style>{invite_code_css}</style>
      <div className="invite-code-submission-form">
        <h2>{s.invite_code_required_short}</h2>
        <p>{s.invite_code_required_long}</p>

        {message ? (
          <div className="notice success" role="status">
            {message}
          </div>
        ) : null}
        {error ? (
          <div id="invite-code-error" className="notice error" role="alert">
            {error}
          </div>
        ) : null}

        <form
          className="invite-code-field"
          onSubmit={(e) => {
            e.preventDefault()
            void handleAcceptInvite()
          }}
        >
          <label htmlFor="invite-code-input">{s.invite_code_prompt}</label>
          <div className="invite-code-submission-form-container">
            <input
              id="invite-code-input"
              ref={inviteInputRef}
              type="text"
              dir="ltr"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="one-time-code"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value)
                if (errorSource === 'invite') {
                  setError('')
                  setErrorSource(null)
                  setInvalidCode(false)
                }
              }}
              required
              readOnly={submittingInvite}
              aria-invalid={errorSource === 'invite' && invalidCode}
              aria-describedby={errorSource === 'invite' ? 'invite-code-error' : undefined}
            />
            <button
              ref={inviteSubmitRef}
              type="submit"
              disabled={!inviteCode.trim()}
              aria-disabled={submittingInvite || submittingLogin || undefined}
            >
              {submittingInvite ? s.submitting : s.submit_invite_code}
            </button>
          </div>
        </form>

        <div className="or-separator">{s.or_text}</div>

        <form
          className="invite-code-field"
          onSubmit={(e) => {
            e.preventDefault()
            void handleLoginWithCode()
          }}
        >
          <label htmlFor="login-code-input">{s.login_code_prompt}</label>
          <div className="invite-code-submission-form-container">
            <input
              id="login-code-input"
              ref={loginInputRef}
              type="text"
              dir="ltr"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="one-time-code"
              value={loginCode}
              onChange={(e) => {
                setLoginCode(e.target.value)
                if (errorSource === 'login') {
                  setError('')
                  setErrorSource(null)
                  setInvalidCode(false)
                }
              }}
              required
              readOnly={submittingLogin}
              aria-invalid={errorSource === 'login' && invalidCode}
              aria-describedby={errorSource === 'login' ? 'invite-code-error' : undefined}
            />
            <button
              ref={loginSubmitRef}
              type="submit"
              disabled={!loginCode.trim()}
              aria-disabled={submittingInvite || submittingLogin || undefined}
            >
              {submittingLogin ? s.submitting : s.submit_login_code}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

const invite_code_css = `
/* Main container for the invite code section */
.invite-code-submission-form {
  margin-top: 24px; /* Adds space above the form */
  padding-top: 24px; /* Adds space inside the top border */
  border-top: 1px solid #e0e0e0; /* A light separator line */
}

/* Styling for the main heading */
.invite-code-submission-form h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

/* Styling for the descriptive paragraph */
.invite-code-submission-form p {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 16px;
}

/* Field group: visible label + input/button row */
.invite-code-field {
  margin-bottom: 0;
}

.invite-code-field label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

/* Flex container for the input and button */
.invite-code-submission-form-container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

/* Styling for the text input field */
.invite-code-submission-form-container input[type="text"] {
  flex-grow: 1; /* Allows the input to take up available space */
  min-width: 0; /* Critical for flex children to avoid overflow on small screens */
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-right: none; /* Removes the border between the input and button */
  border-radius: 4px 0 0 4px; /* Rounds the left corners */
  font-size: 1rem;
}

/* Visible focus ring (do not remove outline without a replacement) */
.invite-code-submission-form-container input[type="text"]:focus-visible {
  border-color: #007bff;
  box-shadow: 0 0 0 2px #007bff;
}

/* Styling for the submit button */
.invite-code-submission-form-container button {
  padding: 8px 16px;
  border: 1px solid #666;
  border-radius: 0 4px 4px 0; /* Rounds the right corners */
  background-color: #666;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap; /* Prevents the button text from wrapping; overridden on small screens */
  transition: background-color 0.2s ease;
}

/* Hover state for the button */
.invite-code-submission-form-container button:hover {
  background-color: #555;
}

/* Disabled state for the button */
.invite-code-submission-form-container button:disabled,
.invite-code-submission-form-container button[aria-disabled='true'] {
  background-color: #ccc;
  border-color: #bbb;
  color: #333;
  cursor: not-allowed;
}

/* On narrow screens, stack input and button to prevent horizontal overflow */
@media (max-width: 480px) {
  .invite-code-submission-form-container {
    flex-direction: column;
    align-items: stretch;
  }
  .invite-code-submission-form-container input[type="text"] {
    border-right: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 8px;
  }
  .invite-code-submission-form-container button {
    border-radius: 4px;
    white-space: normal; /* allow wrap if needed */
    width: 100%;
  }
}

.or-separator {
  text-align: center;
  color: #666;
  margin: 12px 0;
}

.notice {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}
.notice.success {
  background-color: #e6f4ea;
  border: 1px solid #b7e1c1;
  color: #1e6c34;
}
.notice.error {
  background-color: #fdecea;
  border: 1px solid #f5c2c7;
  color: #842029;
}
`
