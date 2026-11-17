import { fireEvent, render, screen } from '@testing-library/react'
import type { PCAData } from '../../api/types'
import { a11yStrings } from '../../test-utils/a11y'

jest.mock('../../lib/auth', () => ({
  getConversationToken: jest.fn()
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
    members: [[], []]
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
      description: `${a11yStrings.group_123} A, 12; ${a11yStrings.group_123} B, 20`
    })
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
})
