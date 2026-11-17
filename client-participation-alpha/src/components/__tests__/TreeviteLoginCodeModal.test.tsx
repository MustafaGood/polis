import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
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
    screen.getByRole('dialog', {
      name: a11yStrings.invite_code_required_short,
      description: a11yStrings.invite_code_accepted_message.replace('{{login_code}}', 'test-code')
    })
    expect(document.activeElement).toBe(okButton)

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(copyButton)

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(okButton)

    trigger.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(copyButton)

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 0
    })

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('restores focus to participation when the original trigger is removed', () => {
    function Example() {
      const [showTrigger, setShowTrigger] = useState(true)
      return (
        <>
          {showTrigger && (
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('treevite-login-code-issued', {
                    detail: { login_code: 'test-code' }
                  })
                )
                setShowTrigger(false)
              }}
            >
              Open login code
            </button>
          )}
          <div data-participation-content tabIndex={-1}>
            Participation
          </div>
          <TreeviteLoginCodeModal s={a11yStrings} />
        </>
      )
    }

    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Open login code' })
    trigger.focus()
    fireEvent.click(trigger)
    expect(screen.queryByRole('button', { name: 'Open login code' })).toBeNull()

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 0
    })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(screen.getByText('Participation'))
  })

  it('announces a clipboard failure instead of silently ignoring it', async () => {
    const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: jest.fn().mockRejectedValue(new Error('Clipboard unavailable')) }
    })
    jest.spyOn(console, 'error').mockImplementation(() => {})

    try {
      render(<TreeviteLoginCodeModal s={a11yStrings} />)
      fireEvent(
        window,
        new CustomEvent('treevite-login-code-issued', {
          detail: { login_code: 'test-code' }
        })
      )
      fireEvent.click(screen.getByRole('button', { name: a11yStrings.copy }))
      expect((await screen.findByRole('alert')).textContent).toBe(
        `${a11yStrings.error}. ${a11yStrings.oidcTryAgain}`
      )
    } finally {
      if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard)
      else Reflect.deleteProperty(navigator, 'clipboard')
    }
  })

  it('keeps focus on the copy button after copying', async () => {
    const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    })
    try {
      render(<TreeviteLoginCodeModal s={a11yStrings} />)
      fireEvent(
        window,
        new CustomEvent('treevite-login-code-issued', {
          detail: { login_code: 'test-code' }
        })
      )
      const copyButton = screen.getByRole('button', { name: a11yStrings.copy })
      copyButton.focus()
      fireEvent.click(copyButton)
      const copiedButton = await screen.findByRole('button', { name: a11yStrings.copied })
      expect(document.activeElement).toBe(copiedButton)
      expect(copiedButton.getAttribute('aria-disabled')).toBe('true')
      fireEvent.click(copiedButton)
      expect(writeText).toHaveBeenCalledTimes(1)
    } finally {
      if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard)
      else Reflect.deleteProperty(navigator, 'clipboard')
    }
  })

  it('does not steal focus if it moves elsewhere before restoration', () => {
    let restoreFocus: FrameRequestCallback | undefined
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      restoreFocus = callback
      return 0
    })
    render(
      <>
        <button type="button">Trigger</button>
        <button type="button">Other control</button>
        <TreeviteLoginCodeModal s={a11yStrings} />
      </>
    )
    screen.getByRole('button', { name: 'Trigger' }).focus()
    fireEvent(
      window,
      new CustomEvent('treevite-login-code-issued', {
        detail: { login_code: 'test-code' }
      })
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    const other = screen.getByRole('button', { name: 'Other control' })
    other.focus()
    if (!restoreFocus) throw new Error('Expected focus restoration to be scheduled')
    restoreFocus(0)
    expect(document.activeElement).toBe(other)
  })
})
