import {
  getIduraRedirectUri,
  getIduraReturnTo,
  resolveIduraReturnTo
} from '../iduraRedirect'

describe('getIduraRedirectUri', () => {
  it('uses the fixed callback regardless of the current conversation route', () => {
    expect(getIduraRedirectUri('http://localhost:4321')).toBe(
      'http://localhost:4321/auth/idura/callback'
    )
  })
})

describe('Idura return URL', () => {
  it('preserves the current conversation path and query', () => {
    expect(
      getIduraReturnTo({
        pathname: '/alpha/2demo',
        search: '?ui_lang=sv',
        hash: ''
      })
    ).toBe('/alpha/2demo?ui_lang=sv')
  })

  it('rejects external URLs and the callback itself', () => {
    expect(resolveIduraReturnTo('https://example.com/steal', 'http://localhost:4321')).toBe(
      '/'
    )
    expect(
      resolveIduraReturnTo(
        '/auth/idura/callback/',
        'http://localhost:4321'
      )
    ).toBe('/')
  })
})
