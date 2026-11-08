import { describe, expect, it } from 'vitest'
import { resolveDemoAssistantIntent } from './demoAssistant'
import { buildReviewHandoff, toolRequestForIntent } from './assistantTools'

describe('typed assistant tools', () => {
  it('maps sensitive seller and order intents to confirmation-required tools', () => {
    const price = toolRequestForIntent(resolveDemoAssistantIntent('Set price of avocado to 4500'))
    const order = toolRequestForIntent(resolveDemoAssistantIntent('Order 5kg avocado'))
    expect(price).toMatchObject({ tool: 'seller.propose-change', requiresConfirmation: true, externalSideEffect: 'none' })
    expect(order).toMatchObject({ tool: 'orders.prepare-draft', requiresConfirmation: true, externalSideEffect: 'none' })
  })

  it('maps travel and support to review-only handoffs', () => {
    expect(toolRequestForIntent(resolveDemoAssistantIntent('Find a hotel in Arusha'))).toMatchObject({
      tool: 'travel.prepare-enquiry',
      externalSideEffect: 'opens-user-review',
    })
    expect(toolRequestForIntent(resolveDemoAssistantIntent('Contact support'))).toMatchObject({
      tool: 'tickets.prepare-handoff',
      externalSideEffect: 'opens-user-review',
    })
  })

  it('creates user-reviewable links without sending messages', () => {
    const email = buildReviewHandoff('email', 'Please help', 'support@example.com')
    const whatsapp = buildReviewHandoff('whatsapp', 'Please help', '+255 700 000 000')
    expect(email).toMatch(/^mailto:support@example.com\?body=/)
    expect(whatsapp).toMatch(/^https:\/\/wa\.me\/255700000000\?text=/)
  })
})
