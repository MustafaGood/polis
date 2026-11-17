import { fireEvent, render, screen } from '@testing-library/react'
import { submitComment } from '../../api/comments'
import { a11yStrings, expectNoA11yViolations } from '../../test-utils/a11y'
import SurveyForm from '../SurveyForm'

jest.mock('../../api/comments', () => ({
  submitComment: jest.fn()
}))

jest.mock('../../lib/auth', () => ({
  getConversationToken: () => ({ token: 'test-token', pid: 1 })
}))

describe('SurveyForm a11y', () => {
  beforeEach(() => {
    jest.mocked(submitComment).mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('has no accessibility violations in default state', async () => {
    const { container } = render(<SurveyForm s={a11yStrings} conversation_id="test-conversation" />)

    await expectNoA11yViolations(container)
  })

  it('keeps the statement available and prevents resubmission while the request is pending', () => {
    jest.mocked(submitComment).mockReturnValue(new Promise(() => {}))
    render(<SurveyForm s={a11yStrings} conversation_id="test-conversation" />)

    const textarea = screen.getByLabelText(a11yStrings.writePrompt) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'A new perspective' } })
    const button = screen.getByRole('button', { name: a11yStrings.submitComment })
    button.focus()
    fireEvent.click(button)

    expect(textarea.value).toBe('A new perspective')
    expect(textarea.required).toBe(true)
    expect(a11yStrings.helpWriteListShort).toContain(String(textarea.maxLength))
    expect(textarea.readOnly).toBe(true)
    expect(textarea.getAttribute('aria-describedby')).toContain('comment-char-counter')
    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(button)
    fireEvent.click(button)
    expect(submitComment).toHaveBeenCalledTimes(1)
  })

  it('keeps failed text and clears a duplicate error when the user corrects it', async () => {
    jest.mocked(submitComment).mockRejectedValue({
      responseText: 'polis_err_comment_duplicate'
    })
    const { container } = render(<SurveyForm s={a11yStrings} conversation_id="test-conversation" />)

    const textarea = screen.getByLabelText(a11yStrings.writePrompt) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'A duplicate statement' } })
    fireEvent.click(screen.getByRole('button', { name: a11yStrings.submitComment }))

    expect((await screen.findByRole('alert')).textContent).toBe(a11yStrings.commentErrorDuplicate)
    expect(textarea.value).toBe('A duplicate statement')
    expect(textarea.readOnly).toBe(false)
    expect(textarea.getAttribute('aria-invalid')).toBe('true')
    expect(textarea.getAttribute('aria-describedby')).toContain('survey-form-error')
    await expectNoA11yViolations(container)

    fireEvent.change(textarea, { target: { value: 'A different statement' } })
    expect(screen.queryByRole('alert')).toBeNull()
    expect(textarea.getAttribute('aria-invalid')).toBe('false')
  })

  it('clears the submitted statement only after success and announces the result', async () => {
    jest.mocked(submitComment).mockResolvedValue({})
    render(<SurveyForm s={a11yStrings} conversation_id="test-conversation" />)

    const textarea = screen.getByLabelText(a11yStrings.writePrompt) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'A new perspective' } })
    const button = screen.getByRole('button', { name: a11yStrings.submitComment })
    button.focus()
    fireEvent.click(button)

    expect((await screen.findByRole('status')).textContent).toBe(a11yStrings.commentSent)
    expect(textarea.value).toBe('')
    expect(textarea.readOnly).toBe(false)
    expect(document.activeElement).toBe(textarea)
  })
})
