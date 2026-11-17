import { Heading, Box, Text, Flex, Button } from 'theme-ui'
import { useParams } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useConversationData } from '../../util/conversation_data'
import { handleConversationDataUpdate } from '../../actions'
import Pagination from './Pagination'
import XidsInUseTable from './ParticipantManagement/XidsInUseTable.js'
import XidAllowListTable from './ParticipantManagement/XidAllowListTable.js'
import PolisNet from '../../util/net'
import Spinner from '../framework/Spinner'

const ParticipantManagement = () => {
  const params = useParams()
  const conversationData = useConversationData()
  const dispatch = useDispatch()
  const conversationId = useMemo(
    () => conversationData?.conversation_id || params.conversation_id,
    [conversationData?.conversation_id, params.conversation_id]
  )

  const [xids, setXids] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [limit] = useState(50)

  const useXidAllowList = Boolean(conversationData?.use_xid_whitelist)
  const xidRequired = Boolean(conversationData?.xid_required)
  const eidRequired = Boolean(conversationData?.eid_required)
  const hasXidRequirement = useXidAllowList || xidRequired
  const [activeTab, setActiveTab] = useState('inUse') // 'inUse' | 'allowList'

  const handleXidAllowListToggle = () => {
    const newValue = !useXidAllowList
    dispatch(handleConversationDataUpdate(conversationData, 'use_xid_whitelist', newValue))
  }

  const handleXidRequiredToggle = () => {
    const newValue = !xidRequired
    dispatch(handleConversationDataUpdate(conversationData, 'xid_required', newValue))
  }

  const handleEidRequiredToggle = () => {
    const newValue = !eidRequired
    dispatch(handleConversationDataUpdate(conversationData, 'eid_required', newValue))
  }

  const loadXids = async (newOffset = 0) => {
    if (!conversationId) return
    setLoading(true)
    setError(null)

    try {
      const res = await PolisNet.polisGet('/api/v3/xids', {
        conversation_id: conversationId,
        limit,
        offset: newOffset
      })

      setXids(res?.xids || [])
      setPagination(res?.pagination || null)
    } catch (e) {
      setError(e?.responseText || e?.message || 'Failed to load XIDs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (conversationId) {
      loadXids(0)
    }
  }, [conversationId])

  const handlePageChange = (newOffset) => {
    loadXids(newOffset)
  }

  return (
    <Box>
      <Heading
        as="h3"
        sx={{
          fontSize: [3, null, 4],
          lineHeight: 'body',
          mb: [3, null, 4]
        }}>
        Participant Management
      </Heading>
      <Text sx={{ mb: [3] }}>Manage participants for conversation {conversationId}.</Text>

      <Flex sx={{ alignItems: 'flex-start', mb: [2] }}>
        <Box sx={{ flexShrink: 0, position: 'relative', top: -0.5 }}>
          <input
            type="checkbox"
            data-testid="xid_required"
            checked={xidRequired}
            onChange={handleXidRequiredToggle}
            disabled={useXidAllowList || eidRequired}
          />
        </Box>
        <Box
          sx={{
            ml: [2],
            flex: '1 1 auto',
            maxWidth: ['100%', '100%', '35em'],
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
          <Text>XID Required to Vote</Text>
          {useXidAllowList && (
            <Text sx={{ ml: [2], color: 'mediumGray', fontSize: [0] }}>
              Required because XID Allow List is enabled.
            </Text>
          )}
        </Box>
      </Flex>

      <Flex sx={{ alignItems: 'flex-start', mb: [3] }}>
        <Box sx={{ flexShrink: 0, position: 'relative', top: -0.5 }}>
          <input
            type="checkbox"
            data-testid="use_xid_whitelist"
            checked={useXidAllowList}
            onChange={handleXidAllowListToggle}
            disabled={eidRequired}
          />
        </Box>
        <Box
          sx={{
            ml: [2],
            flex: '1 1 auto',
            maxWidth: ['100%', '100%', '35em'],
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
          <Text>Use XID Allow List</Text>
        </Box>
      </Flex>

      <Flex sx={{ alignItems: 'flex-start', mb: [3] }}>
        <Box sx={{ flexShrink: 0, position: 'relative', top: -0.5 }}>
          <input
            type="checkbox"
            data-testid="eid_required"
            checked={eidRequired}
            onChange={handleEidRequiredToggle}
            disabled={hasXidRequirement}
          />
        </Box>
        <Box
          sx={{
            ml: [2],
            flex: '1 1 auto',
            maxWidth: ['100%', '100%', '35em'],
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
          <Text>Require BankID or Freja eID to participate</Text>
          {hasXidRequirement && (
            <Text sx={{ ml: [2], color: 'mediumGray', fontSize: [0] }}>
              Turn off XID requirements before enabling eID. These identity rules cannot be combined.
            </Text>
          )}
          {eidRequired && (
            <Text sx={{ ml: [2], color: 'mediumGray', fontSize: [0] }}>
              Configure the participant eID login before enabling this requirement.
            </Text>
          )}
        </Box>
      </Flex>

      {/* Tab controls */}
      <Flex sx={{ gap: [2], mb: [3], flexWrap: 'wrap' }}>
        <Button
          variant={activeTab === 'inUse' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setActiveTab('inUse')}>
          XIDs in Use
        </Button>
        <Button
          variant={activeTab === 'allowList' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setActiveTab('allowList')}>
          XIDs Allowed
        </Button>
      </Flex>

      {activeTab === 'inUse' && loading && !xids.length ? (
        <Spinner />
      ) : activeTab === 'inUse' && error ? (
        <Text sx={{ color: 'error', mb: [3] }}>{error}</Text>
      ) : activeTab === 'inUse' && xids.length === 0 ? (
        <Text sx={{ color: 'mediumGray', mb: [3] }}>No XIDs found for this conversation.</Text>
      ) : activeTab === 'inUse' ? (
        <>
          <XidsInUseTable xids={xids} conversationId={conversationId} />
          <Pagination pagination={pagination} onPageChange={handlePageChange} loading={loading} />
        </>
      ) : (
        <XidAllowListTable conversationId={conversationId} />
      )}
    </Box>
  )
}

export default ParticipantManagement
