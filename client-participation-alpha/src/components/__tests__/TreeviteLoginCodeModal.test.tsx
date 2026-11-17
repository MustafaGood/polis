import { fireEvent, render, screen } from '@testing-library/react'
import { a11yStrings } from '../../test-utils/a11y'
import TreeviteLoginCodeModal from '../TreeviteLoginCodeModal'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('Treevite login code modal keyboard and focus behavior', () => {
  it('focuses the primary action, traps Tab, and restores focus on Escape', () => {
    const { queryByRole } = render(
      <>
        <button type="button">Open login code</button>
        <TreeviteLoginCodeModal s={a11yStrings} />
      </>
    )
    const trigger = screen.getByRole('button', { name: 'Open login code' })
    trigger.focus()

    fireEvent(
      window,
      new CustomEvent('treevite-login-code-issued', {
        detail: { login_code: 'test-code' }
      })
    )

    const okButton = screen.getByRole('button', { name: a11yStrings.ok_got_it })
    const copyButton = screen.getByRole('button', { name: a11yStrings.copy })
    expect(document.activeElement).toBe(okButton)

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(copyButton)

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(okButton)

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 0
    })

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})
