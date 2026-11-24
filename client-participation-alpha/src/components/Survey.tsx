import { useEffect, useRef, useState } from 'react'
import { fetchNextComment } from '../api/comments'
import { submitVote } from '../api/votes'
import { getConversationToken } from '../lib/auth'
import type { Translations } from '../strings/types'
import EmailSubscribeForm from './EmailSubscribeForm'
import InviteCodeSubmissionForm from './InviteCodeSubmissionForm'
import { Statement } from './Statement'
import type { StatementData, VoteData } from './types'

interface SurveyProps {
  initialStatement?: StatementData
  s: Translations
  conversation_id: string
  requiresInviteCode?: boolean
  importanceEnabled?: boolean
}

const submitVoteAndGetNextCommentAPI = async (
  vote: VoteData,
  conversation_id: string,
  high_priority: boolean = false
) => {
  const decodedToken = getConversationToken(conversation_id)

  const resp = await submitVote({
    agid: 1,
    conversation_id,
    high_priority,
    pid: decodedToken?.pid || -1,
    tid: vote.tid,
    vote: vote.vote
  })

  // Dispatch event to notify visualization to update
  window.dispatchEvent(
    new CustomEvent('polis-vote-submitted', {
      detail: { conversation_id }
    })
  )
  console.log('dispatched polis-vote-submitted event')

  return resp
}

export default function Survey({
  initialStatement,
  s,
  conversation_id,
  requiresInviteCode = false,
  importanceEnabled = false
}: SurveyProps) {
  const [statement, setStatement] = useState<StatementData | undefined>(initialStatement)
  const [isFetchingNext, setIsFetchingNext] = useState<boolean>(false)
  const [isStatementImportant, setIsStatmentImportant] = useState<boolean>(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [inviteGate, setInviteGate] = useState<boolean>(requiresInviteCode)
  const inviteGateRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef(false)
  const voteFocusRef = useRef<HTMLButtonElement | null>(null)

  // On hydration, fetch a participant-personalized next comment.
  // This replaces the SSR-provided generic comment if needed.
  useEffect(() => {
    let cancelled = false
    const loadPersonalizedFirst = async () => {
      try {
        getConversationToken(conversation_id)
        const resp = await fetchNextComment(conversation_id)

        if (!cancelled) {
          if (resp && typeof resp.tid !== 'undefined') {
            const mapped: StatementData = {
              tid: resp.tid,
              txt: resp.txt,
              remaining: resp.remaining,
              lang: resp.lang,
              translations: resp.translations
            }
            setStatement((prev) => {
              if (!prev || mapped.tid !== prev.tid) {
                return mapped
              }
              return prev
            })
          } else {
            // No personalized next comment available; hide the SSR fallback.
            setStatement(undefined)
          }
        }
      } catch (e) {
        // Non-fatal; keep SSR statement
        console.warn('Personalized first comment fetch failed', e)
      }
    }
    // Initial fetch (SSR may have random, we try to personalize even before auth if possible)
    loadPersonalizedFirst()

    // Also re-fetch after login/invite acceptance to personalize post-auth
    const onInviteAccepted = () => {
      loadPersonalizedFirst()
    }
    const onLoginSuccess = () => {
      loadPersonalizedFirst()
    }
    window.addEventListener('invite-code-submitted', onInviteAccepted)
    window.addEventListener('login-code-submitted', onLoginSuccess)

    return () => {
      cancelled = true
      window.removeEventListener('invite-code-submitted', onInviteAccepted)
      window.removeEventListener('login-code-submitted', onLoginSuccess)
    }
    // Run once on mount for this conversation
  }, [conversation_id])

  // On mount, determine whether to show the invite/login gate based on JWT presence
  useEffect(() => {
    const token = getConversationToken(conversation_id)
    if (token && token.token) {
      setInviteGate(false)
    } else {
      setInviteGate(requiresInviteCode)
    }

    const openParticipation = () => {
      restoreFocus.current = !!inviteGateRef.current?.contains(document.activeElement)
      setInviteGate(false)
    }
    const onInviteAccepted = (event: Event) => {
      if (!(event instanceof CustomEvent && event.detail?.hasLoginCode)) {
        setFeedback(s.invite_code_accepted_message_no_code)
      }
      openParticipation()
    }
    const onLoginSuccess = () => {
      setFeedback(s.login_success)
      openParticipation()
    }
    window.addEventListener('invite-code-submitted', onInviteAccepted)
    window.addEventListener('login-code-submitted', onLoginSuccess)

    return () => {
      window.removeEventListener('invite-code-submitted', onInviteAccepted)
      window.removeEventListener('login-code-submitted', onLoginSuccess)
    }
  }, [conversation_id, requiresInviteCode, s.invite_code_accepted_message_no_code, s.login_success])

  useEffect(() => {
    if (!inviteGate && restoreFocus.current) {
      restoreFocus.current = false
      if (document.activeElement === document.body) contentRef.current?.focus()
    }
  }, [inviteGate])

  useEffect(() => {
    if (isFetchingNext || !voteFocusRef.current) return

    const voteButton = voteFocusRef.current
    voteFocusRef.current = null
    if (document.activeElement !== document.body) return

    if (voteButton.isConnected && !voteButton.disabled) {
      voteButton.focus()
    } else {
      const emailInput =
        contentRef.current?.querySelector<HTMLInputElement>('#email-subscribe-input')
      if (emailInput) emailInput.focus()
      else contentRef.current?.focus()
    }
  }, [isFetchingNext, statement])

  const handleVote = async (voteType: number, tid: number | string) => {
    const activeElement = document.activeElement
    if (
      activeElement instanceof HTMLButtonElement &&
      contentRef.current?.contains(activeElement) &&
      activeElement.dataset.testid?.startsWith('vote-')
    ) {
      voteFocusRef.current = activeElement
    }
    setIsFetchingNext(true)
    setVoteError(null)
    setFeedback('')

    try {
      const vote: VoteData = { vote: voteType, tid: tid }
      const result = await submitVoteAndGetNextCommentAPI(
        vote,
        conversation_id,
        importanceEnabled ? isStatementImportant : false
      )

      setVoteError(null)
      setFeedback(s.voteSubmitted)
      if (result?.nextComment) {
        setStatement(result.nextComment)
      } else {
        setStatement(undefined)
      }
      setIsStatmentImportant(false)
    } catch (err: unknown) {
      console.error('Vote submission failed:', err)
      let errorMessage = s.voteFailedGeneric

      // Check error.responseText first (from net.js), then fall back to error.message
      const error = err as { responseText?: string; message?: string }
      const errorText = error.responseText || error.message || ''

      if (errorText.includes('polis_err_conversation_is_closed')) {
        errorMessage = s.convIsClosed
      } else if (errorText.includes('polis_err_post_votes_social_needed')) {
        errorMessage = s.signInToVote
      } else if (errorText.includes('polis_err_xid_not_allowed')) {
        errorMessage = s.xidRequired
      } else if (errorText.includes('polis_err_xid_required')) {
        errorMessage = s.xidRequired
      } else if (errorText.includes('polis_err_eid_required')) {
        errorMessage = s.eidRequired
      }

      setVoteError(errorMessage)
      setFeedback('')
    } finally {
      setIsFetchingNext(false)
    }
  }

  return (
    <>
      <p role="status" style={feedback ? undefined : { margin: 0 }}>
        {feedback}
      </p>
      {inviteGate ? (
        <div ref={inviteGateRef}>
          <InviteCodeSubmissionForm s={s as Translations} conversation_id={conversation_id} />
        </div>
      ) : (
        <div ref={contentRef} tabIndex={-1} data-participation-content>
          {statement ? (
            <Statement
              statement={statement}
              onVote={handleVote}
              isVoting={isFetchingNext}
              s={s as Translations}
              isStatementImportant={isStatementImportant}
              setIsStatmentImportant={setIsStatmentImportant}
              voteError={voteError}
              importanceEnabled={importanceEnabled}
            />
          ) : (
            <EmailSubscribeForm s={s as Translations} conversation_id={conversation_id} />
          )}
        </div>
      )}
    </>
  )
}
