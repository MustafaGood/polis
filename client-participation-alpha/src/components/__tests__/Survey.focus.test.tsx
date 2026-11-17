import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fetchNextComment } from '../../api/comments'
import { acceptInvite, treeviteLogin } from '../../api/treevite'
import { a11yStrings } from '../../test-utils/a11y'
import Survey from '../Survey'
import TreeviteLoginCodeModal from '../TreeviteLoginCodeModal'

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
    const agree = screen.getByRole('button', { name: a11yStrings.agree, hidden: true })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    if (!restoreFocus) throw new Error('Expected focus restoration to be scheduled')
    act(() => restoreFocus?.(0))
    expect(document.activeElement?.contains(agree)).toBe(true)
    await user.tab()
    expect(document.activeElement).toBe(agree)
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
})
