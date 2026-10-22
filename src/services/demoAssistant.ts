export type AssistantSection =
  | 'home'
  | 'marketplace'
  | 'payments'
  | 'ai-studio'
  | 'automation'
  | 'learn-languages'
  | 'community'
  | 'travel-booking'
  | 'tourism-heritage'
  | 'ai-assistant'
  | 'notifications'
  | 'my-account'

export type AssistantAuditEntry = {
  id: number
  productId: number
  productName: string
  action: string
  createdAt: string
}

export type DemoAssistantIntent =
  | { type: 'navigate'; section: AssistantSection }
  | { type: 'search'; query: string }
  | { type: 'set-price'; productQuery: string; price: number }
  | { type: 'set-stock'; productQuery: string; stockQuantity: number }
  | { type: 'order-draft'; productQuery: string; quantity: number; unit: string }
  | { type: 'draft'; title: string; kind: string; topic: string }
  | { type: 'prepare-listing'; productName: string }
  | { type: 'prepare-community-post'; title: string; room: string }
  | { type: 'run-automation'; workflow: 'order-follow-up' | 'stock-alert' | 'content-repurpose' }
  | { type: 'complete-lesson'; lesson: 'english' | 'french' | 'mandarin' | 'swahili' }
  | { type: 'contact' }
  | { type: 'checkout'; productQuery: string }
  | { type: 'help' }

const sectionAliases: Record<AssistantSection, string[]> = {
  home: ['home', 'homepage', 'start'],
  marketplace: ['marketplace', 'market', 'product', 'listing', 'seller', 'buy', 'sell', 'quote', 'supplier'],
  payments: ['payment', 'checkout', 'pay', 'money'],
  'ai-studio': ['ai studio', 'content studio', 'draft', 'content', 'caption'],
  automation: ['automation', 'workflow', 'stock reminder', 'follow-up'],
  'learn-languages': ['language', 'lesson', 'learn', 'learning'],
  community: ['community', 'discussion', 'post'],
  'travel-booking': ['booking', 'hotel', 'stay', 'flight', 'air ticket', 'airline', 'package', 'trip'],
  'tourism-heritage': ['tourism', 'heritage', 'travel', 'destination', 'safari'],
  'ai-assistant': ['assistant', 'chatbot', 'chat'],
  notifications: ['notification', 'activity', 'alerts'],
  'my-account': ['account', 'profile', 'dashboard'],
}

export function resolveDemoAssistantIntent(input: string): DemoAssistantIntent {
  const normalized = input.trim().toLowerCase()
  const sectionRequest = /^(?:(?:please|can you|could you)\s+)?(?:go to|open|visit|take me to|navigate to|show me)\s+(?:the\s+)?(.+?)[.!?]*$/.exec(normalized)

  if (sectionRequest) {
    const requestedSection = sectionRequest[1]
    const match = (Object.entries(sectionAliases) as [AssistantSection, string[]][])
      .find(([, aliases]) => aliases.some((alias) => requestedSection.includes(alias)))
    if (match) return { type: 'navigate', section: match[0] }
  }

  const priceRequest = /^(?:please\s+)?(?:set|change|update)\s+(?:the\s+)?(?:retail\s+)?price\s+(?:of|for)\s+(.+?)\s+(?:to|at)\s+([\d,]+)(?:\s*(?:tsh|tzs))?[.!?]*$/i.exec(input.trim())
  if (priceRequest) {
    const price = Number(priceRequest[2].replaceAll(',', ''))
    if (Number.isSafeInteger(price) && price > 0) {
      return { type: 'set-price', productQuery: priceRequest[1].trim(), price }
    }
  }

  const stockRequest = /^(?:please\s+)?(?:reduce|set|update|change)\s+(?:the\s+)?(?:(.+?)\s+stock|stock\s+(?:of|for)\s+(.+?))\s+(?:to|at)\s+([\d,]+)(?:\s+(?:bags?|kg|pieces?|units?))?[.!?]*$/i.exec(input.trim())
  if (stockRequest) {
    const stockQuantity = Number(stockRequest[3].replaceAll(',', ''))
    if (Number.isSafeInteger(stockQuantity) && stockQuantity >= 0) {
      return {
        type: 'set-stock',
        productQuery: (stockRequest[1] ?? stockRequest[2]).trim(),
        stockQuantity,
      }
    }
  }

  const orderDraftRequest = /^order\s+(\d+)\s*(kg|kgs|bags?|pieces?|units?)\s+(.+?)[.!?]*$/i.exec(input.trim())
  if (orderDraftRequest) {
    const quantity = Number(orderDraftRequest[1])
    if (Number.isSafeInteger(quantity) && quantity > 0) {
      return {
        type: 'order-draft',
        quantity,
        unit: orderDraftRequest[2].toLowerCase(),
        productQuery: orderDraftRequest[3].trim(),
      }
    }
  }

  if (/\b(?:contact|support|help desk|email|whatsapp)\b/.test(normalized)) {
    return { type: 'contact' }
  }

  if (/\b(?:plan|book|booking|reserve|trip|stay|hotel|flight|ticket|airline|package|airport|safari|tour)\b/.test(normalized)) {
    return { type: 'navigate', section: 'travel-booking' }
  }

  if (/\b(?:run|start|trigger|execute|test)\b/.test(normalized) && /\b(?:workflow|automation|follow[\s-]?up|restock|low[\s-]?stock|reminder|repurpose)\b/.test(normalized)) {
    if (/\b(?:stock|restock|low[\s-]?stock|reminder)\b/.test(normalized)) {
      return { type: 'run-automation', workflow: 'stock-alert' }
    }
    if (/\b(?:content|repurpose|caption)\b/.test(normalized)) {
      return { type: 'run-automation', workflow: 'content-repurpose' }
    }
    return { type: 'run-automation', workflow: 'order-follow-up' }
  }

  if (/\b(?:mark|set|complete|finish)\b/.test(normalized) && /\b(?:lesson|learning)\b/.test(normalized)) {
    const lesson = /\b(?:swahili|kiswahili)\b/.test(normalized)
      ? 'swahili'
      : /\bfrench\b/.test(normalized)
        ? 'french'
        : /\b(?:chinese|mandarin)\b/.test(normalized)
          ? 'mandarin'
          : 'english'
    return { type: 'complete-lesson', lesson }
  }

  if (/\b(?:community|discussion)\b/.test(normalized) && /\b(?:write|draft|create|start|publish|new)\b/.test(normalized)) {
    const title = input.replace(/^(?:please\s+)?(?:(?:can|could)\s+you\s+|help me\s+)?(?:write|draft|create|start|publish)\s+/i, '')
      .replace(/\b(?:a|an|new|community|discussion|post|about|for me)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const room = /\b(?:tourism|travel|safari)\b/i.test(input)
      ? 'Tourism & Travel'
      : /\b(?:education|career|job|learning)\b/i.test(input)
        ? 'Education & Careers'
        : /\b(?:culture|heritage)\b/i.test(input)
          ? 'Culture & Community Stories'
          : 'Business & Entrepreneurship'
    return { type: 'prepare-community-post', title, room }
  }

  if (/\b(?:start|create|add|publish|list|sell)\b/.test(normalized) && /\b(?:product listing|listing|product for sale|list a product|sell a product)\b/.test(normalized)) {
    const productName = input.replace(/^(?:please\s+)?(?:(?:can|could)\s+you\s+|help me\s+|i want to\s+)?(?:start|create|add|publish|list|sell)\s+/i, '')
      .replace(/\b(?:a|an|new|product|listing|for sale|for me)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^for\s+/i, '')
    return { type: 'prepare-listing', productName }
  }

  if (/\b(?:write|draft|generate|create|make|prepare)\b/.test(normalized) && /\b(?:post|caption|description|script|article|content)\b/.test(normalized)) {
    const kind = /\b(?:video|script)\b/.test(normalized)
      ? 'Video script'
      : /\barticle\b/.test(normalized)
        ? 'Business article'
        : /\b(?:social|caption|post)\b/.test(normalized)
          ? 'Social media post'
          : 'Product description'
    const topic = input
      .replace(/^(?:please\s+)?(?:(?:can|could)\s+you\s+|help me\s+)?(?:write|draft|generate|create|make|prepare)\s+/i, '')
      .replace(/\b(?:a|an|some|social media|social|product|business|video|post|caption|description|script|article|content|about|for me)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const cleanTopic = topic || 'your local business and its offer'
    const title = `${kind === 'Social media post' ? 'Social post' : kind}: ${cleanTopic}`.slice(0, 90)
    return { type: 'draft', title, kind, topic: cleanTopic }
  }

  if (/\b(?:buy|checkout|order)\b/.test(normalized)) {
    const productRequest = /\b(?:buy|checkout|order)\s+(.+?)\s*[.!?]*$/i.exec(input)
    const productQuery = (productRequest?.[1] ?? '')
      .replace(/^(?:(?:the|a|an|some)\s+)+/i, '')
      .replace(/\b(?:please|for me|now)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return { type: 'checkout', productQuery }
  }

  if (/\b(?:search|find|look for|browse)\b/.test(normalized)) {
    const searchRequest = /\b(?:search(?: for)?|find|look for|browse)\s+(.+?)\s*[.!?]*$/i.exec(input)
    const rawQuery = (searchRequest?.[1] ?? '')
      .replace(/^(?:(?:the|a|an|some)\s+)+/i, '')
      .replace(/\b(?:products?|items?|listings?)\b/gi, ' ')
      .replace(/\b(?:in|on) the marketplace\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const query = rawQuery
      .split(/\s+/)
      .map((word) => word.endsWith('ies') ? `${word.slice(0, -3)}y` : word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)
      .join(' ')
    if (query) return { type: 'search', query }
  }

  if (/\b(?:learn|language|lesson|swahili|french|mandarin)\b/.test(normalized)) {
    return { type: 'navigate', section: 'learn-languages' }
  }
  if (/\b(?:tourism|heritage|destination)\b/.test(normalized)) {
    return { type: 'navigate', section: 'tourism-heritage' }
  }
  if (/\b(?:community|discussion)\b/.test(normalized)) {
    return { type: 'navigate', section: 'community' }
  }
  if (/\b(?:notification|activity|alerts)\b/.test(normalized)) {
    return { type: 'navigate', section: 'notifications' }
  }
  if (/\b(?:account|profile|dashboard)\b/.test(normalized)) {
    return { type: 'navigate', section: 'my-account' }
  }
  if (/\b(?:payment|payments|mpesa|m-pesa|mobile money)\b/.test(normalized)) {
    return { type: 'navigate', section: 'payments' }
  }
  if (/\b(?:automation|workflow|stock reminder|follow[\s-]?up)\b/.test(normalized)) {
    return { type: 'navigate', section: 'automation' }
  }
  if (/\b(?:content|caption|draft|article|video script)\b/.test(normalized)) {
    return { type: 'navigate', section: 'ai-studio' }
  }
  if (/\b(?:product|marketplace|seller|supplier|wholesale|quote|buying|selling|list|listing)\b/.test(normalized)) {
    return { type: 'navigate', section: 'marketplace' }
  }

  return { type: 'help' }
}
