import { fireEvent, render, screen } from '@testing-library/react'
import { acceptInvite, treeviteLogin } from '../../api/treevite'
import { a11yStrings, expectNoA11yViolations } from '../../test-utils/a11y'
import InviteCodeSubmissionForm from '../InviteCodeSubmissionForm'

jest.mock('../../api/treevite', () => ({
  acceptInvite: jest.fn(),
  treeviteLogin: jest.fn()
}))

describe('InviteCodeSubmissionForm a11y', () => {
  beforeEach(() => {
    jest.mocked(acceptInvite).mockReset()
    jest.mocked(treeviteLogin).mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('has no accessibility violations in default state', async () => {
    const { container } = render(
      <InviteCodeSubmissionForm s={a11yStrings} conversation_id="test-conversation" />
    )

    await expectNoA11yViolations(container)
  })

  it('does not send codes containing only whitespace', () => {
    render(<InviteCodeSubmissionForm s={a11yStrings} conversation_id="test-conversation" />)

    const invite = screen.getByLabelText(a11yStrings.invite_code_prompt) as HTMLInputElement
    const login = screen.getByLabelText(a11yStrings.login_code_prompt) as HTMLInputElement
    fireEvent.change(invite, { target: { value: '   ' } })
    fireEvent.change(login, { target: { value: '   ' } })
    expect(
      (screen.getByRole('button', { name: a11yStrings.submit_invite_code }) as HTMLButtonElement)
        .disabled
    ).toBe(true)
    expect(
      (screen.getByRole('button', { name: a11yStrings.submit_login_code }) as HTMLButtonElement)
        .disabled
    ).toBe(true)

    const inviteForm = invite.closest('form')
    const loginForm = login.closest('form')
    if (!inviteForm || !loginForm) throw new Error('Expected both code forms')
    fireEvent.submit(inviteForm)
    fireEvent.submit(loginForm)
    expect(acceptInvite).not.toHaveBeenCalled()
    expect(treeviteLogin).not.toHaveBeenCalled()
  })

  it('associates an invalid code error with the correct field and clears it on edit', async () => {
    jest.mocked(acceptInvite).mockRejectedValue({
      responseText: 'polis_err_treevite_invalid_or_used_invite'
    })
    const { container } = render(
      <InviteCodeSubmissionForm s={a11yStrings} conversation_id="test-conversation" />
    )

    const invite = screen.getByLabelText(a11yStrings.invite_code_prompt) as HTMLInputElement
    const login = screen.getByLabelText(a11yStrings.login_code_prompt) as HTMLInputElement
    fireEvent.change(invite, { target: { value: 'invalid' } })
    fireEvent.click(screen.getByRole('button', { name: a11yStrings.submit_invite_code }))
    expect((await screen.findByRole('alert')).textContent).toBe(a11yStrings.invite_code_invalid)
    expect(invite.getAttribute('aria-invalid')).toBe('true')
    expect(invite.getAttribute('aria-describedby')).toBe('invite-code-error')
    expect(login.getAttribute('aria-invalid')).toBe('false')
    await expectNoA11yViolations(container)

    fireEvent.change(invite, { target: { value: 'corrected' } })
    expect(screen.queryByRole('alert')).toBeNull()
    expect(invite.getAttribute('aria-invalid')).toBe('false')
  })

  it('does not report a network failure as an invalid login code', async () => {
    jest.mocked(treeviteLogin).mockRejectedValue(new Error('Network error'))
    render(<InviteCodeSubmissionForm s={a11yStrings} conversation_id="test-conversation" />)

    const login = screen.getByLabelText(a11yStrings.login_code_prompt) as HTMLInputElement
    fireEvent.change(login, { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: a11yStrings.submit_login_code }))
    expect((await screen.findByRole('alert')).textContent).toBe(
      `${a11yStrings.error}. ${a11yStrings.oidcTryAgain}`
    )
    expect(login.getAttribute('aria-invalid')).toBe('false')
    expect(login.getAttribute('aria-describedby')).toBe('invite-code-error')
    expect(login.value).toBe('123456')
  })

  it('prevents either code from being submitted while the other request is pending', () => {
    jest.mocked(acceptInvite).mockReturnValue(new Promise(() => {}))
    render(<InviteCodeSubmissionForm s={a11yStrings} conversation_id="test-conversation" />)

    const invite = screen.getByLabelText(a11yStrings.invite_code_prompt) as HTMLInputElement
    const login = screen.getByLabelText(a11yStrings.login_code_prompt) as HTMLInputElement
    fireEvent.change(invite, { target: { value: 'invite' } })
    fireEvent.change(login, { target: { value: 'login' } })
    fireEvent.click(screen.getByRole('button', { name: a11yStrings.submit_invite_code }))

    expect(invite.readOnly).toBe(true)
    expect(
      screen
        .getByRole('button', { name: a11yStrings.submit_login_code })
        .getAttribute('aria-disabled')
    ).toBe('true')
    const loginForm = login.closest('form')
    if (!loginForm) throw new Error('Expected the login form')
    fireEvent.submit(loginForm)
    expect(treeviteLogin).not.toHaveBeenCalled()
  })

  it('returns focus to the input when a successful submission clears the code', async () => {
    jest.mocked(acceptInvite).mockResolvedValue({ status: 'ok' })
    render(<InviteCodeSubmissionForm s={a11yStrings} conversation_id="test-conversation" />)

    const invite = screen.getByLabelText(a11yStrings.invite_code_prompt) as HTMLInputElement
    fireEvent.change(invite, { target: { value: 'invite' } })
    const button = screen.getByRole('button', { name: a11yStrings.submit_invite_code })
    button.focus()
    fireEvent.click(button)
    await screen.findByRole('status')
    expect(invite.value).toBe('')
    expect(document.activeElement).toBe(invite)
  })
})
