import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ParticipantManagement from './ParticipantManagement'
import { ConversationDataProvider } from '../../util/conversation_data'
import PolisNet from '../../util/net'
import * as actions from '../../actions'

jest.mock('../../util/net')
jest.mock('../../actions', () => ({ handleConversationDataUpdate: jest.fn() }))
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({ conversation_id: 'test123' })
}))

it('names the participant requirement checkboxes and permits label activation', async () => {
  PolisNet.polisGet.mockResolvedValue({ xids: [] })
  actions.handleConversationDataUpdate.mockReturnValue({ type: 'TEST' })
  const store = configureStore({
    reducer: () => ({ conversationData: { conversation_id: 'test123' } })
  })
  render(
    <Provider store={store}>
      <ConversationDataProvider>
        <ParticipantManagement />
      </ConversationDataProvider>
    </Provider>
  )
  expect(screen.getByRole('checkbox', { name: 'XID Required to Vote' })).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Use XID Allow List' })).toBeInTheDocument()
  expect(
    screen.getByRole('checkbox', { name: 'Require BankID or Freja eID to participate' })
  ).toBeInTheDocument()
  fireEvent.click(screen.getByText('Use XID Allow List'))
  expect(actions.handleConversationDataUpdate).toHaveBeenCalledWith(
    expect.anything(),
    'use_xid_whitelist',
    true
  )
  await waitFor(() =>
    expect(screen.getByText('No XIDs found for this conversation.')).toBeInTheDocument()
  )
})
