import PolisNet from '../lib/net'

export interface SubscribeNotificationResponse {
  subscribed?: number
  status?: string
  message?: string
  [key: string]: unknown
}

export async function subscribeToNotifications(payload: {
  conversation_id: string
  email: string
  /** 1 = email notifications (legacy convSubscriptions API) */
  type?: number
}): Promise<SubscribeNotificationResponse> {
  return await PolisNet.polisPost<SubscribeNotificationResponse>('/convSubscriptions', {
    conversation_id: payload.conversation_id,
    email: payload.email,
    type: payload.type ?? 1
  })
}
