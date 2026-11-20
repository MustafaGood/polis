import { fetchWithEidFallback } from '../eidRequest'

describe('fetchWithEidFallback', () => {
  const originalFetch = global.fetch
  const makeResponse = (status: number, error?: string): Response =>
    ({
      status,
      clone: () => ({
        json: async () => ({ error })
      })
    }) as Response

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('retries an eID-required request using the signed-in OIDC token', async () => {
    const fetchMock = jest
      .mocked(global.fetch)
      .mockResolvedValueOnce(makeResponse(403, 'polis_err_eid_required'))
      .mockResolvedValueOnce(makeResponse(200))
    const getToken = jest.fn().mockResolvedValue('oidc-token')

    const response = await fetchWithEidFallback(
      'http://localhost/api/v3/comments',
      { method: 'POST', headers: { Authorization: 'Bearer participant-token' }, body: '{}' },
      getToken
    )

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const retryOptions = fetchMock.mock.calls[1][1]
    expect(retryOptions?.headers).toEqual({ Authorization: 'Bearer oidc-token' })
    expect(retryOptions?.body).toBe('{}')
  })

  it('does not retry other errors or when there is no OIDC token', async () => {
    const fetchMock = jest
      .mocked(global.fetch)
      .mockResolvedValueOnce(makeResponse(403, 'other_error'))
      .mockResolvedValueOnce(makeResponse(403, 'polis_err_eid_required'))
    const getToken = jest.fn().mockResolvedValue(null)

    expect(
      (await fetchWithEidFallback('http://localhost/', { headers: {} }, getToken)).status
    ).toBe(403)
    expect(getToken).not.toHaveBeenCalled()
    expect(
      (await fetchWithEidFallback('http://localhost/', { headers: {} }, getToken)).status
    ).toBe(403)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry without a participant token or after a successful request', async () => {
    const fetchMock = jest
      .mocked(global.fetch)
      .mockResolvedValueOnce(makeResponse(403, 'polis_err_eid_required'))
      .mockResolvedValueOnce(makeResponse(200))
    const getToken = jest.fn().mockResolvedValue('oidc-token')

    expect((await fetchWithEidFallback('http://localhost/', { headers: {} })).status).toBe(403)
    expect(
      (await fetchWithEidFallback('http://localhost/', { headers: {} }, getToken)).status
    ).toBe(200)
    expect(getToken).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
