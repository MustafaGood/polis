import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import UploadXidsModal from './UploadXidsModal'

const TestModal = ({ onUpload = jest.fn() }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <UploadXidsModal isOpen={open} onClose={() => setOpen(false)} onUpload={onUpload} />
    </>
  )
}

it('names the dialog and controls, contains tab focus, and restores focus on Escape', () => {
  render(<TestModal />)
  const opener = screen.getByRole('button', { name: 'Open' })
  opener.focus()
  fireEvent.click(opener)
  expect(screen.getByRole('dialog', { name: 'Upload XIDs' })).toHaveAttribute('aria-modal', 'true')
  const close = screen.getByRole('button', { name: 'Close' })
  expect(close).toHaveFocus()
  expect(screen.getByRole('textbox', { name: 'Allowed XIDs' })).toBeInTheDocument()
  const cancel = screen.getByRole('button', { name: 'Cancel' })
  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
  expect(cancel).toHaveFocus()
  fireEvent.keyDown(cancel, { key: 'Tab' })
  expect(close).toHaveFocus()
  fireEvent.keyDown(close, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('offers a keyboard-operable file picker and preserves upload behavior', () => {
  const onUpload = jest.fn()
  const { container } = render(<TestModal onUpload={onUpload} />)
  fireEvent.click(screen.getByRole('button', { name: 'Open' }))
  const fileInput = container.querySelector('input[type="file"]')
  const click = jest.spyOn(fileInput, 'click').mockImplementation(() => {})
  fireEvent.click(screen.getByRole('button', { name: /Click to browse/ }))
  expect(click).toHaveBeenCalledTimes(1)
  fireEvent.change(screen.getByRole('textbox', { name: 'Allowed XIDs' }), {
    target: { value: 'one\ntwo' }
  })
  fireEvent.click(screen.getByRole('checkbox', { name: 'Replace all existing XIDs' }))
  fireEvent.click(screen.getByRole('button', { name: 'Upload XIDs' }))
  expect(onUpload).toHaveBeenCalledWith(['one', 'two'], true)
  click.mockRestore()
})
