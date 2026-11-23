import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PCAData } from '../../api/types'
import { a11yStrings, expectNoA11yViolations } from '../../test-utils/a11y'

const mockGetConversationToken = jest.fn()

jest.mock('../../lib/auth', () => ({
  getConversationToken: (...args: unknown[]) => mockGetConversationToken(...args)
}))
jest.mock('concaveman', () => ({
  __esModule: true,
  default: jest.fn(() => [])
}))

import PCAVisualization from '../visualization/PCAVisualization'

const data: PCAData = {
  'base-clusters': {
    id: [10, 11],
    x: [-1, 1],
    y: [1, -1],
    count: [12, 20],
    members: [[101], []]
  },
  'group-clusters': [
    { id: 0, center: [-1, 1], members: [10] },
    { id: 1, center: [1, -1], members: [11] }
  ],
  repness: {
    '0': [
      {
        tid: 42,
        'n-success': 10,
        'n-trials': 12,
        'p-success': 0.83,
        'p-test': 0.01,
        repness: 1,
        'repness-test': 0.01,
        'repful-for': 'agree'
      }
    ]
  },
  'group-aware-consensus': { '42': 0.9 },
  'group-votes': {
    '0': {
      'n-members': 12,
      votes: { '42': { A: 10, D: 2, S: 0 } }
    }
  }
}

describe('PCA visualization accessibility', () => {
  it('describes the displayed groups and their data counts', () => {
    render(<PCAVisualization data={data} s={a11yStrings} />)

    screen.getByRole('img', {
      name: a11yStrings.opinionGroups,
      description: /PCA 1 ranges from/
    })
  })

  it('provides a text summary of group coordinate ranges and centers', () => {
    render(<PCAVisualization data={data} s={a11yStrings} />)
    const description = screen.getByText(a11yStrings.pcaTextDescription).closest('details')
    if (!description) throw new Error('Expected PCA text description disclosure')

    expect(
      within(description).getByText((content) =>
        content.startsWith('Group: A 12 participants; PCA 1 ranges from')
      )
    ).toBeTruthy()
    expect(
      within(description).getByText((content) =>
        content.startsWith('Group: B 20 participants; PCA 1 ranges from')
      )
    ).toBeTruthy()
    const coordinates = within(description)
      .getByText(a11yStrings.pcaGroupCoordinates.replace('{{group}}', 'Group: A'))
      .closest('details')
    if (!coordinates) throw new Error('Expected PCA group coordinates disclosure')
    expect(
      within(coordinates).getByText(
        (content) => content.includes('PCA 1') && content.includes('PCA 2')
      )
    ).toBeTruthy()
  })

  it('describes the participant cluster position when available', () => {
    mockGetConversationToken.mockReturnValue({ token: 'test-token', pid: 101 })
    render(<PCAVisualization data={data} conversationId="test-conversation" s={a11yStrings} />)
    const description = screen.getByText(a11yStrings.pcaTextDescription).closest('details')
    if (!description) throw new Error('Expected PCA text description disclosure')

    expect(
      within(description).getByText((content) =>
        content.startsWith('Your position is represented by a point in Group: A at PCA 1')
      )
    ).toBeTruthy()
  })

  it('names group and statement controls with their selection context', () => {
    render(<PCAVisualization data={data} s={a11yStrings} />)

    fireEvent.click(screen.getByRole('button', { name: `${a11yStrings.group_123} A` }))

    screen.getByRole('button', {
      name: `${a11yStrings.comment_123} 42, ${a11yStrings.group_123} A`
    })

    fireEvent.click(screen.getByRole('button', { name: a11yStrings.consensus }))

    screen.getByRole('button', {
      name: `${a11yStrings.comment_123} 42, ${a11yStrings.consensus}`
    })
  })

  it('operates consensus and group controls with the keyboard', async () => {
    const user = userEvent.setup()
    render(<PCAVisualization data={data} s={a11yStrings} />)

    await user.tab()
    const consensus = screen.getByRole('button', { name: a11yStrings.consensus })
    expect(document.activeElement).toBe(consensus)
    await user.keyboard('{Enter}')
    expect(consensus.getAttribute('aria-pressed')).toBe('true')

    await user.tab()
    const group = screen.getByRole('button', { name: `${a11yStrings.group_123} A` })
    expect(document.activeElement).toBe(group)
    await user.keyboard(' ')
    expect(group.getAttribute('aria-pressed')).toBe('true')
  })

  it('provides a text table for the selected statement vote bars, including statement zero', async () => {
    const zeroData: PCAData = {
      ...data,
      repness: {
        '0': [{ ...data.repness!['0'][0], tid: 0 }]
      },
      'group-votes': {
        '0': { 'n-members': 12, votes: { '0': { A: 10, D: 1, S: 1 } } }
      }
    }
    const { container } = render(<PCAVisualization data={zeroData} s={a11yStrings} />)

    expect(screen.queryByRole('table')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: `${a11yStrings.group_123} A` }))
    fireEvent.click(
      screen.getByRole('button', {
        name: `${a11yStrings.comment_123} 0, ${a11yStrings.group_123} A`
      })
    )

    const table = screen.getByRole('table', { name: `${a11yStrings.comment_123} 0` })
    expect(within(table).getByRole('columnheader', { name: a11yStrings.agree })).toBeTruthy()
    expect(within(table).getByRole('columnheader', { name: a11yStrings.disagree })).toBeTruthy()
    expect(within(table).getByRole('columnheader', { name: a11yStrings.pass })).toBeTruthy()
    const row = within(table).getByRole('row', { name: 'A 10 1 1' })
    expect(within(row).getByRole('rowheader', { name: 'A' })).toBeTruthy()
    await expectNoA11yViolations(container)
  })

  it('names a group control when no letter is defined for its id', () => {
    const additionalGroup: PCAData = {
      ...data,
      'group-clusters': [{ id: 8, center: [-1, 1], members: [10] }]
    }
    render(<PCAVisualization data={additionalGroup} s={a11yStrings} />)

    screen.getByRole('button', { name: `${a11yStrings.group_123} 8` })
  })
})
