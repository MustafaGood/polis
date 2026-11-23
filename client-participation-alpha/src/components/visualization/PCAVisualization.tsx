import { Group } from '@visx/group'
import { useEffect, useId, useMemo, useState } from 'react'
import type { Comment, PCAData } from '../../api/types'
import { getConversationToken } from '../../lib/auth'
import type { Translations } from '../../strings/types'
import { GroupHulls } from './GroupHulls'
import { GroupLabels } from './GroupLabels'
import { StatementInfo } from './StatementInfo'
import { UserPositionIndicator } from './UserPositionIndicator'
import { VisualizationControls } from './VisualizationControls'
import { VoteBarCharts } from './VoteBarCharts'
import { height, margin, width, xMax, yMax, groupLetters } from './constants'
import type { SelectedStatement, StatementContext, StatementWithType } from './types'
import { useVisualizationData } from './useVisualizationData'

interface PCAVisualizationProps {
  data: PCAData
  comments?: Comment[] | null
  conversationId?: string
  s: Translations
}

export default function PCAVisualization({
  data,
  comments,
  conversationId,
  s
}: PCAVisualizationProps) {
  const [isConsensusSelected, setisConsensusSelected] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [selectedStatement, setSelectedStatement] = useState<SelectedStatement | null>(null)
  const [userPid, setUserPid] = useState<number | null>(null)
  const vizTitleId = useId()
  const vizDescriptionId = useId()

  // Get current user's PID
  useEffect(() => {
    const updatePid = () => {
      if (conversationId) {
        const token = getConversationToken(conversationId)
        if (token && typeof token.pid === 'number' && token.pid >= 0) {
          setUserPid(token.pid)
        } else {
          // PID is -1 or invalid - user hasn't voted yet, so they don't have a position on the PCA
          setUserPid(null)
        }
      }
    }

    updatePid()

    const handleTokenUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && detail.conversation_id === conversationId) {
        updatePid()
      }
    }

    window.addEventListener('polis-token-update', handleTokenUpdate)
    return () => window.removeEventListener('polis-token-update', handleTokenUpdate)
  }, [conversationId])

  // Use custom hook to process all visualization data
  const { hulls, originX, originY, userPosition, statements, groupVoteData } = useVisualizationData(
    data,
    selectedGroup,
    isConsensusSelected,
    selectedStatement?.tid ?? null,
    userPid
  )
  const formatCoordinate = (value: number) =>
    new Intl.NumberFormat(undefined, { maximumSignificantDigits: 3 }).format(value)
  const groupSummaries = data['group-clusters'].map((group) => {
    const label = `${s.group_123} ${groupLetters[group.id] ?? group.id}`
    const groupData = hulls.find((hull) => hull.groupId === group.id)
    const points = data['base-clusters'].id.reduce<{ x: number; y: number }[]>(
      (coordinates, clusterId, index) => {
        if (group.members.includes(clusterId)) {
          coordinates.push({
            x: data['base-clusters'].x[index],
            y: data['base-clusters'].y[index]
          })
        }
        return coordinates
      },
      []
    )
    const xValues = points.map(({ x }) => x)
    const yValues = points.map(({ y }) => y)
    const center = group.center
    const coordinate = (value: number | undefined) =>
      value === undefined ? s.pcaCoordinateUnavailable : formatCoordinate(value)
    return {
      id: group.id,
      label,
      description: s.pcaGroupDescription
        .replace('{{group}}', label)
        .replace('{{count}}', String(groupData?.participantCount ?? 0))
        .replace('{{xMin}}', coordinate(xValues.length ? Math.min(...xValues) : undefined))
        .replace('{{xMax}}', coordinate(xValues.length ? Math.max(...xValues) : undefined))
        .replace('{{yMin}}', coordinate(yValues.length ? Math.min(...yValues) : undefined))
        .replace('{{yMax}}', coordinate(yValues.length ? Math.max(...yValues) : undefined))
        .replace('{{centerX}}', coordinate(center?.[0]))
        .replace('{{centerY}}', coordinate(center?.[1])),
      points
    }
  })
  const groupDescriptions = groupSummaries.map(({ description }) => description)
  const userCluster =
    userPid === null
      ? undefined
      : data['base-clusters'].id.reduce<{ groupId: number; x: number; y: number } | undefined>(
          (found, clusterId, index) => {
            if (found || !data['base-clusters'].members?.[index]?.includes(userPid)) {
              return found
            }
            const group = data['group-clusters'].find((item) => item.members.includes(clusterId))
            if (!group) return undefined
            return {
              groupId: group.id,
              x: data['base-clusters'].x[index],
              y: data['base-clusters'].y[index]
            }
          },
          undefined
        )
  const userPositionDescription = userCluster
    ? s.pcaUserPositionDescription
        .replace(
          '{{group}}',
          `${s.group_123} ${groupLetters[userCluster.groupId] ?? userCluster.groupId}`
        )
        .replace('{{x}}', formatCoordinate(userCluster.x))
        .replace('{{y}}', formatCoordinate(userCluster.y))
    : conversationId
      ? s.pcaUserPositionUnavailable
      : null
  const visualizationDescription = [...groupDescriptions, userPositionDescription]
    .filter(Boolean)
    .join(' ')
  const displayedVoteData = groupVoteData.filter(
    (vote) => vote.total > 0 && hulls.some((hull) => hull.groupId === vote.groupId && hull.center)
  )

  // Find the comment text for the selected statement
  const selectedComment = useMemo(() => {
    if (!selectedStatement || !comments) return null
    return comments.find((c) => c.tid === selectedStatement.tid) ?? null
  }, [selectedStatement, comments])

  // Handler for consensus toggle
  const handleConsensusToggle = () => {
    const newValue = !isConsensusSelected
    setisConsensusSelected(newValue)
    if (newValue) {
      setSelectedGroup(null) // Clear group selection when consensus is selected
    }
    setSelectedStatement(null) // Reset selected statement
  }

  // Handler for group selection
  const handleGroupSelect = (groupId: number | null) => {
    setSelectedGroup(groupId)
    if (groupId !== null) {
      setisConsensusSelected(false) // Clear consensus selection when group is selected
    }
    setSelectedStatement(null) // Reset selected statement
  }

  // Handler for statement selection
  const handleStatementSelect = (
    statement: StatementWithType | null,
    context: StatementContext
  ) => {
    if (statement === null) {
      setSelectedStatement(null)
    } else {
      setSelectedStatement({
        ...statement,
        context
      })
    }
  }

  return (
    <section className="section-card">
      <h2>{s.opinionGroups}</h2>
      <svg
        width={width}
        height={height}
        style={{ maxWidth: '100%', height: 'auto' }}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={vizTitleId}
        aria-describedby={vizDescriptionId}
      >
        <title id={vizTitleId}>{s.opinionGroups}</title>
        <desc id={vizDescriptionId}>{visualizationDescription || s.opinionGroups}</desc>
        <Group left={margin.left} top={margin.top}>
          {/* Origin lines */}
          {originX >= 0 && originX <= xMax && (
            <line
              x1={originX}
              y1={0}
              x2={originX}
              y2={yMax}
              stroke="var(--color-axis-line)"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          )}
          {originY >= 0 && originY <= yMax && (
            <line
              x1={0}
              y1={originY}
              x2={xMax}
              y2={originY}
              stroke="var(--color-axis-line)"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          )}

          {/* Group hull polygons (animated) */}
          <GroupHulls hulls={hulls} selectedGroup={selectedGroup} />

          {/* User position indicator */}
          {userPosition && <UserPositionIndicator userPosition={userPosition} />}

          {/* Group labels (rendered above shapes) */}
          <GroupLabels hulls={hulls} selectedGroup={selectedGroup} userPosition={userPosition} />

          {/* Horizontal bar charts for selected statement votes */}
          {selectedStatement && <VoteBarCharts hulls={hulls} groupVoteData={groupVoteData} />}
        </Group>
      </svg>

      {/* Controls */}
      <details className="pca-text-description">
        <summary>{s.pcaTextDescription}</summary>
        <ul>
          {groupSummaries.map(({ id, label, description, points }) => (
            <li key={id}>
              {description}
              <details>
                <summary>{s.pcaGroupCoordinates.replace('{{group}}', label)}</summary>
                <ul>
                  {points.map(({ x, y }, index) => (
                    <li key={`${id}-${index}`}>
                      {s.pcaPointCoordinates
                        .replace('{{x}}', formatCoordinate(x))
                        .replace('{{y}}', formatCoordinate(y))}
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
          {userPositionDescription && <li>{userPositionDescription}</li>}
        </ul>
      </details>
      <VisualizationControls
        isConsensusSelected={isConsensusSelected}
        selectedGroup={selectedGroup}
        hulls={hulls}
        statements={statements}
        selectedStatement={selectedStatement}
        onConsensusToggle={handleConsensusToggle}
        onGroupSelect={handleGroupSelect}
        onStatementSelect={handleStatementSelect}
        s={s}
      />

      {/* Accessible text for current selection (not only in SVG) */}
      {(isConsensusSelected || selectedGroup !== null) && (
        <p
          role="status"
          style={{
            marginTop: '1rem',
            color: 'var(--color-text)',
            fontSize: '0.95rem'
          }}
        >
          {isConsensusSelected
            ? s.consensus
            : `${s.group_123} ${groupLetters[selectedGroup!] ?? selectedGroup}`}
          {selectedStatement ? ` ${s.comment_123} ${selectedStatement.tid}` : null}
        </p>
      )}

      {selectedStatement && displayedVoteData.length > 0 && (
        <table style={{ width: '100%', tableLayout: 'fixed', overflowWrap: 'anywhere' }}>
          <caption>{`${s.comment_123} ${selectedStatement.tid}`}</caption>
          <thead>
            <tr>
              <th scope="col">{s.group_123}</th>
              <th scope="col">{s.agree}</th>
              <th scope="col">{s.disagree}</th>
              <th scope="col">{s.pass}</th>
            </tr>
          </thead>
          <tbody>
            {displayedVoteData.map(({ groupId, agree, disagree, skip }) => (
              <tr key={groupId}>
                <th scope="row">{groupLetters[groupId] ?? groupId}</th>
                <td>{agree}</td>
                <td>{disagree}</td>
                <td>{skip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Statement info */}
      {(isConsensusSelected || selectedGroup !== null) && selectedStatement && (
        <StatementInfo
          selectedStatement={selectedStatement}
          selectedComment={selectedComment}
          s={s}
        />
      )}
    </section>
  )
}
