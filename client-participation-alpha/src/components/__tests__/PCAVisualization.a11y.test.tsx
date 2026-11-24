import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import concaveman from 'concaveman'
import type { PCAData } from '../../api/types'
import frenchStrings from '../../strings/fr'
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
  const negativeOne = '\u22121'

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
      within(description).getByText(
        `Group: A 12 participants; PCA 1 ranges from ${negativeOne} to ${negativeOne}, PCA 2 ranges from 1 to 1; center at PCA 1 ${negativeOne}, PCA 2 1.`
      )
    ).toBeTruthy()
    expect(
      within(description).getByText(
        `Group: B 20 participants; PCA 1 ranges from 1 to 1, PCA 2 ranges from ${negativeOne} to ${negativeOne}; center at PCA 1 1, PCA 2 ${negativeOne}.`
      )
    ).toBeTruthy()
    const coordinates = within(description)
      .getByText(a11yStrings.pcaGroupCoordinates.replace('{{group}}', 'Group: A'))
      .closest('details')
    if (!coordinates) throw new Error('Expected PCA group coordinates disclosure')
    expect(within(coordinates).getByText(`PCA 1 ${negativeOne}, PCA 2 1`)).toBeTruthy()
  })

  it('renders the PCA description and coordinates in French when translations are supplied', () => {
    const french = { ...a11yStrings, ...frenchStrings }
    render(<PCAVisualization data={data} s={french} />)

    expect(screen.getByText('Description textuelle des groupes d’opinion')).toBeTruthy()
    expect(
      screen.getByText(
        'PCA 1 augmente vers la droite ; PCA 2 augmente vers le bas. Les valeurs décrivent les positions sur le graphique.'
      )
    ).toBeTruthy()
    expect(
      screen.getByText(
        `Groupe : A 12 participants ; PCA 1 va de ${negativeOne} à ${negativeOne}, PCA 2 va de 1 à 1 ; centre à PCA 1 ${negativeOne}, PCA 2 1.`
      )
    ).toBeTruthy()
    expect(
      screen.getAllByText('Aucun contour de groupe ni segment de droite n’est tracé.')
    ).toHaveLength(2)
  })

  it('describes the axes and the actual polygon, line and absent shapes', () => {
    const shapeData: PCAData = {
      ...data,
      'base-clusters': {
        id: [10, 11, 12, 13, 14, 15, 16],
        x: [0, 2, 1, 1, 4, 5, 6],
        y: [0, 0, 2, 1, 3, 4, 5],
        count: [1, 1, 1, 1, 1, 1, 1],
        members: [[], [], [], [], [], [], []]
      },
      'group-clusters': [
        { id: 0, center: [1, 1], members: [10, 11, 12, 13] },
        { id: 1, center: [4, 3], members: [14, 15] },
        { id: 2, center: [6, 5], members: [16] },
        { id: 3, center: [0, 0], members: [] }
      ]
    }
    jest
      .mocked(concaveman)
      .mockImplementationOnce((points) => [points[2], points[0], points[1], points[2]])
    const { container } = render(<PCAVisualization data={shapeData} s={a11yStrings} />)

    const image = screen.getByRole('img', { name: a11yStrings.opinionGroups })
    expect(image.getAttribute('aria-describedby')).toBeTruthy()
    const svgDescription = container.querySelector('svg desc')
    expect(svgDescription?.textContent).toContain(a11yStrings.pcaAxesDescription)
    expect(svgDescription?.textContent).toContain(a11yStrings.pcaPolygonDescription)
    expect(
      screen.getByText(
        'PCA 1 increases to the right; PCA 2 increases downward. The values describe positions on the graph.'
      )
    ).toBeTruthy()

    const outline = (group: string) => {
      const details = screen
        .getByText(a11yStrings.pcaOutlineCoordinates.replace('{{group}}', `Group: ${group}`))
        .closest('details')
      if (!details) throw new Error('Expected outline coordinates')
      return Array.from(details.querySelectorAll('ol > li'), (item) => item.textContent)
    }
    expect(outline('A')).toEqual([
      'PCA 1 1, PCA 2 2',
      'PCA 1 0, PCA 2 0',
      'PCA 1 2, PCA 2 0',
      'PCA 1 1, PCA 2 2'
    ])
    expect(outline('B')).toEqual(['PCA 1 4, PCA 2 3', 'PCA 1 5, PCA 2 4'])
    expect(screen.getByText(a11yStrings.pcaPolygonDescription)).toBeTruthy()
    expect(screen.getByText(a11yStrings.pcaLineDescription)).toBeTruthy()
    expect(screen.getAllByText(a11yStrings.pcaNoShapeDescription)).toHaveLength(2)
    expect(screen.queryByText('Outline coordinates for Group: C')).toBeNull()
    expect(screen.queryByText('Outline coordinates for Group: D')).toBeNull()

    const hull = jest.mocked(concaveman).mock.results.at(-1)?.value
    expect(container.querySelector('svg path')?.getAttribute('d')).toBe(
      `M${hull.map((point: number[]) => point.join(',')).join('L')}Z`
    )
    const line = container.querySelector('svg line[stroke-linecap="round"]')
    if (!line) throw new Error('Expected the group line')
    expect(Number(line.getAttribute('x1'))).toBeCloseTo((4.6 / 7.2) * 700)
    expect(Number(line.getAttribute('y1'))).toBeCloseTo((3.5 / 6) * 500)
    expect(Number(line.getAttribute('x2'))).toBeCloseTo((5.6 / 7.2) * 700)
    expect(Number(line.getAttribute('y2'))).toBeCloseTo((4.5 / 6) * 500)
  })

  it('keeps duplicate line endpoints and reports a missing hull without inventing a shape', () => {
    const duplicateData: PCAData = {
      ...data,
      'base-clusters': {
        id: [10, 11, 12, 13, 14],
        x: [0, 0, 0, 0, 0],
        y: [0, 0, 0, 0, 0],
        count: [1, 1, 1, 1, 1],
        members: [[], [], [], [], []]
      },
      'group-clusters': [
        { id: 0, center: [0, 0], members: [10, 11, 12] },
        { id: 1, center: [0, 0], members: [13, 14] }
      ]
    }
    render(<PCAVisualization data={duplicateData} s={a11yStrings} />)
    expect(screen.getByText(a11yStrings.pcaNoShapeDescription)).toBeTruthy()
    const details = screen.getByText('Outline coordinates for Group: B').closest('details')
    if (!details) throw new Error('Expected line coordinates')
    expect(Array.from(details.querySelectorAll('ol > li'), (item) => item.textContent)).toEqual([
      'PCA 1 0, PCA 2 0',
      'PCA 1 0, PCA 2 0'
    ])
  })

  it('matches the participant description to the plotted cluster position', () => {
    mockGetConversationToken.mockReturnValue({ token: 'test-token', pid: 101 })
    const { container } = render(
      <PCAVisualization data={data} conversationId="test-conversation" s={a11yStrings} />
    )
    const description = screen.getByText(a11yStrings.pcaTextDescription).closest('details')
    if (!description) throw new Error('Expected PCA text description disclosure')

    expect(
      within(description).getByText(
        `Your position is represented by a point in Group: A at PCA 1 ${negativeOne}, PCA 2 1.`
      )
    ).toBeTruthy()

    const userMarker = container.querySelector('svg circle')
    if (!userMarker) throw new Error('Expected the participant marker in the PCA graph')
    expect(Number(userMarker.getAttribute('cx'))).toBeCloseTo(700 / 12)
    expect(Number(userMarker.getAttribute('cy'))).toBeCloseTo((11 / 12) * 500)
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
