import { describe, expect, it } from 'vitest'
import { resolveDemoAssistantIntent } from './demoAssistant'

describe('local assistant marketplace routing', () => {
  it('searches product requests instead of treating every “find” request as travel', () => {
    expect(resolveDemoAssistantIntent('Find avocado products')).toEqual({
      type: 'search',
      query: 'avocado',
    })
  })

  it('continues to route hotel requests to travel planning', () => {
    expect(resolveDemoAssistantIntent('Find a hotel in Arusha for 2 nights')).toEqual({
      type: 'navigate',
      section: 'travel-booking',
    })
  })
})
