import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import XidAllowListTable from './XidAllowListTable'
import PolisNet from '../../../util/net'

jest.mock('../../../util/net')

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  jest.resetAllMocks()
})

it.each([
  ['empty', [], [{ xid: 'new-xid', pid: null }]],
  ['populated', [{ xid: 'old-xid', pid: null }], []]
])('restores focus after upload from a %s list through reload', async (_, initial, reloaded) => {
  const post = deferred()
  const reload = deferred()
  PolisNet.polisGet.mockResolvedValueOnce({ xids: initial }).mockReturnValueOnce(reload.promise)
  PolisNet.polisPost.mockReturnValueOnce(post.promise)
  render(<XidAllowListTable conversationId="test123" />)
  const opener = await screen.findByRole('button', { name: 'Upload XIDs' })
  opener.focus()
  fireEvent.click(opener)
  fireEvent.change(screen.getByRole('textbox', { name: 'Allowed XIDs' }), {
    target: { value: 'new-xid' }
  })
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Upload XIDs' }))

  expect(opener).toBeInTheDocument()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await act(async () => post.resolve({}))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(opener).toHaveFocus()

  await act(async () => reload.resolve({ xids: reloaded }))
  if (reloaded.length) {
    expect(await screen.findByText('new-xid')).toBeInTheDocument()
  } else {
    expect(
      await screen.findByText('No XIDs in the allow list for this conversation.')
    ).toBeInTheDocument()
  }
  expect(opener).toHaveFocus()
})

it('retains the focused opener if the post-upload reload fails', async () => {
  PolisNet.polisGet
    .mockResolvedValueOnce({ xids: [] })
    .mockRejectedValueOnce(new Error('Reload failed'))
  PolisNet.polisPost.mockResolvedValueOnce({})
  render(<XidAllowListTable conversationId="test123" />)
  const opener = await screen.findByRole('button', { name: 'Upload XIDs' })
  opener.focus()
  fireEvent.click(opener)
  fireEvent.change(screen.getByRole('textbox', { name: 'Allowed XIDs' }), {
    target: { value: 'new-xid' }
  })
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Upload XIDs' }))
  expect(await screen.findByText('Reload failed')).toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('keeps the dialog open when an upload from an empty list fails', async () => {
  const alert = jest.spyOn(window, 'alert').mockImplementation(() => {})
  PolisNet.polisGet.mockResolvedValueOnce({ xids: [] })
  PolisNet.polisPost.mockRejectedValueOnce(new Error('Upload failed'))
  render(<XidAllowListTable conversationId="test123" />)
  const opener = await screen.findByRole('button', { name: 'Upload XIDs' })
  opener.focus()
  fireEvent.click(opener)
  fireEvent.change(screen.getByRole('textbox', { name: 'Allowed XIDs' }), {
    target: { value: 'new-xid' }
  })
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Upload XIDs' }))
  await waitFor(() => expect(alert).toHaveBeenCalledWith('Upload failed'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(opener).toHaveFocus()
  alert.mockRestore()
})
