import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fetchNextComment } from '../../api/comments'
import { submitVote } from '../../api/votes'
import { acceptInvite, treeviteLogin } from '../../api/treevite'
import { a11yStrings } from '../../test-utils/a11y'
import Survey from '../Survey'
import TreeviteLoginCodeModal from '../TreeviteLoginCodeModal'
import type { VoteResponse } from '../types'

jest.mock('../../api/comments', () => ({
  fetchNextComment: jest.fn()
}))

jest.mock('../../api/votes', () => ({
  submitVote: jest.fn()
}))

jest.mock('../../api/notifications', () => ({
  subscribeToNotifications: jest.fn()
}))

jest.mock('../../api/treevite', () => ({
  acceptInvite: jest.fn(),
  treeviteLogin: jest.fn()
}))

jest.mock('../../lib/auth', () => ({
  getConversationToken: jest.fn(() => null)
}))

describe('Survey focus after invite login', () => {
  beforeEach(() => {
    jest.mocked(fetchNextComment).mockReset()
    jest.mocked(fetchNextComment).mockReturnValue(new Promise(() => {}))
    jest.mocked(submitVote).mockReset()
    jest.mocked(treeviteLogin).mockReset()
    jest.mocked(acceptInvite).mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('keeps focus in the login-code dialog and returns to participation after accepting an invite', async () => {
    jest.mocked(acceptInvite).mockResolvedValue({ status: 'ok', login_code: 'new-code' })
    let restoreFocus: FrameRequestCallback | undefined
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      restoreFocus = callback
      return 0
    })
    const user = userEvent.setup()
    render(
      <>
        <Survey
          s={a11yStrings}
          conversation_id="test-conversation"
          requiresInviteCode
          initialStatement={{ tid: 1, txt: 'A statement' }}
        />
        <TreeviteLoginCodeModal s={a11yStrings} />
      </>
    )
    fireEvent.change(screen.getByLabelText(a11yStrings.invite_code_prompt), {
      target: { value: 'invite-code' }
    })
    const submit = screen.getByRole('button', { name: a11yStrings.submit_invite_code })
    submit.focus()
    fireEvent.click(submit)

    const dialog = await screen.findByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(screen.getByRole('status', { hidden: true }).textContent).toBe('')
    const agree = screen.getByRole('button', { name: a11yStrings.agree, hidden: true })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    if (!restoreFocus) throw new Error('Expected focus restoration to be scheduled')
    act(() => restoreFocus?.(0))
    expect(document.activeElement?.contains(agree)).toBe(true)
    await user.tab()
    expect(document.activeElement).toBe(agree)
  })

  it('announces an accepted invite without a login code after the form disappears', async () => {
    jest.mocked(acceptInvite).mockResolvedValue({ status: 'ok' })
    render(
      <Survey
        s={a11yStrings}
        conversation_id="test-conversation"
        requiresInviteCode
        initialStatement={{ tid: 1, txt: 'A statement' }}
      />
    )
    fireEvent.change(screen.getByLabelText(a11yStrings.invite_code_prompt), {
      target: { value: 'invite-code' }
    })
    fireEvent.click(screen.getByRole('button', { name: a11yStrings.submit_invite_code }))
    await screen.findByRole('button', { name: a11yStrings.agree })
    expect(screen.getByRole('status').textContent).toBe(
      a11yStrings.invite_code_accepted_message_no_code
    )
  })

  it('moves focus into participation when the focused login form disappears', async () => {
    jest.mocked(treeviteLogin).mockResolvedValue({ status: 'ok' })
    const user = userEvent.setup()
    render(
      <Survey
        s={a11yStrings}
        conversation_id="test-conversation"
        requiresInviteCode
        initialStatement={{ tid: 1, txt: 'A statement' }}
      />
    )

    fireEvent.change(screen.getByLabelText(a11yStrings.login_code_prompt), {
      target: { value: 'test-code' }
    })
    const submit = screen.getByRole('button', { name: a11yStrings.submit_login_code })
    submit.focus()
    fireEvent.click(submit)

    const agree = await screen.findByRole('button', { name: a11yStrings.agree })
    expect((await screen.findByRole('status')).textContent).toBe(a11yStrings.login_success)
    expect(document.activeElement?.contains(agree)).toBe(true)
    await user.tab()
    expect(document.activeElement).toBe(agree)
  })

  it('does not steal focus if a dialog or another control receives it during login', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <Survey s={a11yStrings} conversation_id="test-conversation" requiresInviteCode />
      </>
    )

    const outside = screen.getByRole('button', { name: 'Outside' })
    screen.getByLabelText(a11yStrings.login_code_prompt).focus()
    act(() => {
      window.dispatchEvent(new CustomEvent('login-code-submitted'))
      outside.focus()
    })
    expect(document.activeElement).toBe(outside)
  })

  it('keeps focus when the personalized statement is replaced by the email form', async () => {
    let resolveComment: ((value: { txt: string }) => void) | undefined
    jest.mocked(fetchNextComment).mockReturnValue(
      new Promise((resolve) => {
        resolveComment = resolve
      })
    )
    jest.mocked(treeviteLogin).mockResolvedValue({ status: 'ok' })
    render(
      <Survey
        s={a11yStrings}
        conversation_id="test-conversation"
        requiresInviteCode
        initialStatement={{ tid: 1, txt: 'A statement' }}
      />
    )

    fireEvent.change(screen.getByLabelText(a11yStrings.login_code_prompt), {
      target: { value: 'test-code' }
    })
    const submit = screen.getByRole('button', { name: a11yStrings.submit_login_code })
    submit.focus()
    fireEvent.click(submit)
    await screen.findByRole('button', { name: a11yStrings.agree })
    const landing = document.activeElement

    if (!resolveComment) throw new Error('Expected the next-comment request')
    await act(async () => {
      resolveComment?.({ txt: '' })
    })
    expect(screen.getByLabelText(a11yStrings.notificationsEnterEmail)).toBeTruthy()
    expect(document.activeElement).toBe(landing)
  })

  it('submits a vote with the keyboard and announces success', async () => {
    jest.mocked(submitVote).mockResolvedValue({
      nextComment: { tid: 2, txt: 'The next statement' }
    })
    const user = userEvent.setup()
    render(
      <Survey
        s={a11yStrings}
        conversation_id="test-conversation"
        initialStatement={{ tid: 1, txt: 'A statement' }}
      />
    )

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: a11yStrings.agree }))
    await user.keyboard('{Enter}')

    expect((await screen.findByRole('status')).textContent).toBe(a11yStrings.voteSubmitted)
    expect(screen.getByText('The next statement')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: a11yStrings.agree }))
  })

  it('restores focus to the vote button after it is disabled during a successful vote', async () => {
    let resolveVote: ((value: VoteResponse) => void) | undefined
    jest.mocked(submitVote).mockReturnValue(
      new Promise((resolve) => {
        resolveVote = resolve
      })
    )
    const user = userEvent.setup()
    render(
      <Survey
        s={a11yStrings}
        conversation_id="test-conversation"
        initialStatement={{ tid: 1, txt: 'A statement' }}
      />
    )
    const pass = screen.getByRole('button', { name: a11yStrings.pass })
    pass.focus()
    await user.keyboard('{Enter}')
    expect(pass.hasAttribute('disabled')).toBe(true)
    pass.blur()
    if (!resolveVote) throw new Error('Expected the vote request')
    await act(async () => resolveVote?.({ nextComment: { tid: 2, txt: 'Next statement' } }))
    expect(screen.getByText('Next statement')).toBeTruthy()
    expect(document.activeElement).toBe(pass)
  })

  it('moves focus to the email field when the last statement is voted on', async () => {
    let resolveVote: ((value: VoteResponse) => void) | undefined
    jest.mocked(submitVote).mockReturnValue(
      new Promise((resolve) => {
        resolveVote = resolve
      })
    )
    const user = userEvent.setup()
    render(
      <Survey
        s={a11yStrings}
        conversation_id="test-conversation"
        initialStatement={{ tid: 1, txt: 'A statement' }}
      />
    )
    const agree = screen.getByRole('button', { name: a11yStrings.agree })
    agree.focus()
    await user.keyboard('{Enter}')
    agree.blur()
    if (!resolveVote) throw new Error('Expected the vote request')
    await act(async () => resolveVote?.({}))
    expect(document.activeElement).toBe(screen.getByLabelText(a11yStrings.notificationsEnterEmail))
  })

  it('restores focus to the vote button if the vote fails', async () => {
    let rejectVote: ((reason: Error) => void) | undefined
    jest.mocked(submitVote).mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectVote = reject
      })
    )
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    render(
      <Survey
        s={a11yStrings}
        conversation_id="test-conversation"
        initialStatement={{ tid: 1, txt: 'A statement' }}
      />
    )
    const disagree = screen.getByRole('button', { name: a11yStrings.disagree })
    disagree.focus()
    await user.keyboard('{Enter}')
    disagree.blur()
    if (!rejectVote) throw new Error('Expected the vote request')
    await act(async () => rejectVote?.(new Error('Network error')))
    expect(screen.getByRole('alert').textContent).toBe(a11yStrings.voteFailedGeneric)
    expect(document.activeElement).toBe(disagree)
  })

  it('does not steal focus if the user moves elsewhere during a vote', async () => {
    let resolveVote: ((value: VoteResponse) => void) | undefined
    jest.mocked(submitVote).mockReturnValue(
      new Promise((resolve) => {
        resolveVote = resolve
      })
    )
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Outside</button>
        <Survey
          s={a11yStrings}
          conversation_id="test-conversation"
          initialStatement={{ tid: 1, txt: 'A statement' }}
        />
      </>
    )
    screen.getByRole('button', { name: a11yStrings.agree }).focus()
    await user.keyboard('{Enter}')
    const outside = screen.getByRole('button', { name: 'Outside' })
    outside.focus()
    if (!resolveVote) throw new Error('Expected the vote request')
    await act(async () => resolveVote?.({ nextComment: { tid: 2, txt: 'Next statement' } }))
    expect(document.activeElement).toBe(outside)
  })
})
