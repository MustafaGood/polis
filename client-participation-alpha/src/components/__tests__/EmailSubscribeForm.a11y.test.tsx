import { act, fireEvent, render, screen } from '@testing-library/react'
import { subscribeToNotifications } from '../../api/notifications'
import { a11yStrings, expectNoA11yViolations } from '../../test-utils/a11y'
import EmailSubscribeForm from '../EmailSubscribeForm'

jest.mock('../../api/notifications', () => ({
  subscribeToNotifications: jest.fn()
}))

describe('EmailSubscribeForm a11y', () => {
  beforeEach(() => {
    jest.mocked(subscribeToNotifications).mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('has no accessibility violations in default state', async () => {
    const { container } = render(
      <EmailSubscribeForm s={a11yStrings} conversation_id="test-conversation" />
    )

    await expectNoA11yViolations(container)
  })

  it('allows invalid input to be validated without sending it to the API', () => {
    render(<EmailSubscribeForm s={a11yStrings} conversation_id="test-conversation" />)

    const input = screen.getByLabelText(a11yStrings.notificationsEnterEmail) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'not-an-email' } })
    const button = screen.getByRole('button', {
      name: a11yStrings.notificationsSubscribeButton
    }) as HTMLButtonElement
    expect(button.disabled).toBe(false)
    const form = input.closest('form')
    if (!form) throw new Error('Expected the email form')
    fireEvent.submit(form)
    expect(subscribeToNotifications).not.toHaveBeenCalled()
  })

  it('announces a failed request without treating the email as invalid and clears it on edit', async () => {
    jest.mocked(subscribeToNotifications).mockRejectedValue(new Error('Network error'))
    const { container } = render(
      <EmailSubscribeForm s={a11yStrings} conversation_id="test-conversation" />
    )

    const input = screen.getByLabelText(a11yStrings.notificationsEnterEmail) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'person@example.com' } })
    const button = screen.getByRole('button', { name: a11yStrings.notificationsSubscribeButton })
    button.focus()
    fireEvent.click(button)

    expect((await screen.findByRole('alert')).textContent).toBe(
      a11yStrings.notificationsSubscribeErrorGeneric
    )
    expect(input.getAttribute('aria-invalid')).not.toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('email-subscribe-error')
    expect(input.value).toBe('person@example.com')
    expect(document.activeElement).toBe(button)
    await expectNoA11yViolations(container)

    fireEvent.change(input, { target: { value: 'other@example.com' } })
    expect(screen.queryByRole('alert')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBeNull()
  })

  it('moves focus to the success message when the focused submit button is removed', async () => {
    jest.mocked(subscribeToNotifications).mockResolvedValue({})
    render(<EmailSubscribeForm s={a11yStrings} conversation_id="test-conversation" />)

    const input = screen.getByLabelText(a11yStrings.notificationsEnterEmail) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'person@example.com' } })
    const button = screen.getByRole('button', { name: a11yStrings.notificationsSubscribeButton })
    button.focus()
    fireEvent.click(button)
    const status = await screen.findByRole('status')
    expect(status.textContent).toBe(a11yStrings.notificationsAlreadySubscribed)
    expect(document.activeElement).toBe(status)
  })

  it('prevents a second request without stealing focus if the user moves away', async () => {
    let finishRequest: (() => void) | undefined
    jest.mocked(subscribeToNotifications).mockReturnValue(
      new Promise((resolve) => {
        finishRequest = () => resolve({})
      })
    )
    render(
      <>
        <EmailSubscribeForm s={a11yStrings} conversation_id="test-conversation" />
        <button type="button">Outside</button>
      </>
    )

    const input = screen.getByLabelText(a11yStrings.notificationsEnterEmail) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'person@example.com' } })
    const submit = screen.getByRole('button', { name: a11yStrings.notificationsSubscribeButton })
    submit.focus()
    fireEvent.click(submit)
    expect(submit.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(submit)
    expect(subscribeToNotifications).toHaveBeenCalledTimes(1)

    const outside = screen.getByRole('button', { name: 'Outside' })
    outside.focus()
    if (!finishRequest) throw new Error('Expected the subscription request')
    await act(async () => {
      finishRequest?.()
    })
    expect(screen.getByRole('status')).toBeTruthy()
    expect(document.activeElement).toBe(outside)
  })
})
