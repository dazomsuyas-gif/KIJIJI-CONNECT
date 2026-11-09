import type { DemoAssistantIntent } from './demoAssistant'

export type AssistantToolName =
  | 'products.search'
  | 'orders.prepare-draft'
  | 'seller.propose-change'
  | 'quotes.prepare-handoff'
  | 'travel.prepare-enquiry'
  | 'lessons.open'
  | 'tickets.prepare-handoff'
  | 'prices.compare'
  | 'prices.best-market'
  | 'prices.trend'
  | 'prices.alert-draft'

export type AssistantToolRequest = {
  tool: AssistantToolName
  input: Record<string, string | number>
  requiresConfirmation: boolean
  externalSideEffect: 'none' | 'opens-user-review'
}

export function toolRequestForIntent(intent: DemoAssistantIntent): AssistantToolRequest | null {
  switch (intent.type) {
    case 'search':
      return { tool: 'products.search', input: { query: intent.query }, requiresConfirmation: false, externalSideEffect: 'none' }
    case 'order-draft':
      return {
        tool: 'orders.prepare-draft',
        input: { productQuery: intent.productQuery, quantity: intent.quantity, unit: intent.unit },
        requiresConfirmation: true,
        externalSideEffect: 'none',
      }
    case 'set-price':
      return {
        tool: 'seller.propose-change',
        input: { productQuery: intent.productQuery, field: 'price', value: intent.price },
        requiresConfirmation: true,
        externalSideEffect: 'none',
      }
    case 'set-stock':
      return {
        tool: 'seller.propose-change',
        input: { productQuery: intent.productQuery, field: 'stockQuantity', value: intent.stockQuantity },
        requiresConfirmation: true,
        externalSideEffect: 'none',
      }
    case 'checkout':
      return {
        tool: 'quotes.prepare-handoff',
        input: { productQuery: intent.productQuery },
        requiresConfirmation: true,
        externalSideEffect: 'opens-user-review',
      }
    case 'navigate':
      if (intent.section === 'travel-booking') {
        return { tool: 'travel.prepare-enquiry', input: {}, requiresConfirmation: true, externalSideEffect: 'opens-user-review' }
      }
      if (intent.section === 'learn-languages') {
        return { tool: 'lessons.open', input: {}, requiresConfirmation: false, externalSideEffect: 'none' }
      }
      return null
    case 'contact':
      return { tool: 'tickets.prepare-handoff', input: {}, requiresConfirmation: true, externalSideEffect: 'opens-user-review' }
    case 'price-query':
      return {
        tool: intent.action === 'best' ? 'prices.best-market'
          : intent.action === 'trend' ? 'prices.trend'
            : intent.action === 'alert' ? 'prices.alert-draft'
              : 'prices.compare',
        input: {
          productQuery: intent.productQuery,
          ...(intent.marketQuery ? { marketQuery: intent.marketQuery } : {}),
          ...(intent.targetPrice !== undefined ? { targetPrice: intent.targetPrice } : {}),
        },
        requiresConfirmation: intent.action === 'alert',
        externalSideEffect: 'none',
      }
    default:
      return null
  }
}

export function buildReviewHandoff(
  channel: 'whatsapp' | 'email',
  message: string,
  destination: string,
): string {
  if (!message.trim() || !destination.trim()) {
    throw new Error('A destination and review message are required.')
  }
  if (channel === 'email') {
    return `mailto:${destination}?body=${encodeURIComponent(message)}`
  }
  return `https://wa.me/${destination.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}
